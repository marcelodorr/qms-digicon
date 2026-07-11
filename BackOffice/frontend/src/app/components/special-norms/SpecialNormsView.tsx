import React, { useCallback, useEffect, useState } from 'react';
import { SpecialNormsList } from './SpecialNormsList';
import { SpecialNormForm, SpecialNormFormValues } from './SpecialNormForm';
import { useModulePermission } from '../../permissions/ModulePermissionsContext';
import { getCurrentUserName } from '../../../lib/api';
import { toast } from '../../../lib/toast';
import { MODULE_KEYS } from '../../../lib/module-permissions';
import {
  createSpecialNorm,
  deleteSpecialNorm,
  downloadSpecialNormsTemplate,
  fetchSpecialNorms,
  importSpecialNorms,
  updateSpecialNorm,
  type SpecialNorm,
} from '../../../lib/special-norms';

export function SpecialNormsView() {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [norms, setNorms] = useState<SpecialNorm[]>([]);
  const [editingNorm, setEditingNorm] = useState<SpecialNorm | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const { canEdit } = useModulePermission(MODULE_KEYS.specialNorms);

  const currentUser = getCurrentUserName();

  const loadNorms = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await fetchSpecialNorms();
      setNorms(list);
    } catch (error) {
      console.error("Erro ao carregar normas especiais:", error);
      toast.error("Falha ao carregar normas especiais.");
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

  const handleEdit = (norm: SpecialNorm) => {
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
      await deleteSpecialNorm(id);
      setNorms(prev => prev.filter(n => n.id !== id));
      toast.success('Norma excluída com sucesso.');
    } catch (error) {
      console.error("Erro ao excluir norma especial:", error);
      toast.error("Falha ao excluir norma especial.");
    }
  };

  const handleDeleteSelected = async (ids: string[]) => {
    if (!canEdit) {
      toast.error("Sem permissão para excluir registros.");
      return;
    }
    const uniqueIds = Array.from(new Set(ids));
    if (uniqueIds.length === 0) return;
    if (!confirm(`Tem certeza que deseja excluir ${uniqueIds.length} norma(s) especial(is)?`)) {
      return;
    }

    const results = await Promise.allSettled(uniqueIds.map(id => deleteSpecialNorm(id)));
    const deletedIds = uniqueIds.filter((_, index) => results[index].status === "fulfilled");
    const failedCount = results.length - deletedIds.length;

    if (deletedIds.length > 0) {
      setNorms(prev => prev.filter(norm => !deletedIds.includes(norm.id)));
      toast.success(`${deletedIds.length} norma(s) especial(is) excluída(s) com sucesso.`);
    }
    if (failedCount > 0) {
      toast.error(`Falha ao excluir ${failedCount} norma(s) especial(is).`);
    }
  };

  const handleSave = async (formData: SpecialNormFormValues, observation?: string) => {
    if (!canEdit) {
      toast.error("Sem permissão para salvar registros.");
      return;
    }
    try {
      if (editingNorm) {
        const updatedNorm = await updateSpecialNorm(
          editingNorm.id,
          formData.specialProcess,
          formData.specification,
          formData.revision,
          formData.comment,
          currentUser,
          observation
        );
        setNorms(prev => prev.map(n => n.id === updatedNorm.id ? updatedNorm : n));
        toast.success('Norma atualizada!');
      } else {
        const newNorm = await createSpecialNorm(
          formData.specialProcess,
          formData.specification,
          formData.revision,
          formData.comment,
          currentUser
        );
        setNorms(prev => [...prev, newNorm]);
        toast.success('Norma cadastrada!');
      }
      setView('list');
    } catch (error) {
      console.error("Erro ao salvar norma especial:", error);
      toast.error("Falha ao salvar norma especial.");
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const { blob, filename } = await downloadSpecialNormsTemplate();
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
      const result = await importSpecialNorms(file, currentUser);
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
        <SpecialNormForm 
          initialData={editingNorm} 
          onSubmit={handleSave} 
          onCancel={() => setView('list')} 
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <SpecialNormsList 
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
