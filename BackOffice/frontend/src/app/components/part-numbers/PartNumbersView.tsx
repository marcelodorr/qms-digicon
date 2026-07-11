import React, { useCallback, useEffect, useState } from 'react';
import { PartNumbersList } from './PartNumbersList';
import { PartNumberForm, PartNumberFormValues, type ClientOption } from './PartNumberForm';
import { useModulePermission } from '../../permissions/ModulePermissionsContext';
import { getCurrentUserName } from '../../../lib/api';
import { toast } from '../../../lib/toast';
import { MODULE_KEYS } from '../../../lib/module-permissions';
import {
  createPartNumber,
  deletePartNumber,
  downloadPartNumberTemplate,
  fetchPartNumbers,
  fetchPartNumber,
  importPartNumbers,
  updatePartNumber,
  type PartNumber,
} from '../../../lib/part-numbers';
import { fetchClients } from '../../../lib/clients';

export function PartNumbersView() {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [partNumbers, setPartNumbers] = useState<PartNumber[]>([]);
  const [editingPn, setEditingPn] = useState<PartNumber | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const { canEdit } = useModulePermission(MODULE_KEYS.partNumbers);

  const currentUser = getCurrentUserName();

  const loadPartNumbers = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await fetchPartNumbers();
      setPartNumbers(list);
    } catch (error) {
      console.error("Erro ao carregar Part Numbers:", error);
      toast.error("Falha ao carregar Part Numbers.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadClientes = useCallback(async () => {
    try {
      const clientList = await fetchClients();
      const mapped: ClientOption[] = clientList.map(c => ({
        id: String(c.id),
        name: c.name
      }));
      setClients(mapped);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
    }
  }, []);

  useEffect(() => {
    loadPartNumbers();
    loadClientes();
  }, [loadPartNumbers, loadClientes]);

  useEffect(() => {
    if (!canEdit && view === 'form') {
      setView('list');
    }
  }, [canEdit, view]);

  const handleNew = () => {
    if (!canEdit) {
      toast.error("Sem permissão para criar registros.");
      return;
    }
    setEditingPn(undefined);
    setView('form');
  };

  const handleEdit = async (pn: PartNumber) => {
    if (!canEdit) {
      toast.error("Sem permissão para editar registros.");
      return;
    }
    try {
      const fullData = await fetchPartNumber(pn.id);
      setEditingPn(fullData);
      setView('form');
    } catch (error) {
      console.error("Erro ao carregar Part Number:", error);
      toast.error("Falha ao carregar dados do Part Number.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!canEdit) {
      toast.error("Sem permissão para excluir registros.");
      return;
    }
    if (!confirm('Tem certeza que deseja excluir este Part Number?')) {
      return;
    }

    try {
      await deletePartNumber(id);
      setPartNumbers(prev => prev.filter(p => p.id !== id));
      toast.success('Part Number excluído com sucesso.');
    } catch (error) {
      console.error("Erro ao excluir Part Number:", error);
      toast.error("Falha ao excluir Part Number.");
    }
  };

  const handleDeleteSelected = async (ids: string[]) => {
    if (!canEdit) {
      toast.error("Sem permissão para excluir registros.");
      return;
    }
    const uniqueIds = Array.from(new Set(ids));
    if (uniqueIds.length === 0) return;
    if (!confirm(`Tem certeza que deseja excluir ${uniqueIds.length} Part Number(s)?`)) {
      return;
    }

    const results = await Promise.allSettled(uniqueIds.map(id => deletePartNumber(id)));
    const deletedIds = uniqueIds.filter((_, index) => results[index].status === "fulfilled");
    const failedCount = results.length - deletedIds.length;

    if (deletedIds.length > 0) {
      setPartNumbers(prev => prev.filter(p => !deletedIds.includes(p.id)));
      toast.success(`${deletedIds.length} Part Number(s) excluído(s) com sucesso.`);
    }
    if (failedCount > 0) {
      toast.error(`Falha ao excluir ${failedCount} Part Number(s).`);
    }
  };

  const handleSave = async (formData: PartNumberFormValues, observation?: string) => {
    if (!canEdit) {
      toast.error("Sem permissão para salvar registros.");
      return;
    }
    try {
      if (editingPn) {
        const updatedPn = await updatePartNumber(
          editingPn.id,
          formData.partNumber,
          formData.description,
          formData.revision,
          formData.drawingRevision,
          formData.clientId,
          formData.isActive,
          currentUser,
          observation
        );
        setPartNumbers(prev => prev.map(p => p.id === updatedPn.id ? updatedPn : p));
        toast.success('Part Number atualizado!');
      } else {
        const newPn = await createPartNumber(
          formData.partNumber,
          formData.description,
          formData.revision,
          formData.drawingRevision,
          formData.clientId,
          formData.isActive,
          currentUser
        );
        setPartNumbers(prev => [...prev, newPn]);
        toast.success('Part Number cadastrado!');
      }
      setView('list');
    } catch (error) {
      console.error("Erro ao salvar Part Number:", error);
      toast.error("Falha ao salvar Part Number.");
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const { blob, filename } = await downloadPartNumberTemplate();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao baixar template:", error);
      toast.error("Falha ao baixar o template.");
    }
  };

  const handleImport = async (file: File) => {
    if (!canEdit) {
      toast.error("Sem permissão para importar registros.");
      return;
    }
    try {
      const result = await importPartNumbers(file, currentUser);
      await loadPartNumbers();

      const imported = result?.result?.inserted ?? 0;
      const updated = result?.result?.updated ?? 0;
      const skipped = result?.result?.skipped ?? 0;

      toast.success(`Importação concluída. Inseridos: ${imported}, atualizados: ${updated}, ignorados: ${skipped}.`);
    } catch (error) {
      console.error("Erro ao importar arquivo:", error);
      toast.error("Falha ao importar arquivo.");
    }
  };

  if (view === 'form') {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <PartNumberForm 
          initialData={editingPn} 
          clients={clients}
          onSubmit={handleSave} 
          onCancel={() => setView('list')} 
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <PartNumbersList 
        data={partNumbers}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDeleteSelected={handleDeleteSelected}
        onNew={handleNew}
        onDownloadTemplate={handleDownloadTemplate}
        onImport={handleImport}
        isLoading={isLoading}
        canEdit={canEdit}
      />
    </div>
  );
}
