import React, { useCallback, useEffect, useState } from 'react';
import { OperationsList } from './OperationsList';
import { OperationForm, OperationFormValues } from './OperationForm';
import { useModulePermission } from '../../permissions/ModulePermissionsContext';
import { getCurrentUserName } from '../../../lib/api';
import { toast } from '../../../lib/toast';
import { MODULE_KEYS } from '../../../lib/module-permissions';
import {
  createOperation,
  deleteOperation,
  downloadOperationTemplate,
  fetchOperations,
  importOperations,
  updateOperation,
  type Operation,
} from '../../../lib/operations';

export function OperationsView() {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [operations, setOperations] = useState<Operation[]>([]);
  const [editingOp, setEditingOp] = useState<Operation | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const { canEdit } = useModulePermission(MODULE_KEYS.operations);

  const currentUser = getCurrentUserName();

  const loadOperations = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await fetchOperations();
      setOperations(list);
    } catch (error) {
      console.error("Erro ao carregar operações:", error);
      toast.error("Falha ao carregar operações.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOperations();
  }, [loadOperations]);

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
    setEditingOp(undefined);
    setView('form');
  };

  const handleEdit = (op: Operation) => {
    if (!canEdit) {
      toast.error("Sem permissão para editar registros.");
      return;
    }
    setEditingOp(op);
    setView('form');
  };

  const handleDelete = async (id: string) => {
    if (!canEdit) {
      toast.error("Sem permissão para excluir registros.");
      return;
    }
    if (!confirm('Tem certeza que deseja excluir esta operação?')) {
      return;
    }

    try {
      await deleteOperation(id);
      setOperations(prev => prev.filter(o => o.id !== id));
      toast.success('Operação excluída com sucesso.');
    } catch (error) {
      console.error("Erro ao excluir operação:", error);
      toast.error("Falha ao excluir operação.");
    }
  };

  const handleDeleteSelected = async (ids: string[]) => {
    if (!canEdit) {
      toast.error("Sem permissão para excluir registros.");
      return;
    }
    const uniqueIds = Array.from(new Set(ids));
    if (uniqueIds.length === 0) return;
    if (!confirm(`Tem certeza que deseja excluir ${uniqueIds.length} operação(ões)?`)) {
      return;
    }

    const results = await Promise.allSettled(uniqueIds.map(id => deleteOperation(id)));
    const deletedIds = uniqueIds.filter((_, index) => results[index].status === "fulfilled");
    const failedCount = results.length - deletedIds.length;

    if (deletedIds.length > 0) {
      setOperations(prev => prev.filter(op => !deletedIds.includes(op.id)));
      toast.success(`${deletedIds.length} operação(ões) excluída(s) com sucesso.`);
    }
    if (failedCount > 0) {
      toast.error(`Falha ao excluir ${failedCount} operação(ões).`);
    }
  };

  const handleSave = async (formData: OperationFormValues) => {
    if (!canEdit) {
      toast.error("Sem permissão para salvar registros.");
      return;
    }
    try {
      if (editingOp) {
        const updatedOp = await updateOperation(
          editingOp.id,
          formData.code,
          formData.description,
          currentUser
        );
        setOperations(prev => prev.map(o => o.id === updatedOp.id ? updatedOp : o));
        toast.success('Operação atualizada!');
      } else {
        const newOp = await createOperation(
          formData.code,
          formData.description,
          currentUser
        );
        setOperations(prev => [...prev, newOp]);
        toast.success('Operação cadastrada!');
      }
      setView('list');
    } catch (error) {
      console.error("Erro ao salvar operação:", error);
      toast.error("Falha ao salvar operação.");
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const { blob, filename } = await downloadOperationTemplate();
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
      const result = await importOperations(file, currentUser);
      await loadOperations();

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
        <OperationForm 
          initialData={editingOp} 
          onSubmit={handleSave} 
          onCancel={() => setView('list')} 
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <OperationsList 
        data={operations}
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
