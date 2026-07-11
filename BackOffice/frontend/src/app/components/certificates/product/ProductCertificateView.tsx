import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ProductCertificateList, ProductCertificate } from './ProductCertificateList';
import { ProductCertificateForm, ProductCertificateFormValues, ClientOption, PartNumberOption, POOption, AnalystOption } from './ProductCertificateForm';
import { useModulePermission } from '../../../permissions/ModulePermissionsContext';
import { getCurrentUserName } from '../../../../lib/api';
import { toast } from '../../../../lib/toast';
import { MODULE_KEYS } from '../../../../lib/module-permissions';
import { fetchClients, type Client } from '../../../../lib/clients';
import { fetchPartNumbers, type PartNumber } from '../../../../lib/part-numbers';
import { fetchPurchaseOrders, type PurchaseOrder } from '../../../../lib/purchase-orders';
import { fetchPeople, type Person } from '../../../../lib/people';
import {
  createProductConformityCertificate,
  deleteProductConformityCertificate,
  downloadProductConformityPdf,
  fetchNextProductConformityNumber,
  fetchProductConformityCertificates,
  updateProductConformityCertificate,
  type ProductConformityCertificate,
} from '../../../../lib/product-conformity-certificates';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/alert-dialog";

export function ProductCertificateView() {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [certificates, setCertificates] = useState<ProductCertificate[]>([]);
  const [editingCert, setEditingCert] = useState<ProductCertificate | undefined>(undefined);
  const [draftValues, setDraftValues] = useState<ProductCertificateFormValues | undefined>(undefined);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [partNumbers, setPartNumbers] = useState<PartNumber[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [analysts, setAnalysts] = useState<Person[]>([]);
  const { canEdit } = useModulePermission(MODULE_KEYS.productComplianceCertificates);

  const PRODUCT_CERTIFICATE_ID = "3";

  const currentUser = getCurrentUserName();

  const clientOptions = useMemo<ClientOption[]>(
    () => clients.map(client => ({
      id: client.id,
      name: client.name,
      address: client.address,
    })),
    [clients]
  );

  const partNumberOptions = useMemo<PartNumberOption[]>(
    () => partNumbers.map(pn => {
      return {
        id: pn.id,
        partNumber: pn.partNumber,
        description: pn.description,
        revision: pn.revision,
      };
    }),
    [partNumbers]
  );

  const poOptions = useMemo<POOption[]>(
    () => purchaseOrders.map(po => ({
      id: po.id,
      poNumber: po.poNumber,
      clientId: po.clientId,
      item: po.item,
    })),
    [purchaseOrders]
  );

  const analystOptions = useMemo<AnalystOption[]>(
    () => analysts.map(analyst => ({
      id: analyst.id,
      name: analyst.name,
    })),
    [analysts]
  );

  const parseCustomerPO = (value?: string) => {
    const raw = value?.trim() ?? "";
    if (!raw) {
      return { poNumber: "", item: "" };
    }
    if (raw.includes("|")) {
      const [poNumber, item] = raw.split("|").map(part => part.trim());
      return { poNumber: poNumber ?? "", item: item ?? "" };
    }
    return { poNumber: raw, item: "" };
  };

  const buildCustomerPO = (poNumber: string, item: string) => {
    const poValue = poNumber.trim();
    const itemValue = item.trim();
    if (!poValue) return itemValue;
    if (!itemValue) return poValue;
    return `${poValue} | ${itemValue}`;
  };

  const resolvePartNumberId = useCallback((partNumber?: string) => {
    if (!partNumber) return "";
    return partNumbers.find(pn => pn.partNumber === partNumber)?.id ?? "";
  }, [partNumbers]);

  const resolveClientId = useCallback((clientName?: string) => {
    if (!clientName) return "";
    return clients.find(client => client.name === clientName)?.id ?? "";
  }, [clients]);

  const resolveAnalystId = useCallback((analystName?: string) => {
    if (!analystName) return "";
    return analysts.find(analyst => analyst.name === analystName)?.id ?? "";
  }, [analysts]);

  const resolveDefaultAnalystId = useCallback((certificateId: string) => {
    const match = analysts.find(analyst =>
      analyst.certificates?.some(cert => cert.certificateId === certificateId && cert.isDefault)
    );
    return match?.id ?? "";
  }, [analysts]);

  const resolvePoId = useCallback((poNumber: string, item: string) => {
    if (!poNumber) return "";
    const matchWithItem = purchaseOrders.find(po =>
      po.poNumber === poNumber && (!item || (po.item ?? "") === item)
    );
    if (matchWithItem) return matchWithItem.id;
    return purchaseOrders.find(po => po.poNumber === poNumber)?.id ?? "";
  }, [purchaseOrders]);

  const parseQuantity = (value?: string) => {
    const normalized = String(value ?? "").trim().replace(",", ".");
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const mapCertificate = useCallback((cert: ProductConformityCertificate): ProductCertificate => {
    const { poNumber, item } = parseCustomerPO(cert.customerPO);
    const partNumberId = cert.partNumberId || resolvePartNumberId(cert.partNumber);
    const clientId = cert.customerId || resolveClientId(cert.customerName);
    const analystId = cert.analystId || resolveAnalystId(cert.analystName);
    const poId = resolvePoId(poNumber, item);
    const createdAt = cert.createDate || cert.emissionDate || new Date().toISOString();
    const updatedAt = cert.lastUpdate || createdAt;
    const createdBy = cert.createBy || "Sistema";
    const updatedBy = cert.updateBy || createdBy;

    return {
      id: cert.id,
      code: cert.certificateNumber,
      issueDate: cert.emissionDate || new Date().toISOString(),
      partNumberId,
      partNumber: cert.partNumber,
      clientId,
      clientName: cert.customerName,
      lotNumber: cert.lotNumber ?? "",
      quantity: parseQuantity(cert.quantity),
      poId,
      poNumber,
      item,
      serialNumber: cert.serialNumber ?? "",
      analystId,
      analystName: cert.analystName ?? "",
      type: cert.type || "N/A",
      createdAt,
      createdBy,
      updatedAt,
      updatedBy,
    };
  }, [resolveAnalystId, resolveClientId, resolvePartNumberId, resolvePoId]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [clientList, partNumberList, poList, analystList, certificateList] = await Promise.all([
        fetchClients(),
        fetchPartNumbers(),
        fetchPurchaseOrders(),
        fetchPeople(),
        fetchProductConformityCertificates(),
      ]);

      setClients(clientList);
      setPartNumbers(partNumberList);
      setPurchaseOrders(poList);
      setAnalysts(analystList);
      const mapped = certificateList.map(cert => {
        const { poNumber, item } = parseCustomerPO(cert.customerPO);
        const partNumberId = cert.partNumberId || partNumberList.find(pn => pn.partNumber === cert.partNumber)?.id || "";
        const clientId = cert.customerId || clientList.find(client => client.name === cert.customerName)?.id || "";
        const analystId = cert.analystId || analystList.find(analyst => analyst.name === cert.analystName)?.id || "";
        const poId = poList.find(po =>
          po.poNumber === poNumber && (!item || (po.item ?? "") === item)
        )?.id || poList.find(po => po.poNumber === poNumber)?.id || "";
        const createdAt = cert.createDate || cert.emissionDate || new Date().toISOString();
        const updatedAt = cert.lastUpdate || createdAt;
        const createdBy = cert.createBy || "Sistema";
        const updatedBy = cert.updateBy || createdBy;

        return {
          id: cert.id,
          code: cert.certificateNumber,
          issueDate: cert.emissionDate || new Date().toISOString(),
          partNumberId,
          partNumber: cert.partNumber,
          clientId,
          clientName: cert.customerName,
          lotNumber: cert.lotNumber ?? "",
          quantity: parseQuantity(cert.quantity),
          poId,
          poNumber,
          item,
          serialNumber: cert.serialNumber ?? "",
          analystId,
          analystName: cert.analystName ?? "",
          type: cert.type || "N/A",
          createdAt,
          createdBy,
          updatedAt,
          updatedBy,
        };
      });

      setCertificates(mapped);
    } catch (error) {
      console.error("Erro ao carregar certificados:", error);
      toast.error("Falha ao carregar certificados.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!canEdit && view === 'form') {
      setView('list');
    }
  }, [canEdit, view]);

  const handleNew = async () => {
    if (!canEdit) {
      toast.error("Sem permissão para criar certificados.");
      return;
    }
    setEditingCert(undefined);
    let nextNumber = "";
    try {
      nextNumber = await fetchNextProductConformityNumber(new Date());
    } catch (error) {
      console.error("Erro ao obter próximo número:", error);
      toast.error("Falha ao obter o próximo número.");
    }

    setDraftValues({
      code: nextNumber,
      issueDate: new Date(),
      partNumberId: '',
      clientId: '',
      lotNumber: '',
      quantity: 0,
      poId: '',
      item: '',
      serialNumber: '',
      analystId: resolveDefaultAnalystId(PRODUCT_CERTIFICATE_ID),
      type: 'N/A',
    });
    setView('form');
  };

  const handleEdit = (cert: ProductCertificate) => {
    if (!canEdit) {
      toast.error("Sem permissão para editar certificados.");
      return;
    }
    setEditingCert(cert);
    setDraftValues(undefined);
    setView('form');
  };

  const handleDelete = (id: string) => {
    if (!canEdit) {
      toast.error("Sem permissão para excluir certificados.");
      return;
    }
    setDeleteId(id);
  };

  const handleDeleteSelected = async (ids: string[]) => {
    if (!canEdit) {
      toast.error("Sem permissão para excluir certificados.");
      return;
    }
    const uniqueIds = Array.from(new Set(ids));
    if (uniqueIds.length === 0) return;
    if (!confirm(`Tem certeza que deseja excluir ${uniqueIds.length} certificado(s)?`)) {
      return;
    }

    const results = await Promise.allSettled(uniqueIds.map(id => deleteProductConformityCertificate(id)));
    const deletedIds = uniqueIds.filter((_, index) => results[index].status === "fulfilled");
    const failedCount = results.length - deletedIds.length;

    if (deletedIds.length > 0) {
      setCertificates(prev => prev.filter(cert => !deletedIds.includes(cert.id)));
      toast.success(`${deletedIds.length} certificado(s) excluído(s) com sucesso.`);
    }
    if (failedCount > 0) {
      toast.error(`Falha ao excluir ${failedCount} certificado(s).`);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteProductConformityCertificate(deleteId);
      setCertificates(prev => prev.filter(c => c.id !== deleteId));
      toast.success('Certificado excluído com sucesso.');
    } catch (error) {
      console.error("Erro ao excluir certificado:", error);
      toast.error("Falha ao excluir certificado.");
    } finally {
      setDeleteId(null);
    }
  };

  const toOptionalNumber = (value: string) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && value !== "" ? parsed : null;
  };

  const buildPayload = (formData: ProductCertificateFormValues) => {
    const partNumber = partNumbers.find(pn => pn.id === formData.partNumberId);
    const client = clients.find(c => c.id === formData.clientId);
    const po = purchaseOrders.find(p => p.id === formData.poId);
    const analyst = analysts.find(a => a.id === formData.analystId);

    return {
      CertificateNumber: formData.code.trim(),
      EmissionDate: formData.issueDate.toISOString(),
      PartNumberId: toOptionalNumber(formData.partNumberId),
      PartNumber: partNumber?.partNumber ?? "",
      PartNumberDescription: partNumber?.description ?? "",
      PartNumberRevision: partNumber?.revision ?? "",
      LotNumber: formData.lotNumber.trim(),
      Quantity: String(formData.quantity ?? ""),
      CustomerPO: buildCustomerPO(po?.poNumber ?? "", formData.item),
      Type: formData.type?.trim() || "N/A",
      SerialNumber: formData.serialNumber?.trim(),
      AnalystId: toOptionalNumber(formData.analystId),
      AnalystName: analyst?.name ?? "",
      CustomerId: toOptionalNumber(formData.clientId),
      CustomerName: client?.name ?? "",
      CustomerAddress: client?.address ?? "",
      CreateBy: currentUser,
      UpdateBy: currentUser,
    };
  };

  const saveCertificate = async (formData: ProductCertificateFormValues) => {
    const payload = buildPayload(formData);

    if (editingCert) {
      const updated = await updateProductConformityCertificate(editingCert.id, payload);
      const mapped = mapCertificate(updated);
      setCertificates(prev => prev.map(c => c.id === mapped.id ? mapped : c));
      toast.success('Certificado salvo!');
      return mapped.id;
    }

    const created = await createProductConformityCertificate(payload);
    const mapped = mapCertificate(created);
    setCertificates(prev => [...prev, mapped]);
    toast.success('Certificado criado!');
    return mapped.id;
  };

  const handleSave = async (formData: ProductCertificateFormValues) => {
    if (!canEdit) {
      toast.error("Sem permissão para salvar certificados.");
      return;
    }
    try {
      await saveCertificate(formData);
      setView('list');
      setEditingCert(undefined);
      setDraftValues(undefined);
    } catch (error) {
      console.error("Erro ao salvar certificado:", error);
      toast.error("Falha ao salvar certificado.");
    }
  };

  const handleGenerateById = async (id: string) => {
    try {
      const { blob, filename } = await downloadProductConformityPdf(id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success("PDF gerado!");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Falha ao gerar o PDF.");
    }
  };

  const handleSaveAndGenerate = async (formData: ProductCertificateFormValues) => {
    if (!canEdit) {
      toast.error("Sem permissão para salvar certificados.");
      return;
    }
    try {
      const id = await saveCertificate(formData);
      setView('list');
      setEditingCert(undefined);
      setDraftValues(undefined);
      await handleGenerateById(id);
    } catch (error) {
      console.error("Erro ao salvar e gerar PDF:", error);
      toast.error("Falha ao salvar e gerar o PDF.");
    }
  };

  const handleGenerateFromList = async (cert: ProductCertificate) => {
    await handleGenerateById(cert.id);
  };

  if (view === 'form') {
    const initialFormValues = editingCert ? {
      code: editingCert.code,
      issueDate: new Date(editingCert.issueDate),
      clientId: editingCert.clientId,
      partNumberId: editingCert.partNumberId,
      lotNumber: editingCert.lotNumber,
      quantity: editingCert.quantity,
      poId: editingCert.poId,
      item: editingCert.item,
      serialNumber: editingCert.serialNumber,
      analystId: editingCert.analystId,
      type: editingCert.type,
      createdAt: editingCert.createdAt,
      createdBy: editingCert.createdBy,
      updatedAt: editingCert.updatedAt,
      updatedBy: editingCert.updatedBy,
    } : draftValues;

    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <ProductCertificateForm 
          initialData={initialFormValues}
          clients={clientOptions}
          partNumbers={partNumberOptions}
          pos={poOptions}
          analysts={analystOptions}
          onSave={handleSave} 
          onSaveAndGenerate={handleSaveAndGenerate}
          onCancel={() => setView('list')} 
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <ProductCertificateList 
        data={certificates}
        clients={clientOptions.map(({ id, name }) => ({ id, name }))}
        partNumbers={partNumberOptions.map(({ id, partNumber }) => ({ id, partNumber }))}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDeleteSelected={handleDeleteSelected}
        onNew={handleNew}
        onGeneratePDF={handleGenerateFromList}
        isLoading={isLoading}
        canEdit={canEdit}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o certificado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
