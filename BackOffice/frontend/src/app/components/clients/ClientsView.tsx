import React, { useCallback, useEffect, useState } from 'react';
import { ClientsList } from './ClientsList';
import { ClientForm, ClientFormValues } from './ClientForm';
import { useModulePermission } from '../../permissions/ModulePermissionsContext';
import { getCurrentUserName } from '../../../lib/api';
import { toast } from '../../../lib/toast';
import { MODULE_KEYS } from '../../../lib/module-permissions';
import {
  createClient,
  deleteClient,
  downloadClientTemplate,
  fetchClients,
  importClients,
  updateClient,
  type Client,
} from '../../../lib/clients';

export function ClientsView() {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [clients, setClients] = useState<Client[]>([]);
  const [editingClient, setEditingClient] = useState<Client | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const { canEdit } = useModulePermission(MODULE_KEYS.clients);

  const currentUser = getCurrentUserName();

  const loadClients = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await fetchClients();
      setClients(list);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
      toast.error("Falha ao carregar clientes.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

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
    setEditingClient(undefined);
    setView('form');
  };

  const handleEdit = (client: Client) => {
    if (!canEdit) {
      toast.error("Sem permissão para editar registros.");
      return;
    }
    setEditingClient(client);
    setView('form');
  };

  const handleDelete = async (id: string) => {
    if (!canEdit) {
      toast.error("Sem permissão para excluir registros.");
      return;
    }
    if (!confirm('Tem certeza que deseja excluir este cliente?')) {
      return;
    }

    try {
      await deleteClient(id);
      setClients(prev => prev.filter(c => c.id !== id));
      toast.success('Cliente excluído com sucesso.');
    } catch (error) {
      console.error("Erro ao excluir cliente:", error);
      toast.error("Falha ao excluir cliente.");
    }
  };

  const handleDeleteSelected = async (ids: string[]) => {
    if (!canEdit) {
      toast.error("Sem permissão para excluir registros.");
      return;
    }
    const uniqueIds = Array.from(new Set(ids));
    if (uniqueIds.length === 0) return;
    if (!confirm(`Tem certeza que deseja excluir ${uniqueIds.length} cliente(s)?`)) {
      return;
    }

    const results = await Promise.allSettled(uniqueIds.map(id => deleteClient(id)));
    const deletedIds = uniqueIds.filter((_, index) => results[index].status === "fulfilled");
    const failedCount = results.length - deletedIds.length;

    if (deletedIds.length > 0) {
      setClients(prev => prev.filter(client => !deletedIds.includes(client.id)));
      toast.success(`${deletedIds.length} cliente(s) excluído(s) com sucesso.`);
    }
    if (failedCount > 0) {
      toast.error(`Falha ao excluir ${failedCount} cliente(s).`);
    }
  };

  const handleSave = async (formData: ClientFormValues) => {
    if (!canEdit) {
      toast.error("Sem permissão para salvar registros.");
      return;
    }
    try {
      if (editingClient) {
        const updatedClient = await updateClient(
          editingClient.id,
          formData.name,
          formData.address,
          currentUser
        );
        setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
        toast.success('Cliente atualizado!');
      } else {
        const newClient = await createClient(
          formData.name,
          formData.address,
          currentUser
        );
        setClients(prev => [...prev, newClient]);
        toast.success('Cliente cadastrado!');
      }
      setView('list');
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
      toast.error("Falha ao salvar cliente.");
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const { blob, filename } = await downloadClientTemplate();
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
      const result = await importClients(file, currentUser);
      await loadClients();

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
        <ClientForm 
          initialData={editingClient} 
          onSubmit={handleSave} 
          onCancel={() => setView('list')} 
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <ClientsList 
        data={clients}
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
