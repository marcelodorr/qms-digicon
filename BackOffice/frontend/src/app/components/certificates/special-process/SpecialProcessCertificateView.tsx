import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SpecialProcessCertificateList, SpecialProcessCertificate } from './SpecialProcessCertificateList';
import {
  SpecialProcessCertificateForm,
  SpecialProcessCertificateFormValues,
  ClientOption,
  PartNumberOption,
  POOption,
  ApproverOption,
  SpecialNormOption,
} from './SpecialProcessCertificateForm';
import { useModulePermission } from '../../../permissions/ModulePermissionsContext';
import { getCurrentUserName } from '../../../../lib/api';
import { toast } from '../../../../lib/toast';
import { MODULE_KEYS } from '../../../../lib/module-permissions';
import { fetchClients, type Client } from '../../../../lib/clients';
import { fetchPartNumbers, type PartNumber } from '../../../../lib/part-numbers';
import { fetchPurchaseOrders, type PurchaseOrder } from '../../../../lib/purchase-orders';
import { fetchPeople, type Person } from '../../../../lib/people';
import { fetchParameters, type Parameter } from '../../../../lib/parameters';
import { fetchSpecialNorms, type SpecialNorm } from '../../../../lib/special-norms';
import {
  createSpecialProcessCertificatesBatch,
  deleteSpecialProcessCertificate,
  downloadSpecialProcessCertificatesCombinedPdf,
  downloadSpecialProcessCertificatePdf,
  fetchNextSpecialProcessCertificateCode,
  fetchSpecialProcessCertificateById,
  fetchSpecialProcessCertificates,
  updateSpecialProcessCertificate,
  type SpecialProcessCertificateApi,
  type SpecialProcessCertificateBatchPayload,
  type SpecialProcessCertificatePayload,
} from '../../../../lib/special-process-certificates';
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

const DEFAULT_USER = "Sistema";
const SPECIAL_PROCESS_CERTIFICATE_ID = "2";

const parseQuantity = (value: unknown) => {
  const normalized = String(value ?? "").trim().replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toIsoDate = (value?: string) => {
  if (!value) return new Date().toISOString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
};

const normalizeKey = (value?: string) => value?.trim().toLowerCase() ?? "";

const buildNormOptions = (
  norms: SpecialNorm[],
  parameters: Parameter[],
  partNumbers: PartNumber[]
): SpecialNormOption[] => {
  const partNumberIdByValue = new Map<string, string>();
  partNumbers.forEach(part => {
    const key = normalizeKey(part.partNumber);
    if (key) {
      partNumberIdByValue.set(key, part.id);
    }
  });

  const normsByProcess = new Map<string, SpecialNorm[]>();
  const normsByProcessAndSpec = new Map<string, SpecialNorm[]>();

  norms.forEach(norm => {
    const processKey = normalizeKey(norm.specialProcess);
    if (!processKey) return;

    const list = normsByProcess.get(processKey) ?? [];
    list.push(norm);
    normsByProcess.set(processKey, list);

    const specKey = normalizeKey(norm.specification);
    const compositeKey = `${processKey}||${specKey}`;
    const listBySpec = normsByProcessAndSpec.get(compositeKey) ?? [];
    listBySpec.push(norm);
    normsByProcessAndSpec.set(compositeKey, listBySpec);
  });

  const linkedMap = new Map<string, Set<string>>();
  const normParamMap = new Map<string, Map<string, { parameter?: string; condition?: string; revision?: string; updatedAt: number }>>();

  parameters.forEach(param => {
    const partNumberId = partNumberIdByValue.get(normalizeKey(param.partNumber));
    if (!partNumberId) return;

    const processKey = normalizeKey(param.process);
    if (!processKey) return;

    const normKey = normalizeKey(param.norm);
    const matches = normKey
      ? normsByProcessAndSpec.get(`${processKey}||${normKey}`) ?? []
      : normsByProcess.get(processKey) ?? [];

    matches.forEach(match => {
      const set = linkedMap.get(match.id) ?? new Set<string>();
      set.add(partNumberId);
      linkedMap.set(match.id, set);

      const perNorm = normParamMap.get(match.id) ?? new Map();
      const timestamp = Date.parse(param.updatedAt || param.createdAt || "");
      const updatedAt = Number.isNaN(timestamp) ? 0 : timestamp;
      const existing = perNorm.get(partNumberId);
      if (!existing || updatedAt >= existing.updatedAt) {
        perNorm.set(partNumberId, {
          parameter: param.parameter?.trim(),
          condition: param.condition?.trim(),
          revision: param.normaRevision?.trim(),
          updatedAt,
        });
      }
      normParamMap.set(match.id, perNorm);
    });
  });

  return norms
    .map(norm => {
      const processKey = normalizeKey(norm.specialProcess);
      const normKey = normalizeKey(norm.specification);
      const perNorm = normParamMap.get(norm.id);
      const parameterByPartNumberId: Record<string, string> = {};
      const conditionByPartNumberId: Record<string, string> = {};
      const revisionByPartNumberId: Record<string, string> = {};

      if (perNorm) {
        perNorm.forEach((detail, partNumberId) => {
          if (detail.parameter) parameterByPartNumberId[partNumberId] = detail.parameter;
          if (detail.condition) conditionByPartNumberId[partNumberId] = detail.condition;
          if (detail.revision) revisionByPartNumberId[partNumberId] = detail.revision;
        });
      }

      return {
        id: norm.id,
        specialProcess: norm.specialProcess,
        specification: norm.specification,
        revision: "",
        linkedPartNumberIds: Array.from(linkedMap.get(norm.id) ?? []),
        parameterByPartNumberId,
        conditionByPartNumberId,
        revisionByPartNumberId,
      };
    })
    .filter(option => option.linkedPartNumberIds.length > 0);
};

const resolveProcessId = (raw: Record<string, unknown>, norms: SpecialNormOption[]) => {
  const rawId = raw.SpecialProcessId ?? raw.specialProcessId;
  if (rawId != null) {
    const id = String(rawId);
    if (norms.some(norm => norm.id === id)) {
      return id;
    }
  }

  const process = String(raw.SpecialProcess ?? raw.specialProcess ?? "").trim();
  const norma = String(raw.Norma ?? raw.norma ?? "").trim();
  const processKey = normalizeKey(process);
  const normaKey = normalizeKey(norma);

  if (processKey || normaKey) {
    const exact = norms.find(
      norm =>
        normalizeKey(norm.specialProcess) === processKey &&
        (!normaKey || normalizeKey(norm.specification) === normaKey)
    );
    if (exact) return exact.id;
    const byProcess = norms.find(norm => normalizeKey(norm.specialProcess) === processKey);
    if (byProcess) return byProcess.id;
  }

  return "";
};

const mapApiToCertificate = (
  payload: SpecialProcessCertificateApi,
  clients: Client[],
  partNumbers: PartNumber[],
  purchaseOrders: PurchaseOrder[],
  norms: SpecialNormOption[],
  analysts: Person[],
  fallbackUser: string
): SpecialProcessCertificate => {
  const raw = payload as Record<string, unknown>;
  const id = String(raw.Id ?? raw.id ?? "");
  const code = String(raw.CertificateCode ?? raw.certificateCode ?? "");
  const issueDate = toIsoDate(String(raw.EmissionDate ?? raw.emissionDate ?? ""));
  const createdBy = String(raw.CreateBy ?? raw.createBy ?? fallbackUser);
  const updatedBy = String(raw.UpdateBy ?? raw.updateBy ?? createdBy);
  const createdAt = String(raw.CreateDate ?? raw.createDate ?? issueDate);
  const updatedAt = String(raw.LastUpdate ?? raw.lastUpdate ?? createdAt);

  const clientIdValue = raw.ClienteId ?? raw.clienteId;
  const clientNameValue = raw.ClienteNome ?? raw.clienteNome;
  const clientId = clientIdValue != null
    ? String(clientIdValue)
    : clientNameValue
      ? clients.find(client => client.name === String(clientNameValue))?.id ?? ""
      : "";

  const partNumberValue = raw.PartNumber ?? raw.partNumber;
  const partNumber = partNumberValue ? String(partNumberValue) : "";
  const partNumberId = partNumber
    ? partNumbers.find(item => item.partNumber === partNumber)?.id ?? ""
    : "";

  const poValue = raw.PurchasingOrder ?? raw.purchasingOrder;
  const poNumber = poValue ? String(poValue) : "";
  const poMatch = poNumber ? purchaseOrders.find(item => item.poNumber === poNumber) : undefined;
  const poId = poMatch?.id ?? "";
  const rawItemValue = raw.Item ?? raw.item;
  const item = rawItemValue ? String(rawItemValue) : (poMatch?.item ?? "");

  const analystIdValue = raw.AnalystId ?? raw.analystId;
  const analystNameValue = raw.AnalystName ?? raw.analystName;
  const approverId = analystIdValue != null
    ? String(analystIdValue)
    : analystNameValue
      ? analysts.find(analyst => analyst.name === String(analystNameValue))?.id ?? ""
      : "";

  const foundHardness = String(raw.HardnessFound ?? raw.hardnessFound ?? "");
  const heatTreatmentLot = String(raw.HeatTreatLot ?? raw.heatTreatLot ?? "");
  const observationsValue = raw.Observations ?? raw.observations;
  const observations = observationsValue ? String(observationsValue) : "";

  return {
    id,
    code,
    issueDate,
    clientId,
    partNumberId,
    approverId,
    poId,
    item,
    lotNumber: String(raw.LotNumber ?? raw.lotNumber ?? ""),
    quantity: parseQuantity(raw.Quantity ?? raw.quantity ?? 0),
    processId: resolveProcessId(raw, norms),
    foundHardness: foundHardness || undefined,
    heatTreatmentLot: heatTreatmentLot || undefined,
    observations: observations || undefined,
    createdAt,
    createdBy,
    updatedAt,
    updatedBy,
  };
};

const mapCertificateToFormValues = (
  cert: SpecialProcessCertificate
): SpecialProcessCertificateFormValues => ({
  code: cert.code,
  issueDate: new Date(cert.issueDate),
  clientId: cert.clientId,
  partNumberId: cert.partNumberId,
  approverId: cert.approverId,
  poId: cert.poId,
  item: cert.item,
  lotNumber: cert.lotNumber,
  quantity: cert.quantity,
  processes: [
    {
      processId: cert.processId,
      foundHardness: cert.foundHardness ?? '',
      heatTreatmentLot: cert.heatTreatmentLot ?? '',
    },
  ],
  observations: cert.observations ?? '',
});

export function SpecialProcessCertificateView() {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [certificates, setCertificates] = useState<SpecialProcessCertificate[]>([]);
  const [editingCert, setEditingCert] = useState<SpecialProcessCertificate | undefined>(undefined);
  const [draftValues, setDraftValues] = useState<SpecialProcessCertificateFormValues | undefined>(undefined);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [partNumbers, setPartNumbers] = useState<PartNumber[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [analysts, setAnalysts] = useState<Person[]>([]);
  const [norms, setNorms] = useState<SpecialNorm[]>([]);
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { canEdit } = useModulePermission(MODULE_KEYS.specialProcessCertificates);

  const currentUser = getCurrentUserName(DEFAULT_USER);

  const clientOptions = useMemo<ClientOption[]>(
    () => clients.map(client => ({
      id: client.id,
      name: client.name,
      address: client.address,
    })),
    [clients]
  );

  const partNumberOptions = useMemo<PartNumberOption[]>(
    () => partNumbers.map(pn => ({
      id: pn.id,
      partNumber: pn.partNumber,
      description: pn.description,
    })),
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

  const approverOptions = useMemo<ApproverOption[]>(
    () => analysts.map(analyst => ({
      id: analyst.id,
      name: analyst.name,
    })),
    [analysts]
  );

  const resolveDefaultApproverId = useCallback((certificateId: string) => {
    const match = analysts.find(analyst =>
      analyst.certificates?.some(cert => cert.certificateId === certificateId && cert.isDefault)
    );
    return match?.id ?? "";
  }, [analysts]);

  const normOptions = useMemo<SpecialNormOption[]>(
    () => buildNormOptions(norms, parameters, partNumbers),
    [norms, parameters, partNumbers]
  );

  const mapWithCurrentLists = useCallback(
    (payload: SpecialProcessCertificateApi) =>
      mapApiToCertificate(payload, clients, partNumbers, purchaseOrders, normOptions, analysts, currentUser || DEFAULT_USER),
    [clients, partNumbers, purchaseOrders, normOptions, analysts, currentUser]
  );

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [clientList, partNumberList, poList, analystList, normList, parameterList, certList] = await Promise.all([
        fetchClients(),
        fetchPartNumbers(),
        fetchPurchaseOrders(),
        fetchPeople(),
        fetchSpecialNorms(),
        fetchParameters(),
        fetchSpecialProcessCertificates(),
      ]);

      setClients(clientList);
      setPartNumbers(partNumberList);
      setPurchaseOrders(poList);
      setAnalysts(analystList);
      setNorms(normList);
      setParameters(parameterList);

      const linkedNormOptions = buildNormOptions(normList, parameterList, partNumberList);
      const mapped = certList.map(cert =>
        mapApiToCertificate(cert, clientList, partNumberList, poList, linkedNormOptions, analystList, currentUser || DEFAULT_USER)
      );
      setCertificates(mapped);
    } catch (error) {
      console.error("Erro ao carregar certificados:", error);
      toast.error("Falha ao carregar certificados.");
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

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
    setDraftValues(undefined);
    try {
      const nextCode = await fetchNextSpecialProcessCertificateCode(new Date());
      setDraftValues({
        code: nextCode,
        issueDate: new Date(),
        clientId: '',
        partNumberId: '',
        approverId: resolveDefaultApproverId(SPECIAL_PROCESS_CERTIFICATE_ID),
        poId: '',
        item: '',
        lotNumber: '',
        quantity: 0,
        processes: [],
        observations: '',
      });
      setView('form');
    } catch (error) {
      console.error("Erro ao obter próximo código:", error);
      toast.error("Falha ao obter o próximo código.");
    }
  };

  const handleEdit = async (cert: SpecialProcessCertificate) => {
    if (!canEdit) {
      toast.error("Sem permissão para editar certificados.");
      return;
    }
    setEditingCert(cert);
    setDraftValues(undefined);
    try {
      const full = await fetchSpecialProcessCertificateById(cert.id);
      if (!full) {
        throw new Error("Certificado não encontrado.");
      }
      const mapped = mapWithCurrentLists(full);
      setEditingCert(mapped);
      setDraftValues(mapCertificateToFormValues(mapped));
      setView('form');
    } catch (error) {
      console.error("Erro ao carregar certificado:", error);
      toast.error("Falha ao carregar o certificado.");
    }
  };

  const cleanOptional = (value?: string) => {
    const cleaned = value?.trim() ?? "";
    return cleaned ? cleaned : null;
  };

  const buildBasePayload = (formData: SpecialProcessCertificateFormValues) => {
    const client = clients.find(item => item.id === formData.clientId);
    const partNumber = partNumbers.find(item => item.id === formData.partNumberId);
    const po = purchaseOrders.find(item => item.id === formData.poId);
    const approver = analysts.find(item => item.id === formData.approverId);

    return {
      ClienteId: client?.id ? Number(client.id) : null,
      ClienteNome: client?.name ?? null,
      PartNumber: partNumber?.partNumber ?? null,
      EmissionDate: formData.issueDate ? formData.issueDate.toISOString() : null,
      Quantity: Number.isFinite(formData.quantity) ? String(formData.quantity) : null,
      LotNumber: cleanOptional(formData.lotNumber),
      PurchasingOrder: po?.poNumber ?? null,
      Item: cleanOptional(formData.item),
      AnalystId: approver?.id ? Number(approver.id) : null,
      AnalystName: approver?.name ?? null,
      Observations: cleanOptional(formData.observations),
      CreateBy: currentUser || DEFAULT_USER,
      UpdateBy: currentUser || DEFAULT_USER,
    };
  };

  const buildProcessPayload = (process: SpecialProcessCertificateFormValues['processes'][number]) => {
    const norm = normOptions.find(item => item.id === process.processId);
    return {
      SpecialProcessId: norm?.id ? Number(norm.id) : null,
      SpecialProcess: norm?.specialProcess ?? null,
      Norma: norm?.specification ?? null,
      HardnessFound: cleanOptional(process.foundHardness),
      HeatTreatLot: cleanOptional(process.heatTreatmentLot),
    };
  };

  const saveCertificate = async (formData: SpecialProcessCertificateFormValues) => {
    const basePayload = buildBasePayload(formData);

    if (editingCert) {
      const process = formData.processes[0];
      const payload: SpecialProcessCertificatePayload = {
        ...basePayload,
        ...(process ? buildProcessPayload(process) : {}),
      };
      const updated = await updateSpecialProcessCertificate(editingCert.id, payload);
      const mapped = mapWithCurrentLists(updated);
      setCertificates(prev => prev.map(item => (item.id === mapped.id ? mapped : item)));
      toast.success('Certificado salvo!');
      return [mapped];
    }

    const payload: SpecialProcessCertificateBatchPayload = {
      ...basePayload,
      Processes: formData.processes.map(buildProcessPayload),
    };
    const createdList = await createSpecialProcessCertificatesBatch(payload);
    const mappedList = createdList.map(mapWithCurrentLists);
    setCertificates(prev => [...prev, ...mappedList]);
    toast.success('Certificados criados!');
    return mappedList;
  };

  const handleSave = async (formData: SpecialProcessCertificateFormValues) => {
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
      const { blob, filename } = await downloadSpecialProcessCertificatePdf(id);
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

  const handleSaveAndGenerate = async (formData: SpecialProcessCertificateFormValues) => {
    if (!canEdit) {
      toast.error("Sem permissão para salvar certificados.");
      return;
    }
    try {
      const savedList = await saveCertificate(formData);
      setView('list');
      setEditingCert(undefined);
      setDraftValues(undefined);
      for (const cert of savedList) {
        await handleGenerateById(cert.id);
      }
    } catch (error) {
      console.error("Erro ao salvar e gerar PDF:", error);
      toast.error("Falha ao salvar e gerar o PDF.");
    }
  };

  const handleSaveAndGenerateCombined = async (formData: SpecialProcessCertificateFormValues) => {
    if (!canEdit) {
      toast.error("Sem permissão para salvar certificados.");
      return;
    }
    try {
      const savedList = await saveCertificate(formData);
      setView('list');
      setEditingCert(undefined);
      setDraftValues(undefined);

      const ids = savedList.map(cert => cert.id);
      const { blob, filename } = await downloadSpecialProcessCertificatesCombinedPdf(ids);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success("PDF combinado gerado!");
    } catch (error) {
      console.error("Erro ao salvar e gerar PDF combinado:", error);
      toast.error("Falha ao salvar e gerar o PDF combinado.");
    }
  };

  const handleGenerateFromList = async (cert: SpecialProcessCertificate) => {
    await handleGenerateById(cert.id);
  };

  const handleGenerateCombinedFromList = async (ids: string[]) => {
    try {
      const { blob, filename } = await downloadSpecialProcessCertificatesCombinedPdf(ids);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success("PDF combinado gerado!");
    } catch (error) {
      console.error("Erro ao gerar PDF combinado:", error);
      toast.error("Falha ao gerar o PDF combinado.");
    }
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

    const results = await Promise.allSettled(uniqueIds.map(id => deleteSpecialProcessCertificate(id)));
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
      await deleteSpecialProcessCertificate(deleteId);
      setCertificates(prev => prev.filter(item => item.id !== deleteId));
      toast.success('Certificado excluído com sucesso.');
      setDeleteId(null);
    } catch (error) {
      console.error("Erro ao excluir certificado:", error);
      toast.error("Falha ao excluir certificado.");
    }
  };

  if (view === 'form') {
    const initialFormValues =
      draftValues ?? (editingCert ? {
        ...mapCertificateToFormValues(editingCert),
        createdAt: editingCert.createdAt,
        createdBy: editingCert.createdBy,
        updatedAt: editingCert.updatedAt,
        updatedBy: editingCert.updatedBy,
      } : undefined);

    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <SpecialProcessCertificateForm
          initialData={initialFormValues}
          clients={clientOptions}
          partNumbers={partNumberOptions}
          pos={poOptions}
          approvers={approverOptions}
          norms={normOptions}
          allowMultipleProcesses={!editingCert}
          onSave={handleSave}
          onSaveAndGenerate={handleSaveAndGenerate}
          onSaveAndGenerateCombined={handleSaveAndGenerateCombined}
          onCancel={() => setView('list')}
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <SpecialProcessCertificateList
        data={certificates}
        clients={clientOptions}
        partNumbers={partNumberOptions}
        norms={normOptions}
        purchaseOrders={purchaseOrders}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDeleteSelected={handleDeleteSelected}
        onNew={handleNew}
        onGeneratePDF={handleGenerateFromList}
        onGenerateCombinedPDF={handleGenerateCombinedFromList}
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

      {isLoading && (
        <div className="text-sm text-slate-500">Carregando certificados...</div>
      )}
    </div>
  );
}
