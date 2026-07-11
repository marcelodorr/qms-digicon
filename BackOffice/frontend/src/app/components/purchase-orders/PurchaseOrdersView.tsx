import React, { useCallback, useEffect, useState } from 'react';
import { PurchaseOrdersList } from './PurchaseOrdersList';
import { PurchaseOrderForm, PurchaseOrderFormValues } from './PurchaseOrderForm';
import { useModulePermission } from '../../permissions/ModulePermissionsContext';
import { getCurrentUserName } from '../../../lib/api';
import { toast } from '../../../lib/toast';
import { MODULE_KEYS } from '../../../lib/module-permissions';
import {
  createPurchaseOrder,
  deletePurchaseOrder,
  downloadPurchaseOrderTemplate,
  fetchPurchaseOrders,
  importPurchaseOrders,
  updatePurchaseOrder,
  type PurchaseOrder,
} from '../../../lib/purchase-orders';
import { fetchClients, type Client } from '../../../lib/clients';

export function PurchaseOrdersView() {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [data, setData] = useState<PurchaseOrder[]>([]);
  const [editingItem, setEditingItem] = useState<PurchaseOrder | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const { canEdit } = useModulePermission(MODULE_KEYS.purchaseOrders);

  const currentUser = getCurrentUserName();

  const loadPurchaseOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await fetchPurchaseOrders();
      setData(list);
    } catch (error) {
      console.error("Erro ao carregar POs:", error);
      toast.error("Falha ao carregar ordens de compra.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadClients = useCallback(async () => {
    try {
      const list = await fetchClients();
      setClients(list);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
      toast.error("Falha ao carregar clientes.");
    }
  }, []);

  useEffect(() => {
    loadPurchaseOrders();
    loadClients();
  }, [loadClients, loadPurchaseOrders]);

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
    setEditingItem(undefined);
    setView('form');
  };

  const handleEdit = (item: PurchaseOrder) => {
    if (!canEdit) {
      toast.error("Sem permissão para editar registros.");
      return;
    }
    setEditingItem(item);
    setView('form');
  };

  const handleDelete = async (id: string) => {
    if (!canEdit) {
      toast.error("Sem permissão para excluir registros.");
      return;
    }
    if (!confirm('Tem certeza que deseja excluir esta PO?')) {
      return;
    }

    try {
      await deletePurchaseOrder(id);
      setData(prev => prev.filter(item => item.id !== id));
      toast.success('PO excluída com sucesso.');
    } catch (error) {
      console.error("Erro ao excluir PO:", error);
      toast.error("Falha ao excluir PO.");
    }
  };

  const handleDeleteSelected = async (ids: string[]) => {
    if (!canEdit) {
      toast.error("Sem permissão para excluir registros.");
      return;
    }
    const uniqueIds = Array.from(new Set(ids));
    if (uniqueIds.length === 0) return;
    if (!confirm(`Tem certeza que deseja excluir ${uniqueIds.length} PO(s)?`)) {
      return;
    }

    const results = await Promise.allSettled(uniqueIds.map(id => deletePurchaseOrder(id)));
    const deletedIds = uniqueIds.filter((_, index) => results[index].status === "fulfilled");
    const failedCount = results.length - deletedIds.length;

    if (deletedIds.length > 0) {
      setData(prev => prev.filter(item => !deletedIds.includes(item.id)));
      toast.success(`${deletedIds.length} PO(s) excluída(s) com sucesso.`);
    }
    if (failedCount > 0) {
      toast.error(`Falha ao excluir ${failedCount} PO(s).`);
    }
  };

  const handleSave = async (formData: PurchaseOrderFormValues) => {
    if (!canEdit) {
      toast.error("Sem permissão para salvar registros.");
      return;
    }
    try {
      if (editingItem) {
        const updated = await updatePurchaseOrder(
          editingItem.id,
          formData.poNumber,
          formData.clientId,
          formData.item,
          formData.status,
          formData.comments,
          currentUser
        );
        setData(prev => prev.map(item => item.id === updated.id ? updated : item));
        toast.success('PO atualizada!');
      } else {
        const created = await createPurchaseOrder(
          formData.poNumber,
          formData.clientId,
          formData.item,
          formData.status,
          formData.comments,
          currentUser
        );
        setData(prev => [...prev, created]);
        toast.success('PO cadastrada!');
      }
      setView('list');
    } catch (error) {
      console.error("Erro ao salvar PO:", error);
      toast.error("Falha ao salvar PO.");
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const { blob, filename } = await downloadPurchaseOrderTemplate();
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
      const result = await importPurchaseOrders(file, currentUser);
      await loadPurchaseOrders();

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
        <PurchaseOrderForm 
          initialData={editingItem} 
          onSubmit={handleSave} 
          onCancel={() => setView('list')}
          clients={clients.map(client => ({ id: client.id, name: client.name }))}
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <PurchaseOrdersList 
        data={data}
        clients={clients.map(client => ({ id: client.id, name: client.name }))}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDeleteSelected={handleDeleteSelected}
        onNew={handleNew}
        onImport={handleImport}
        onDownloadTemplate={handleDownloadTemplate}
        isLoading={isLoading}
        canEdit={canEdit}
      />
    </div>
  );
}
