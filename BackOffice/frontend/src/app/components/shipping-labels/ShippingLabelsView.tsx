import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createShippingLabel,
  deleteShippingLabel,
  fetchShippingLabelPrintJob,
  fetchShippingLabelPrintSettings,
  fetchShippingLabelPrinters,
  fetchShippingLabels,
  printShippingLabel,
  saveShippingLabelPrintSettings,
  updateShippingLabel,
  type ShippingLabel,
  type ShippingLabelPrintJob,
  type ShippingLabelPrintSettings,
} from '../../../lib/shipping-labels';
import { fetchPartNumbers, type PartNumber } from '../../../lib/part-numbers';
import { getCurrentUserName } from '../../../lib/api';
import { toast } from '../../../lib/toast';
import { useModulePermission } from '../../permissions/ModulePermissionsContext';
import { MODULE_KEYS } from '../../../lib/module-permissions';
import { ShippingLabelForm, DEFAULT_SHIPPING_LABEL_MODEL, type ShippingLabelFormValues, type ShippingLabelPartNumberOption, type ShippingLabelSubmitAction } from './ShippingLabelForm';
import { ShippingLabelsList } from './ShippingLabelsList';
import { ShippingLabelSettingsSheet } from './ShippingLabelSettingsSheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';

function createEmptyFormValues(): ShippingLabelFormValues {
  return {
    partNumberId: '',
    labelModel: DEFAULT_SHIPPING_LABEL_MODEL,
    referenceDate: new Date(),
    rangeStart: '',
    rangeEnd: '',
  };
}

function toFormValues(label: ShippingLabel): ShippingLabelFormValues {
  return {
    partNumberId: label.partNumberId,
    labelModel: label.labelModel,
    referenceDate: new Date(label.referenceDate),
    rangeStart: String(label.rangeStart),
    rangeEnd: String(label.rangeEnd),
  };
}

function toSavePayload(
  values: ShippingLabelFormValues,
  settings: ShippingLabelPrintSettings,
  currentUser: string
) {
  return {
    partNumberId: values.partNumberId,
    labelModel: values.labelModel,
    referenceDate: values.referenceDate.toISOString(),
    rangeStart: Number(values.rangeStart),
    rangeEnd: Number(values.rangeEnd),
    badgeFontMm: settings.badgeFontMm,
    headerFontMm: settings.headerFontMm,
    countryFontMm: settings.countryFontMm,
    warningFontMm: settings.warningFontMm,
    referenceFontMm: settings.referenceFontMm,
    badgeWidthMm: settings.badgeWidthMm,
    badgeHeightMm: settings.badgeHeightMm,
    badgeStrokeWidthMm: settings.badgeStrokeWidthMm,
    labelWidthMm: settings.widthMm,
    labelHeightMm: settings.heightMm,
    marginLeftMm: settings.marginLeftMm,
    marginTopMm: settings.marginTopMm,
    marginRightMm: settings.marginRightMm,
    marginBottomMm: settings.marginBottomMm,
    badgeLeftMm: settings.badgeLeftMm,
    badgeTopMm: settings.badgeTopMm,
    headerLeftMm: settings.headerLeftMm,
    headerTopMm: settings.headerTopMm,
    headerRightMm: settings.headerRightMm,
    countryLeftMm: settings.countryLeftMm,
    countryTopMm: settings.countryTopMm,
    countryRightMm: settings.countryRightMm,
    warningLeftMm: settings.warningLeftMm,
    warningTopMm: settings.warningTopMm,
    warningRightMm: settings.warningRightMm,
    referenceLeftMm: settings.referenceLeftMm,
    referenceTopMm: settings.referenceTopMm,
    referenceRightMm: settings.referenceRightMm,
    badgeBold: settings.badgeBold,
    headerBold: settings.headerBold,
    countryBold: settings.countryBold,
    warningBold: settings.warningBold,
    referenceBold: settings.referenceBold,
    badgeText: settings.badgeText,
    headerPrefix: settings.headerPrefix,
    assyHeaderPrefix: settings.assyHeaderPrefix,
    countryText: settings.countryText,
    warningText: settings.warningText,
    badgeFontFamily: settings.badgeFontFamily,
    headerFontFamily: settings.headerFontFamily,
    countryFontFamily: settings.countryFontFamily,
    warningFontFamily: settings.warningFontFamily,
    referenceFontFamily: settings.referenceFontFamily,
    printerName: settings.printerName,
    createBy: currentUser,
  };
}

function createFallbackPrintSettings(username: string): ShippingLabelPrintSettings {
  const now = new Date().toISOString();

  return {
    id: '',
    username,
    widthMm: 100,
    heightMm: 50,
    marginLeftMm: 0,
    marginTopMm: 0,
    marginRightMm: 0,
    marginBottomMm: 0,
    badgeLeftMm: 1.4,
    badgeTopMm: 1.4,
    headerLeftMm: 25.7,
    headerTopMm: 1.4,
    headerRightMm: 1.4,
    countryLeftMm: 25.7,
    countryTopMm: 18.8,
    countryRightMm: 1.4,
    warningLeftMm: 1.4,
    warningTopMm: 35,
    warningRightMm: 1.4,
    referenceLeftMm: 1.4,
    referenceTopMm: 43,
    referenceRightMm: 1.4,
    badgeFontMm: 7.5,
    headerFontMm: 5.6,
    countryFontMm: 6.6,
    warningFontMm: 5.6,
    referenceFontMm: 4.8,
    badgeBold: true,
    headerBold: true,
    countryBold: true,
    warningBold: false,
    referenceBold: true,
    badgeText: '283',
    headerPrefix: '|-S-| 73030 -',
    assyHeaderPrefix: '|-S-| 73030 ASSY-',
    countryText: 'BRAZIL',
    warningText: 'MATCHED SET DO NOT ISSUE SEPARATION',
    badgeFontFamily: 'Arial',
    headerFontFamily: 'Arial',
    countryFontFamily: 'Arial',
    warningFontFamily: 'Arial',
    referenceFontFamily: 'Arial',
    badgeWidthMm: 21.5,
    badgeHeightMm: 13.03,
    badgeStrokeWidthMm: 0.35,
    printerName: '',
    createdAt: now,
    updatedAt: now,
  };
}

function applyPrintSettingsToJob(
  printJob: ShippingLabelPrintJob,
  printSettings: ShippingLabelPrintSettings
): ShippingLabelPrintJob {
  return {
    ...printJob,
    printerName: printSettings.printerName,
    badgeFontMm: printSettings.badgeFontMm,
    headerFontMm: printSettings.headerFontMm,
    countryFontMm: printSettings.countryFontMm,
    warningFontMm: printSettings.warningFontMm,
    referenceFontMm: printSettings.referenceFontMm,
    badgeWidthMm: printSettings.badgeWidthMm,
    badgeHeightMm: printSettings.badgeHeightMm,
    badgeStrokeWidthMm: printSettings.badgeStrokeWidthMm,
    widthMm: printSettings.widthMm,
    heightMm: printSettings.heightMm,
    marginLeftMm: printSettings.marginLeftMm,
    marginTopMm: printSettings.marginTopMm,
    marginRightMm: printSettings.marginRightMm,
    marginBottomMm: printSettings.marginBottomMm,
    badgeLeftMm: printSettings.badgeLeftMm,
    badgeTopMm: printSettings.badgeTopMm,
    headerLeftMm: printSettings.headerLeftMm,
    headerTopMm: printSettings.headerTopMm,
    headerRightMm: printSettings.headerRightMm,
    countryLeftMm: printSettings.countryLeftMm,
    countryTopMm: printSettings.countryTopMm,
    countryRightMm: printSettings.countryRightMm,
    warningLeftMm: printSettings.warningLeftMm,
    warningTopMm: printSettings.warningTopMm,
    warningRightMm: printSettings.warningRightMm,
    referenceLeftMm: printSettings.referenceLeftMm,
    referenceTopMm: printSettings.referenceTopMm,
    referenceRightMm: printSettings.referenceRightMm,
    badgeBold: printSettings.badgeBold,
    headerBold: printSettings.headerBold,
    countryBold: printSettings.countryBold,
    warningBold: printSettings.warningBold,
    referenceBold: printSettings.referenceBold,
    badgeText: printSettings.badgeText,
    headerPrefix: printSettings.headerPrefix,
    assyHeaderPrefix: printSettings.assyHeaderPrefix,
    countryText: printSettings.countryText,
    warningText: printSettings.warningText,
    badgeFontFamily: printSettings.badgeFontFamily,
    headerFontFamily: printSettings.headerFontFamily,
    countryFontFamily: printSettings.countryFontFamily,
    warningFontFamily: printSettings.warningFontFamily,
    referenceFontFamily: printSettings.referenceFontFamily,
  };
}

export function ShippingLabelsView() {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [labels, setLabels] = useState<ShippingLabel[]>([]);
  const [partNumbers, setPartNumbers] = useState<PartNumber[]>([]);
  const [settings, setSettings] = useState<ShippingLabelPrintSettings | null>(null);
  const [printers, setPrinters] = useState<string[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editingLabel, setEditingLabel] = useState<ShippingLabel | undefined>(undefined);
  const [draftValues, setDraftValues] = useState<ShippingLabelFormValues | undefined>(undefined);
  const [pendingPrintRecord, setPendingPrintRecord] = useState<ShippingLabel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const { canEdit } = useModulePermission(MODULE_KEYS.shippingLabels);

  const currentUser = getCurrentUserName();
  const effectiveSettings = settings || createFallbackPrintSettings(currentUser);

  const partNumberOptions = useMemo<ShippingLabelPartNumberOption[]>(
    () => partNumbers.map((item) => ({
      id: item.id,
      partNumber: item.partNumber,
      description: item.description,
      revision: item.revision,
    })),
    [partNumbers]
  );

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [labelsList, partNumbersList, settingsData, printersList] = await Promise.all([
        fetchShippingLabels(),
        fetchPartNumbers(),
        fetchShippingLabelPrintSettings(currentUser),
        fetchShippingLabelPrinters().catch(() => []),
      ]);

      setLabels(labelsList);
      setPartNumbers(partNumbersList);
      setSettings(settingsData);
      setPrinters(printersList);
    } catch (error) {
      console.error('Erro ao carregar etiquetas:', error);
      toast.error('Falha ao carregar o módulo de etiquetas.');
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

  const handleNew = () => {
    if (!canEdit) {
      toast.error('Sem permissão para criar etiquetas.');
      return;
    }

    setEditingLabel(undefined);
    setDraftValues(createEmptyFormValues());
    setSettingsOpen(false);
    setView('form');
  };

  const handleEdit = (label: ShippingLabel) => {
    if (!canEdit) {
      toast.error('Sem permissão para editar etiquetas.');
      return;
    }

    setEditingLabel(label);
    setDraftValues(toFormValues(label));
    setSettingsOpen(false);
    setView('form');
  };

  const handleDelete = async (id: string) => {
    if (!canEdit) {
      toast.error('Sem permissão para excluir etiquetas.');
      return;
    }

    if (!window.confirm('Tem certeza que deseja excluir esta etiqueta?')) {
      return;
    }

    try {
      await deleteShippingLabel(id);
      setLabels((current) => current.filter((item) => item.id !== id));
      toast.success('Etiqueta excluída com sucesso.');
    } catch (error) {
      console.error('Erro ao excluir etiqueta:', error);
      toast.error('Falha ao excluir a etiqueta.');
    }
  };

  const handleDeleteSelected = async (ids: string[]) => {
    if (!canEdit) {
      toast.error('Sem permissão para excluir etiquetas.');
      return;
    }

    const uniqueIds = Array.from(new Set(ids));
    if (uniqueIds.length === 0) return;

    if (!window.confirm(`Tem certeza que deseja excluir ${uniqueIds.length} etiqueta(s)?`)) {
      return;
    }

    const results = await Promise.allSettled(uniqueIds.map((id) => deleteShippingLabel(id)));
    const deletedIds = uniqueIds.filter((_, index) => results[index].status === 'fulfilled');
    const failedCount = uniqueIds.length - deletedIds.length;

    if (deletedIds.length > 0) {
      setLabels((current) => current.filter((item) => !deletedIds.includes(item.id)));
      toast.success(`${deletedIds.length} etiqueta(s) excluída(s) com sucesso.`);
    }

    if (failedCount > 0) {
      toast.error(`Falha ao excluir ${failedCount} etiqueta(s).`);
    }
  };

  const handleSaveSettings = async (settingsPayload: {
    username: string;
    widthMm: number;
    heightMm: number;
    marginLeftMm: number;
    marginTopMm: number;
    marginRightMm: number;
    marginBottomMm: number;
    badgeLeftMm: number;
    badgeTopMm: number;
    headerLeftMm: number;
    headerTopMm: number;
    headerRightMm: number;
    countryLeftMm: number;
    countryTopMm: number;
    countryRightMm: number;
    warningLeftMm: number;
    warningTopMm: number;
    warningRightMm: number;
    referenceLeftMm: number;
    referenceTopMm: number;
    referenceRightMm: number;
    badgeWidthMm: number;
    badgeHeightMm: number;
    badgeStrokeWidthMm: number;
    badgeFontMm: number;
    headerFontMm: number;
    countryFontMm: number;
    warningFontMm: number;
    referenceFontMm: number;
    badgeBold: boolean;
    headerBold: boolean;
    countryBold: boolean;
    warningBold: boolean;
    referenceBold: boolean;
    badgeText: string;
    headerPrefix: string;
    assyHeaderPrefix: string;
    countryText: string;
    warningText: string;
    badgeFontFamily: string;
    headerFontFamily: string;
    countryFontFamily: string;
    warningFontFamily: string;
    referenceFontFamily: string;
    printerName: string;
  }) => {
    setIsSavingSettings(true);
    try {
      const savedSettings = await saveShippingLabelPrintSettings(settingsPayload);
      setSettings(savedSettings);
      toast.success('Configuração da etiqueta salva.');
    } catch (error) {
      console.error('Erro ao salvar configuração da etiqueta:', error);
      toast.error(error instanceof Error ? error.message : 'Falha ao salvar a configuração.');
      throw error;
    } finally {
      setIsSavingSettings(false);
    }
  };

  const performPrint = async (label: ShippingLabel, printSettings?: ShippingLabelPrintSettings) => {
    const printJob = await fetchShippingLabelPrintJob(label.id);
    await printShippingLabel(printSettings ? applyPrintSettingsToJob(printJob, printSettings) : printJob);
  };

  const handlePrintFromList = async (label: ShippingLabel) => {
    try {
      const latestSettings = await fetchShippingLabelPrintSettings(currentUser);
      setSettings(latestSettings);
      await performPrint(label, latestSettings);
      toast.success('Janela de impressão aberta.');
    } catch (error) {
      console.error('Erro ao imprimir etiqueta:', error);
      toast.error('Falha ao imprimir a etiqueta.');
    }
  };

  const handleFormSubmit = async (values: ShippingLabelFormValues, action: ShippingLabelSubmitAction) => {
    if (!canEdit) {
      toast.error('Sem permissão para salvar etiquetas.');
      return;
    }

    if (!settings) {
      toast.error('Configuração da etiqueta ainda não foi carregada.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = toSavePayload(values, settings, currentUser);
      const savedLabel = editingLabel
        ? await updateShippingLabel(editingLabel.id, payload)
        : await createShippingLabel(payload);

      setLabels((current) => {
        if (editingLabel) {
          return current.map((item) => item.id === savedLabel.id ? savedLabel : item);
        }
        return [savedLabel, ...current];
      });

      if (action === 'save') {
        setEditingLabel(savedLabel);
        setDraftValues(toFormValues(savedLabel));
        toast.success('Etiqueta salva.');
        return;
      }

      if (action === 'saveAndClose') {
        setEditingLabel(undefined);
        setDraftValues(undefined);
        setView('list');
        toast.success('Etiqueta salva.');
        return;
      }

      setEditingLabel(savedLabel);
      setDraftValues(toFormValues(savedLabel));
      await performPrint(savedLabel);
      toast.success('Etiqueta salva e janela de impressão aberta.');
      setPendingPrintRecord(savedLabel);
    } catch (error) {
      console.error('Erro ao salvar etiqueta:', error);
      toast.error(error instanceof Error ? error.message : 'Falha ao salvar a etiqueta.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseAfterPrint = () => {
    setPendingPrintRecord(null);
    setEditingLabel(undefined);
    setDraftValues(undefined);
    setView('list');
  };

  const handleGenerateAnother = () => {
    setPendingPrintRecord(null);
    setEditingLabel(undefined);
    setDraftValues(createEmptyFormValues());
    setView('form');
  };

  if (view === 'form') {
    const initialFormValues = draftValues
      ? {
          ...draftValues,
          createdAt: editingLabel?.createdAt,
          createdBy: editingLabel?.createdBy,
          updatedAt: editingLabel?.updatedAt,
        }
      : undefined;

    return (
      <>
        <div className="p-6 max-w-7xl mx-auto space-y-6">
          <ShippingLabelForm
            initialData={initialFormValues}
            partNumbers={partNumberOptions}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setEditingLabel(undefined);
              setDraftValues(undefined);
              setView('list');
            }}
            isSaving={isSaving}
          />
        </div>

        <ShippingLabelSettingsSheet
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          settings={effectiveSettings}
          printers={printers}
          username={currentUser}
          onSave={handleSaveSettings}
          isSaving={isSavingSettings}
        />

        <Dialog open={!!pendingPrintRecord} onOpenChange={(open) => !open && setPendingPrintRecord(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Janela de impressão aberta</DialogTitle>
              <DialogDescription>
                Confirme ou cancele a impressão no gerenciador do computador. Deseja gerar outra etiqueta ou fechar?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseAfterPrint}>
                Fechar
              </Button>
              <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleGenerateAnother}>
                Gerar outra
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <ShippingLabelsList
        data={labels}
        onNew={handleNew}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDeleteSelected={handleDeleteSelected}
        onPrint={handlePrintFromList}
        onConfigure={() => setSettingsOpen(true)}
        isLoading={isLoading}
        canEdit={canEdit}
      />

      <ShippingLabelSettingsSheet
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={effectiveSettings}
        printers={printers}
        username={currentUser}
        onSave={handleSaveSettings}
        isSaving={isSavingSettings}
      />
    </div>
  );
}
