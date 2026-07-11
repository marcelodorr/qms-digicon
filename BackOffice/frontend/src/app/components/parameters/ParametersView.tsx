import React, { useCallback, useEffect, useState } from 'react';
import { ParametersList } from './ParametersList';
import { ParameterForm, ParameterFormValues } from './ParameterForm';
import { useModulePermission } from '../../permissions/ModulePermissionsContext';
import { getCurrentUserName } from '../../../lib/api';
import { toast } from 'sonner';
import { MODULE_KEYS } from '../../../lib/module-permissions';
import {
  createParameter,
  deleteParameter,
  downloadParametersTemplate,
  fetchParameters,
  importParameters,
  updateParameter,
  type Parameter,
} from '../../../lib/parameters';

export function ParametersView() {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [editingParam, setEditingParam] = useState<Parameter | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const { canEdit } = useModulePermission(MODULE_KEYS.parameters);

  const currentUser = getCurrentUserName();

  const loadParameters = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await fetchParameters();
      setParameters(list);
    } catch (error) {
      console.error("Erro ao carregar parâmetros:", error);
      toast.error("Falha ao carregar parâmetros.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadParameters();
  }, [loadParameters]);

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
    setEditingParam(undefined);
    setView('form');
  };

  const handleEdit = (param: Parameter) => {
    if (!canEdit) {
      toast.error("Sem permissão para editar registros.");
      return;
    }
    setEditingParam(param);
    setView('form');
  };

  const handleDelete = async (id: string) => {
    if (!canEdit) {
      toast.error("Sem permissão para excluir registros.");
      return;
    }
    if (!confirm('Tem certeza que deseja excluir este parâmetro?')) {
      return;
    }

    try {
      await deleteParameter(id);
      setParameters(prev => prev.filter(p => p.id !== id));
      toast.success('Parâmetro excluído com sucesso.');
    } catch (error) {
      console.error("Erro ao excluir parâmetro:", error);
      toast.error("Falha ao excluir parâmetro.");
    }
  };

  const handleDeleteSelected = async (ids: string[]) => {
    if (!canEdit) {
      toast.error("Sem permissão para excluir registros.");
      return;
    }
    const uniqueIds = Array.from(new Set(ids));
    if (uniqueIds.length === 0) return;
    if (!confirm(`Tem certeza que deseja excluir ${uniqueIds.length} parâmetro(s)?`)) {
      return;
    }

    const results = await Promise.allSettled(uniqueIds.map(id => deleteParameter(id)));
    const deletedIds = uniqueIds.filter((_, index) => results[index].status === "fulfilled");
    const failedCount = results.length - deletedIds.length;

    if (deletedIds.length > 0) {
      setParameters(prev => prev.filter(param => !deletedIds.includes(param.id)));
      toast.success(`${deletedIds.length} parâmetro(s) excluído(s) com sucesso.`);
    }
    if (failedCount > 0) {
      toast.error(`Falha ao excluir ${failedCount} parâmetro(s).`);
    }
  };

  const handleSave = async (formData: ParameterFormValues) => {
    if (!canEdit) {
      toast.error("Sem permissão para salvar registros.");
      return;
    }
    try {
      if (editingParam) {
        const updatedParam = await updateParameter(
          editingParam.id,
          formData.partNumber,
          formData.process,
          formData.norm,
          formData.parameter,
          formData.condition,
          currentUser
        );
        setParameters(prev => prev.map(p => p.id === updatedParam.id ? updatedParam : p));
        toast.success('Parâmetro atualizado!');
      } else {
        const newParam = await createParameter(
          formData.partNumber,
          formData.process,
          formData.norm,
          formData.parameter,
          formData.condition,
          currentUser
        );
        setParameters(prev => [...prev, newParam]);
        toast.success('Parâmetro cadastrado!');
      }
      setView('list');
    } catch (error) {
      console.error("Erro ao salvar parâmetro:", error);
      toast.error("Falha ao salvar parâmetro.");
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const { blob, filename } = await downloadParametersTemplate();
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
      const result = await importParameters(file, currentUser);
      await loadParameters();

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
        <ParameterForm 
          initialData={editingParam} 
          onSubmit={handleSave} 
          onCancel={() => setView('list')} 
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <ParametersList 
        data={parameters}
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
