import React, { useCallback, useEffect, useState } from 'react';
import { NormsList } from './NormsList';
import { NormForm, NormFormValues } from './NormForm';
import { useModulePermission } from '../../permissions/ModulePermissionsContext';
import { getCurrentUserName } from '../../../lib/api';
import { toast } from '../../../lib/toast';
import { MODULE_KEYS } from '../../../lib/module-permissions';
import {
  createNorm,
  deleteNorm,
  downloadNormsTemplate,
  fetchNorms,
  importNorms,
  updateNorm,
  type Norm,
} from '../../../lib/norms';
import { fetchOperations, type Operation } from '../../../lib/operations';
import { fetchClients, type Client } from '../../../lib/clients';

export function NormsView() {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [norms, setNorms] = useState<Norm[]>([]);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [editingNorm, setEditingNorm] = useState<Norm | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const { canEdit } = useModulePermission(MODULE_KEYS.norms);

  const currentUser = getCurrentUserName();

  const loadNorms = useCallback(async () => {
    setIsLoading(true);
    try {
      const [list, ops, clientsList] = await Promise.all([
        fetchNorms(),
        fetchOperations(),
        fetchClients(),
      ]);
      setNorms(list);
      setOperations(ops);
      setClients(clientsList);
    } catch (error) {
      console.error("Erro ao carregar normas:", error);
      toast.error("Falha ao carregar normas.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNorms();
  }, [loadNorms]);

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
    setEditingNorm(undefined);
    setView('form');
  };

  const handleEdit = (norm: Norm) => {
    if (!canEdit) {
      toast.error("Sem permissão para editar registros.");
      return;
    }
    setEditingNorm(norm);
    setView('form');
  };

  const handleDelete = async (id: string) => {
    if (!canEdit) {
      toast.error("Sem permissão para excluir registros.");
      return;
    }
    if (!confirm('Tem certeza que deseja excluir esta norma?')) {
      return;
    }

    try {
      await deleteNorm(id);
      setNorms(prev => prev.filter(n => n.id !== id));
      toast.success('Norma excluída com sucesso.');
    } catch (error) {
      console.error("Erro ao excluir norma:", error);
      toast.error("Falha ao excluir norma.");
    }
  };

  const handleDeleteSelected = async (ids: string[]) => {
    if (!canEdit) {
      toast.error("Sem permissão para excluir registros.");
      return;
    }
    const uniqueIds = Array.from(new Set(ids));
    if (uniqueIds.length === 0) return;
    if (!confirm(`Tem certeza que deseja excluir ${uniqueIds.length} norma(s)?`)) {
      return;
    }

    const results = await Promise.allSettled(uniqueIds.map(id => deleteNorm(id)));
    const deletedIds = uniqueIds.filter((_, index) => results[index].status === "fulfilled");
    const failedCount = results.length - deletedIds.length;

    if (deletedIds.length > 0) {
      setNorms(prev => prev.filter(norm => !deletedIds.includes(norm.id)));
      toast.success(`${deletedIds.length} norma(s) excluída(s) com sucesso.`);
    }
    if (failedCount > 0) {
      toast.error(`Falha ao excluir ${failedCount} norma(s).`);
    }
  };

  const handleSave = async (formData: NormFormValues) => {
    if (!canEdit) {
      toast.error("Sem permissão para salvar registros.");
      return;
    }
    try {
      if (editingNorm) {
        const updatedNorm = await updateNorm(
          editingNorm.id,
          formData.client,
          formData.process,
          formData.standard,
          formData.revision,
          currentUser
        );
        setNorms(prev => prev.map(n => n.id === updatedNorm.id ? updatedNorm : n));
        toast.success('Norma atualizada!');
      } else {
        const newNorm = await createNorm(
          formData.client,
          formData.process,
          formData.standard,
          formData.revision,
          currentUser
        );
        setNorms(prev => [...prev, newNorm]);
        toast.success('Norma cadastrada!');
      }
      setView('list');
    } catch (error) {
      console.error("Erro ao salvar norma:", error);
      toast.error("Falha ao salvar norma.");
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const { blob, filename } = await downloadNormsTemplate();
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
      const result = await importNorms(file, currentUser);
      await loadNorms();

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
        <NormForm 
          initialData={editingNorm} 
          operations={operations}
          clients={clients}
          onSubmit={handleSave} 
          onCancel={() => setView('list')} 
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <NormsList 
        data={norms}
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
