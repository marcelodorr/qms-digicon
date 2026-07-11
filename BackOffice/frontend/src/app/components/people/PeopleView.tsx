import React, { useCallback, useEffect, useState } from 'react';
import { PeopleList } from './PeopleList';
import { PersonForm, type PersonFormValues } from './PersonForm';
import { useModulePermission } from '../../permissions/ModulePermissionsContext';
import { getCurrentUserName } from '../../../lib/api';
import { toast } from '../../../lib/toast';
import { MODULE_KEYS } from '../../../lib/module-permissions';
import {
  createPerson,
  deletePerson,
  downloadPeopleTemplate,
  fetchPeople,
  importPeople,
  updatePerson,
  type Person,
} from '../../../lib/people';

export function PeopleView() {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [people, setPeople] = useState<Person[]>([]);
  const [editingPerson, setEditingPerson] = useState<Person | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const { canEdit } = useModulePermission(MODULE_KEYS.people);
  
  const currentUser = getCurrentUserName();

  const loadPeople = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await fetchPeople();
      setPeople(list);
    } catch (error) {
      console.error("Erro ao carregar pessoas:", error);
      toast.error("Falha ao carregar pessoas.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPeople();
  }, [loadPeople]);

  useEffect(() => {
    if (!canEdit && view === 'form') {
      setView('list');
    }
  }, [canEdit, view]);

  const applyDefaultCertificates = (list: Person[], currentId: string, currentCertificates: Person["certificates"]) => {
    const defaultCerts = new Set(
      currentCertificates.filter(cert => cert.isDefault).map(cert => cert.certificateId)
    );

    if (defaultCerts.size === 0) {
      return list;
    }

    return list.map(person => {
      if (person.id === currentId || person.certificates.length === 0) {
        return person;
      }

      let hasChange = false;
      const updatedCerts = person.certificates.map(cert => {
        if (defaultCerts.has(cert.certificateId) && cert.isDefault) {
          hasChange = true;
          return { ...cert, isDefault: false };
        }
        return cert;
      });

      return hasChange ? { ...person, certificates: updatedCerts } : person;
    });
  };

  const handleNew = () => {
    if (!canEdit) {
      toast.error("Sem permissão para criar registros.");
      return;
    }
    setEditingPerson(undefined);
    setView('form');
  };

  const handleEdit = (person: Person) => {
    if (!canEdit) {
      toast.error("Sem permissão para editar registros.");
      return;
    }
    setEditingPerson(person);
    setView('form');
  };

  const handleDelete = async (id: string) => {
    if (!canEdit) {
      toast.error("Sem permissão para excluir registros.");
      return;
    }
    if (!confirm('Tem certeza que deseja excluir este registro?')) {
      return;
    }

    try {
      await deletePerson(id);
      setPeople(prev => prev.filter(p => p.id !== id));
      toast.success('Pessoa excluída com sucesso.');
    } catch (error) {
      console.error("Erro ao excluir pessoa:", error);
      toast.error("Falha ao excluir pessoa.");
    }
  };

  const handleDeleteSelected = async (ids: string[]) => {
    if (!canEdit) {
      toast.error("Sem permissão para excluir registros.");
      return;
    }
    const uniqueIds = Array.from(new Set(ids));
    if (uniqueIds.length === 0) return;
    if (!confirm(`Tem certeza que deseja excluir ${uniqueIds.length} pessoa(s)?`)) {
      return;
    }

    const results = await Promise.allSettled(uniqueIds.map(id => deletePerson(id)));
    const deletedIds = uniqueIds.filter((_, index) => results[index].status === "fulfilled");
    const failedCount = results.length - deletedIds.length;

    if (deletedIds.length > 0) {
      setPeople(prev => prev.filter(person => !deletedIds.includes(person.id)));
      toast.success(`${deletedIds.length} pessoa(s) excluída(s) com sucesso.`);
    }
    if (failedCount > 0) {
      toast.error(`Falha ao excluir ${failedCount} pessoa(s).`);
    }
  };

  const handleSave = async (formData: PersonFormValues) => {
    if (!canEdit) {
      toast.error("Sem permissão para salvar registros.");
      return;
    }
    const certificates = formData.certificates ?? [];
    const signatureUrl = formData.signatureUrl ?? undefined;

    try {
      if (editingPerson) {
        const updated = await updatePerson(
          editingPerson.id,
          formData.name,
          formData.email,
          signatureUrl,
          currentUser,
          certificates
        );
        const updatedPerson = { ...updated };
        setPeople(prev => {
          const replaced = prev.map(p => p.id === updatedPerson.id ? updatedPerson : p);
          return applyDefaultCertificates(replaced, updatedPerson.id, updatedPerson.certificates);
        });
        toast.success('Cadastro atualizado!');
      } else {
        const created = await createPerson(
          formData.name,
          formData.email,
          signatureUrl,
          currentUser,
          certificates
        );
        const newPerson = { ...created };
        setPeople(prev => applyDefaultCertificates([...prev, newPerson], newPerson.id, newPerson.certificates));
        toast.success('Pessoa cadastrada!');
      }
      setView('list');
    } catch (error) {
      console.error("Erro ao salvar pessoa:", error);
      toast.error("Falha ao salvar pessoa.");
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const { blob, filename } = await downloadPeopleTemplate();
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
      const result = await importPeople(file, currentUser);
      await loadPeople();

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
        <PersonForm 
          initialData={editingPerson} 
          onSubmit={handleSave} 
          onCancel={() => setView('list')} 
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <PeopleList 
        data={people}
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
