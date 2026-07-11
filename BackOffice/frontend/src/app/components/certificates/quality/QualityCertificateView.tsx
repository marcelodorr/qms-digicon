import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { QualityCertificateList, QualityCertificate } from './QualityCertificateList';
import { QualityCertificateForm, QualityCertificateFormValues, ClientOption, PartNumberOption, AnalystOption } from './QualityCertificateForm';
import { useModulePermission } from '../../../permissions/ModulePermissionsContext';
import { getCurrentUserName } from '../../../../lib/api';
import { toast } from '../../../../lib/toast';
import { MODULE_KEYS } from '../../../../lib/module-permissions';
import { fetchClients, type Client } from '../../../../lib/clients';
import { fetchPartNumbers, type PartNumber } from '../../../../lib/part-numbers';
import { fetchPeople, type Person } from '../../../../lib/people';
import { fetchOperations, type Operation } from '../../../../lib/operations';
import {
  createQualityCertificate,
  deleteQualityCertificate,
  downloadQualityCertificatePdf,
  fetchNextQualityCertificateNumber,
  fetchQualityCertificateById,
  fetchQualityCertificateList,
  updateQualityCertificate,
  type QualityCertificateApi,
  type QualityCertificateListItem,
  type QualityCertificatePayload,
} from '../../../../lib/quality-certificates';
import {
  fetchControleElebFinalizadas,
  fetchControleElebByOp,
  fetchControleElebDetails,
  liberarControleElebPorId,
  type ControleEleb,
  type ControleElebDetail,
} from '../../../../lib/controle-eleb';
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

const parseQuantity = (value?: string) => {
  const normalized = String(value ?? "").trim().replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const parseBoolean = (value?: string) => {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (!normalized) return false;
  return ["1", "sim", "s", "true", "yes", "y"].includes(normalized);
};

const parseRevisaoDesenho = (value?: string) => {
  const raw = value?.trim() ?? "";
  if (!raw) {
    return { sheet: "1", revision: "" };
  }

  const normalized = raw.replace(/\s+/g, " ");
  const match = normalized.match(/folha\s*([^\s]+).*rev(?:is[aã]o)?\s*([^\s]+)/i);
  if (match) {
    return { sheet: match[1], revision: match[2] };
  }

  const sheetOnlyMatch = normalized.match(/folha\s*([^\s]+)/i);
  if (sheetOnlyMatch) {
    return { sheet: sheetOnlyMatch[1], revision: "" };
  }

  if (normalized.includes("|")) {
    const [sheet, revision] = normalized.split("|").map(part => part.trim());
    return { sheet: sheet || "1", revision: revision || "" };
  }

  if (normalized.includes("/")) {
    const [sheet, revision] = normalized.split("/").map(part => part.trim());
    return { sheet: sheet || "1", revision: revision || "" };
  }

  return { sheet: normalized, revision: "" };
};

const formatRevisaoDesenho = (sheet?: string, revision?: string) => {
  const cleanSheet = sheet?.trim() ?? "";
  const cleanRevision = revision?.trim() ?? "";
  if (cleanSheet && cleanRevision) {
    return `Folha ${cleanSheet} Rev ${cleanRevision}`;
  }
  if (cleanSheet) {
    return `Folha ${cleanSheet}`;
  }
  if (cleanRevision) {
    return `Rev ${cleanRevision}`;
  }
  return "";
};

const splitOperations = (value?: string) => {
  if (!value) return [];
  return value
    .split("|")
    .map(op => op.trim())
    .filter(op => op.length > 0);
};

const QUALITY_CERTIFICATE_ID = "1";

export function QualityCertificateView() {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [certificates, setCertificates] = useState<QualityCertificate[]>([]);
  const [editingCert, setEditingCert] = useState<QualityCertificate | undefined>(undefined);
  const [draftValues, setDraftValues] = useState<QualityCertificateFormValues | undefined>(undefined);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [partNumbers, setPartNumbers] = useState<PartNumber[]>([]);
  const [analysts, setAnalysts] = useState<Person[]>([]);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [controleElebs, setControleElebs] = useState<ControleEleb[]>([]);
  const [selectedControleEleb, setSelectedControleEleb] = useState<ControleEleb | null>(null);
  const [orderDetails, setOrderDetails] = useState<ControleElebDetail[]>([]);
  const [isOrderDetailsLoading, setIsOrderDetailsLoading] = useState(false);
  const { canEdit } = useModulePermission(MODULE_KEYS.qualityCertificates);

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
      revision: pn.revision,
      drawingRevision: pn.drawingRevision,
    })),
    [partNumbers]
  );

  const analystOptions = useMemo<AnalystOption[]>(
    () => analysts.map(analyst => ({
      id: analyst.id,
      name: analyst.name,
    })),
    [analysts]
  );

  const operationOptions = useMemo(() => {
    const mapped = operations
      .map(op => (op.description || op.code).trim())
      .filter(op => op.length > 0);
    return Array.from(new Set(mapped));
  }, [operations]);

  const orderOptions = useMemo(() => {
    const set = new Set<string>();
    controleElebs.forEach(item => {
      const op = (item.opEleb ?? "").trim();
      if (op) {
        set.add(op);
      }
    });

    const editingOrder = editingCert?.orderNumber?.trim();
    if (editingOrder) {
      set.add(editingOrder);
    }

    const draftOrder = draftValues?.orderNumber?.trim();
    if (draftOrder) {
      set.add(draftOrder);
    }

    return Array.from(set);
  }, [controleElebs, editingCert, draftValues]);

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

  const mapListItemToCertificate = useCallback(
    (item: QualityCertificateListItem, clientList: Client[], partNumberList: PartNumber[]): QualityCertificate => {
      const clientId = clientList.find(client => client.name === item.cliente)?.id ?? "";
      const partNumberId = partNumberList.find(pn => pn.partNumber === item.partNumber)?.id ?? "";
      const issueDate = item.data ? new Date(item.data).toISOString() : new Date().toISOString();
      const createdAtDate = item.createDate ? new Date(item.createDate) : null;
      const createdAt = createdAtDate && !Number.isNaN(createdAtDate.getTime()) ? createdAtDate.toISOString() : issueDate;
      const createdBy = item.createBy?.trim() || currentUser || DEFAULT_USER;
      const updatedBy = item.updateBy?.trim() || createdBy;

      return {
        id: item.id,
        code: item.numero,
        issueDate,
        partNumberId,
        partNumber: item.partNumber,
        clientId,
        clientName: item.cliente,
        lotNumber: item.lote ?? "",
        quantity: 0,
        poId: "",
        item: item.ordem ?? "",
        serialNumber: "",
        analystId: "",
        type: "N/A",
        createdAt,
        createdBy,
        updatedAt: createdAt,
        updatedBy,
        orderNumber: item.ordem ?? "",
        ocNumber: item.oc ?? "",
      };
    },
    [currentUser]
  );

  const mapApiToCertificate = useCallback((payload: QualityCertificateApi): QualityCertificate => {
    const raw = payload as Record<string, unknown>;
    const id = String(raw.Id ?? raw.id ?? "");
    const code = String(raw.NumeroCertificado ?? raw.numeroCertificado ?? "");
    const issueDate = String(raw.Data ?? raw.data ?? raw.CreateDate ?? raw.createDate ?? new Date().toISOString());
    const partNumber = String(raw.PartNumber ?? raw.partNumber ?? "");
    const clientName = String(raw.Cliente ?? raw.cliente ?? "");
    const analystName = String(raw.AnalystName ?? raw.analystName ?? "");
    const drawingValue = String(raw.RevisaoDesenho ?? raw.revisaoDesenho ?? "");
    const { sheet, revision } = parseRevisaoDesenho(drawingValue);
    const createdAt = issueDate || new Date().toISOString();
    const createdBy = String(raw.CreateBy ?? raw.createBy ?? DEFAULT_USER);
    const updatedBy = String(raw.UpdateBy ?? raw.updateBy ?? raw.CreateBy ?? raw.createBy ?? DEFAULT_USER);

    const decapSerialRaw =
      raw.SNDecapagem ??
      raw.snDecapagem ??
      raw.SN_Decap ??
      raw.sn_decap ??
      raw.SnDecap ??
      raw.snDecap ??
      "";
    const decapSerial = typeof decapSerialRaw === "string" ? decapSerialRaw : String(decapSerialRaw ?? "");

    return {
      id,
      code,
      issueDate,
      partNumberId: resolvePartNumberId(partNumber),
      partNumber,
      clientId: resolveClientId(clientName),
      clientName,
      lotNumber: String(raw.Lote ?? raw.lote ?? ""),
      quantity: parseQuantity(String(raw.Quantidade ?? raw.quantidade ?? "")),
      poId: "",
      item: String(raw.Ordem ?? raw.ordem ?? ""),
      serialNumber: String(raw.SNPeca ?? raw.snPeca ?? ""),
      analystId: String(raw.AnalystId ?? raw.analystId ?? resolveAnalystId(analystName) ?? ""),
      analystName,
      type: "N/A",
      createdAt,
      createdBy,
      updatedAt: String(raw.LastUpdate ?? raw.lastUpdate ?? createdAt),
      updatedBy,
      orderNumber: String(raw.Ordem ?? raw.ordem ?? ""),
      ocNumber: String(raw.OC ?? raw.oc ?? ""),
      clientCode: String(raw.CodigoCliente ?? raw.codigoCliente ?? ""),
      productValue: String(raw.ValorPeca ?? raw.valorPeca ?? ""),
      poAnalysis: String(raw.AnalisePo ?? raw.analisePo ?? ""),
      hasCdOrTicket: parseBoolean(String(raw.CDChamado ?? raw.cdChamado ?? "")),
      drawingSheet: sheet,
      revision,
      drawingLpRevision: String(raw.DesenhoLP ?? raw.desenhoLP ?? ""),
      strippingPerformed: Boolean(decapSerial.trim()),
      strippingSerial: decapSerial,
      observations: String(raw.Observacoes ?? raw.observacoes ?? ""),
      supplier: String(raw.Fornecedor ?? raw.fornecedor ?? ""),
      inspectionReport: String(raw.RelatorioInspecao ?? raw.relatorioInspecao ?? ""),
      mpCertificate: String(raw.CertificadoMP ?? raw.certificadoMP ?? ""),
      shipmentType: String(raw.TipoEnvio ?? raw.tipoEnvio ?? ""),
      operations: splitOperations(String(raw.DescricaoOperacao ?? raw.descricaoOperacao ?? "")),
    };
  }, [resolvePartNumberId, resolveClientId, resolveAnalystId]);

  const toFormValues = (cert: QualityCertificate): QualityCertificateFormValues => ({
    code: cert.code,
    issueDate: new Date(cert.issueDate),
    clientId: cert.clientId,
    partNumberId: cert.partNumberId,
    lotNumber: cert.lotNumber,
    quantity: cert.quantity,
    poId: cert.poId,
    item: cert.item,
    serialNumber: cert.serialNumber,
    analystId: cert.analystId,
    type: cert.type,
    orderNumber: cert.orderNumber || '',
    ocNumber: cert.ocNumber || '',
    clientCode: cert.clientCode || '',
    productValue: cert.productValue || '',
    poAnalysis: cert.poAnalysis || '',
    hasCdOrTicket: cert.hasCdOrTicket || false,
    drawingSheet: cert.drawingSheet || '1',
    revision: cert.revision || '',
    drawingLpRevision: cert.drawingLpRevision || '',
    strippingPerformed: cert.strippingPerformed || false,
    strippingSerial: cert.strippingSerial || '',
    observations: cert.observations || '',
    supplier: cert.supplier || '',
    inspectionReport: cert.inspectionReport || '',
    mpCertificate: cert.mpCertificate || '',
    shipmentType: cert.shipmentType || '',
    operations: cert.operations || [],
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [clientList, partNumberList, analystList, operationList, controleList, certificateList] = await Promise.all([
        fetchClients(),
        fetchPartNumbers(),
        fetchPeople(),
        fetchOperations(),
        fetchControleElebFinalizadas(),
        fetchQualityCertificateList(),
      ]);

      setClients(clientList);
      setPartNumbers(partNumberList);
      setAnalysts(analystList);
      setOperations(operationList);
      setControleElebs(controleList);

      const mapped = certificateList.map(item => mapListItemToCertificate(item, clientList, partNumberList));
      setCertificates(mapped);
    } catch (error) {
      console.error("Erro ao carregar certificados:", error);
      toast.error("Falha ao carregar certificados.");
    } finally {
      setIsLoading(false);
    }
  }, [mapListItemToCertificate]);

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
    setSelectedControleEleb(null);
    try {
      const nextNumber = await fetchNextQualityCertificateNumber(new Date());
      setDraftValues({
        code: nextNumber,
        issueDate: new Date(),
        clientId: '',
        partNumberId: '',
        lotNumber: '',
        quantity: 0,
        poId: '',
        item: '',
        serialNumber: '',
        analystId: resolveDefaultAnalystId(QUALITY_CERTIFICATE_ID),
        type: 'N/A',
        orderNumber: '',
        ocNumber: '',
        clientCode: '',
        productValue: '',
        poAnalysis: '',
        hasCdOrTicket: false,
        drawingSheet: '1',
        revision: '',
        drawingLpRevision: '',
        strippingPerformed: false,
        strippingSerial: '',
        observations: '',
        supplier: 'Digicon',
        inspectionReport: 'N/A',
        mpCertificate: 'N/A',
        shipmentType: '',
        operations: [],
      });
      setView('form');
    } catch (error) {
      console.error("Erro ao obter próximo número:", error);
      toast.error("Falha ao obter o próximo número.");
    }
  };

  const handleEdit = async (cert: QualityCertificate) => {
    if (!canEdit) {
      toast.error("Sem permissão para editar certificados.");
      return;
    }
    setEditingCert(cert);
    setDraftValues(undefined);
    setSelectedControleEleb(null);
    try {
      const full = await fetchQualityCertificateById(cert.id);
      if (!full) {
        throw new Error("Certificado não encontrado.");
      }
      const mapped = mapApiToCertificate(full);
      setEditingCert(mapped);
      setDraftValues(toFormValues(mapped));
      setView('form');
    } catch (error) {
      console.error("Erro ao carregar certificado:", error);
      toast.error("Falha ao carregar certificado.");
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

    const results = await Promise.allSettled(uniqueIds.map(id => deleteQualityCertificate(id)));
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
      await deleteQualityCertificate(deleteId);
      setCertificates(prev => prev.filter(item => item.id !== deleteId));
      toast.success('Certificado excluído com sucesso.');
      setDeleteId(null);
    } catch (error) {
      console.error("Erro ao excluir certificado:", error);
      toast.error("Falha ao excluir certificado.");
    }
  };

  const handleOrderLookup = useCallback(async (orderNumber: string) => {
    const poValue = orderNumber.trim();
    if (!poValue) {
      setSelectedControleEleb(null);
      setOrderDetails([]);
      return null;
    }

    try {
      const matches = controleElebs.filter(item => item.opEleb?.trim() === poValue);
      let controle = matches.length > 0
        ? [...matches].sort((a, b) => Number(b.id) - Number(a.id))[0]
        : null;

      if (!controle) {
        controle = await fetchControleElebByOp(poValue);
      }
      if (!controle) {
        toast.error("Ordem não encontrada no Controle Eleb.");
        setSelectedControleEleb(null);
        setOrderDetails([]);
        return null;
      }

      const resolvedOrder = controle.opEleb?.trim() || poValue;
      setSelectedControleEleb(controle);

      const values: Partial<QualityCertificateFormValues> = {
        orderNumber: resolvedOrder,
        ocNumber: controle.poEleb || poValue,
        clientCode: controle.codEleb || "",
        hasCdOrTicket: parseBoolean(controle.cd || ""),
        drawingLpRevision: controle.revisaoDesenho || "",
        serialNumber: controle.snPeca || "",
        strippingSerial: controle.snDecap || "",
        lotNumber: controle.lote || "",
        quantity: parseQuantity(controle.qtdSaldo || ""),
        strippingPerformed: Boolean((controle.snDecap ?? "").trim() || (controle.decapagem ?? "").trim()),
        productValue: controle.valorPeca || "",
        supplier: "Digicon",
        poAnalysis: controle.analisePo || "",
        inspectionReport: "N/A",
        mpCertificate: "N/A",
        drawingSheet: "1",
        revision: "",
      };

      if (controle.partNumber) {
        const partNumberId = resolvePartNumberId(controle.partNumber);
        if (partNumberId) {
          values.partNumberId = partNumberId;
        } else {
          toast.error("Part Number não encontrado no cadastro.");
        }
      }

      if (controle.cliente) {
        const clientId = resolveClientId(controle.cliente);
        if (clientId) {
          values.clientId = clientId;
        } else {
          toast.error("Cliente não encontrado no cadastro.");
        }
      }

      if (!editingCert) {
        setIsOrderDetailsLoading(true);
        try {
          const details = await fetchControleElebDetails(resolvedOrder);
          setOrderDetails(details);
        } catch (detailError) {
          console.error("Erro ao carregar detalhes da ordem:", detailError);
          toast.error("Falha ao carregar detalhes da ordem.");
          setOrderDetails([]);
        } finally {
          setIsOrderDetailsLoading(false);
        }
      }

      return values;
    } catch (error) {
      console.error("Erro ao buscar Controle Eleb:", error);
      toast.error("Falha ao carregar dados do Controle Eleb.");
      return null;
    }
  }, [controleElebs, editingCert, resolveClientId, resolvePartNumberId]);

  const toOptionalNumber = (value?: string) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && value !== "" ? parsed : null;
  };

  const buildPayload = (
    formData: QualityCertificateFormValues,
    controle: ControleEleb | null,
    includeCode: boolean,
    useControleFallback: boolean
  ): QualityCertificatePayload => {
    const client = clients.find(c => c.id === formData.clientId);
    const partNumber = partNumbers.find(pn => pn.id === formData.partNumberId);
    const analyst = analysts.find(a => a.id === formData.analystId);

    const clean = (value?: string) => value?.trim() ?? "";
    const coalesce = (value?: string, fallback?: string) => {
      const cleaned = clean(value);
      if (cleaned) return cleaned;
      return clean(fallback);
    };

    const operations = (formData.operations ?? [])
      .map(op => op.trim())
      .filter(op => op.length > 0);
    const descricaoOperacao = operations.length > 0 ? operations.join(" | ") : "";
    const quantidade = formData.quantity > 0 ? String(formData.quantity) : "";
    const fornecedor = clean(formData.supplier) || "Digicon";
    const relatorioInspecao = clean(formData.inspectionReport) || "N/A";
    const certificadoMP = clean(formData.mpCertificate) || "N/A";

    return {
      ControleElebId: controle?.id ? Number(controle.id) : null,
      NumeroCertificado: includeCode ? clean(formData.code) || null : null,
      Ordem: coalesce(formData.orderNumber, controle?.opEleb),
      OC: useControleFallback ? coalesce(formData.ocNumber, controle?.poEleb) : formData.ocNumber,
      Lote: useControleFallback ? coalesce(formData.lotNumber, controle?.lote) : formData.lotNumber,
      CodigoCliente: useControleFallback ? coalesce(formData.clientCode, controle?.codEleb) : formData.clientCode,
      PartNumber: useControleFallback ? coalesce(partNumber?.partNumber, controle?.partNumber) : partNumber?.partNumber ?? undefined,
      ValorPeca: useControleFallback ? coalesce(formData.productValue, controle?.valorPeca) : formData.productValue,
      AnalisePo: useControleFallback ? coalesce(formData.poAnalysis, controle?.analisePo) : formData.poAnalysis,
      RevisaoDesenho: useControleFallback
        ? coalesce(formatRevisaoDesenho(formData.drawingSheet, formData.revision), controle?.revisaoDesenho)
        : formatRevisaoDesenho(formData.drawingSheet, formData.revision),
      Quantidade: quantidade || (useControleFallback ? coalesce(undefined, controle?.qtdSaldo) : undefined),
      Decapagem: formData.strippingPerformed
        ? useControleFallback
          ? coalesce(undefined, controle?.decapagem) || "Sim"
          : "Sim"
        : "Nao",
      SNDecapagem: useControleFallback ? coalesce(formData.strippingSerial, controle?.snDecap) : formData.strippingSerial,
      CDChamado: formData.hasCdOrTicket
        ? useControleFallback
          ? coalesce(undefined, controle?.cd) || "Sim"
          : "Sim"
        : "Nao",
      Cliente: useControleFallback ? coalesce(client?.name, controle?.cliente) : client?.name,
      Fornecedor: fornecedor,
      RelatorioInspecao: relatorioInspecao,
      CertificadoMP: certificadoMP,
      Responsavel: analyst?.name ?? null,
      AnalystId: toOptionalNumber(formData.analystId),
      AnalystName: analyst?.name ?? null,
      DesenhoLP: clean(formData.drawingLpRevision),
      Observacoes: clean(formData.observations),
      SNPeca: coalesce(formData.serialNumber, controle?.snPeca),
      TipoEnvio: clean(formData.shipmentType),
      DescricaoOperacao: descricaoOperacao,
      OperacoesExecutadas: operations.length > 0 ? operations : null,
      Data: formData.issueDate.toISOString(),
      UpdateBy: currentUser || DEFAULT_USER,
    };
  };

  const resolveControleEleb = async (orderNumber: string, ocNumber?: string) => {
    const trimmedOrder = orderNumber.trim();
    const trimmedOc = ocNumber?.trim() ?? "";
    if (!trimmedOrder && !trimmedOc) return null;

    try {
      const selectedOp = selectedControleEleb?.opEleb?.trim();
      if (selectedControleEleb && selectedOp && selectedOp === trimmedOrder) {
        return selectedControleEleb;
      }
      if (trimmedOrder) {
        return await fetchControleElebByOp(trimmedOrder);
      }
      return null;
    } catch (error) {
      console.warn("Falha ao buscar Controle Eleb:", error);
      return null;
    }
  };

  const saveCertificate = async (formData: QualityCertificateFormValues) => {
    let controleEleb: ControleEleb | null = null;
    if (!editingCert) {
      controleEleb = await resolveControleEleb(formData.orderNumber || "", formData.ocNumber || "");
    }
    if (editingCert) {
      const payload = buildPayload(formData, null, false, false);
      const updated = await updateQualityCertificate(editingCert.id, payload);
      const mapped = mapApiToCertificate(updated);
      setCertificates(prev => prev.map(cert => cert.id === mapped.id ? mapped : cert));
      toast.success('Certificado salvo!');
      return mapped;
    }

    const payload = buildPayload(formData, controleEleb, true, true);
    const created = await createQualityCertificate(payload);
    const mapped = mapApiToCertificate(created);
    setCertificates(prev => [...prev, mapped]);
    toast.success('Certificado criado!');

    if (controleEleb?.id && mapped.code) {
      try {
        await liberarControleElebPorId(controleEleb.id, mapped.code);
      } catch (error) {
        console.warn("Falha ao liberar OP no Controle Eleb:", error);
      }
    }

    return mapped;
  };

  const handleSave = async (formData: QualityCertificateFormValues) => {
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

  const handleGenerateByNumero = async (numero: string) => {
    try {
      const { blob, filename } = await downloadQualityCertificatePdf(numero);
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

  const handleSaveAndGenerate = async (formData: QualityCertificateFormValues) => {
    if (!canEdit) {
      toast.error("Sem permissão para salvar certificados.");
      return;
    }
    try {
      const saved = await saveCertificate(formData);
      setView('list');
      setEditingCert(undefined);
      setDraftValues(undefined);
      await handleGenerateByNumero(saved.code);
    } catch (error) {
      console.error("Erro ao salvar e gerar PDF:", error);
      toast.error("Falha ao salvar e gerar o PDF.");
    }
  };

  const handleGenerateFromList = async (cert: QualityCertificate) => {
    await handleGenerateByNumero(cert.code);
  };

  if (view === 'form') {
    const initialFormValues = draftValues ?? (editingCert ? {
      ...toFormValues(editingCert),
      createdAt: editingCert.createdAt,
      createdBy: editingCert.createdBy,
      updatedAt: editingCert.updatedAt,
      updatedBy: editingCert.updatedBy,
    } : undefined);

    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <QualityCertificateForm 
          initialData={initialFormValues}
          clients={clientOptions}
          partNumbers={partNumberOptions}
          pos={[]}
          analysts={analystOptions}
          orderOptions={orderOptions}
          operationsOptions={operationOptions}
          orderDetails={orderDetails}
          isOrderDetailsLoading={isOrderDetailsLoading}
          showOrderDetails={!editingCert}
          onOrderLookup={handleOrderLookup}
          onSave={handleSave} 
          onSaveAndGenerate={handleSaveAndGenerate}
          onCancel={() => setView('list')} 
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <QualityCertificateList 
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
