import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '../ui/sheet';
import { cn } from '../ui/utils';
import type { ShippingLabelPrintSettings } from '../../../lib/shipping-labels';

interface ShippingLabelSettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: ShippingLabelPrintSettings;
  printers: string[];
  username: string;
  onSave: (settings: {
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
  }) => void | Promise<void>;
  isSaving?: boolean;
}

type SettingsDraft = {
  widthMm: string;
  heightMm: string;
  marginLeftMm: string;
  marginTopMm: string;
  marginRightMm: string;
  marginBottomMm: string;
  badgeLeftMm: string;
  badgeTopMm: string;
  headerLeftMm: string;
  headerTopMm: string;
  headerRightMm: string;
  countryLeftMm: string;
  countryTopMm: string;
  countryRightMm: string;
  warningLeftMm: string;
  warningTopMm: string;
  warningRightMm: string;
  referenceLeftMm: string;
  referenceTopMm: string;
  referenceRightMm: string;
  badgeWidthMm: string;
  badgeHeightMm: string;
  badgeStrokeWidthMm: string;
  badgeFontMm: string;
  headerFontMm: string;
  countryFontMm: string;
  warningFontMm: string;
  referenceFontMm: string;
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
};

const FONT_OPTIONS = [
  'Arial',
  'Arial Black',
  'Helvetica',
  'Verdana',
  'Tahoma',
  'Times New Roman',
  'Georgia',
  'Courier New',
] as const;

const DEFAULT_BADGE_TEXT = '283';
const DEFAULT_HEADER_PREFIX = '|-S-| 73030 -';
const DEFAULT_ASSY_HEADER_PREFIX = '|-S-| 73030 ASSY-';
const DEFAULT_COUNTRY_TEXT = 'BRAZIL';
const DEFAULT_WARNING_TEXT = 'MATCHED SET DO NOT ISSUE SEPARATION';
const DEFAULT_FONT_FAMILY = 'Arial';
const DEFAULT_BADGE_STROKE_WIDTH_MM = 0.35;
const DEFAULT_BADGE_LEFT_MM = 1.4;
const DEFAULT_BADGE_TOP_MM = 1.4;
const DEFAULT_HEADER_LEFT_MM = 25.7;
const DEFAULT_HEADER_TOP_MM = 1.4;
const DEFAULT_HEADER_RIGHT_MM = 1.4;
const DEFAULT_COUNTRY_LEFT_MM = 25.7;
const DEFAULT_COUNTRY_TOP_MM = 18.8;
const DEFAULT_COUNTRY_RIGHT_MM = 1.4;
const DEFAULT_WARNING_LEFT_MM = 1.4;
const DEFAULT_WARNING_TOP_MM = 35;
const DEFAULT_WARNING_RIGHT_MM = 1.4;
const DEFAULT_REFERENCE_LEFT_MM = 1.4;
const DEFAULT_REFERENCE_TOP_MM = 43;
const DEFAULT_REFERENCE_RIGHT_MM = 1.4;

function mapSettingsToDraft(settings: ShippingLabelPrintSettings): SettingsDraft {
  return {
    widthMm: settings.widthMm.toString(),
    heightMm: settings.heightMm.toString(),
    marginLeftMm: settings.marginLeftMm.toString(),
    marginTopMm: settings.marginTopMm.toString(),
    marginRightMm: settings.marginRightMm.toString(),
    marginBottomMm: settings.marginBottomMm.toString(),
    badgeLeftMm: (settings.badgeLeftMm ?? DEFAULT_BADGE_LEFT_MM).toString(),
    badgeTopMm: (settings.badgeTopMm ?? DEFAULT_BADGE_TOP_MM).toString(),
    headerLeftMm: (settings.headerLeftMm ?? DEFAULT_HEADER_LEFT_MM).toString(),
    headerTopMm: (settings.headerTopMm ?? DEFAULT_HEADER_TOP_MM).toString(),
    headerRightMm: (settings.headerRightMm ?? DEFAULT_HEADER_RIGHT_MM).toString(),
    countryLeftMm: (settings.countryLeftMm ?? DEFAULT_COUNTRY_LEFT_MM).toString(),
    countryTopMm: (settings.countryTopMm ?? DEFAULT_COUNTRY_TOP_MM).toString(),
    countryRightMm: (settings.countryRightMm ?? DEFAULT_COUNTRY_RIGHT_MM).toString(),
    warningLeftMm: (settings.warningLeftMm ?? DEFAULT_WARNING_LEFT_MM).toString(),
    warningTopMm: (settings.warningTopMm ?? DEFAULT_WARNING_TOP_MM).toString(),
    warningRightMm: (settings.warningRightMm ?? DEFAULT_WARNING_RIGHT_MM).toString(),
    referenceLeftMm: (settings.referenceLeftMm ?? DEFAULT_REFERENCE_LEFT_MM).toString(),
    referenceTopMm: (settings.referenceTopMm ?? DEFAULT_REFERENCE_TOP_MM).toString(),
    referenceRightMm: (settings.referenceRightMm ?? DEFAULT_REFERENCE_RIGHT_MM).toString(),
    badgeWidthMm: settings.badgeWidthMm.toString(),
    badgeHeightMm: settings.badgeHeightMm.toString(),
    badgeStrokeWidthMm: (settings.badgeStrokeWidthMm ?? DEFAULT_BADGE_STROKE_WIDTH_MM).toString(),
    badgeFontMm: settings.badgeFontMm.toString(),
    headerFontMm: settings.headerFontMm.toString(),
    countryFontMm: settings.countryFontMm.toString(),
    warningFontMm: settings.warningFontMm.toString(),
    referenceFontMm: settings.referenceFontMm.toString(),
    badgeBold: settings.badgeBold,
    headerBold: settings.headerBold,
    countryBold: settings.countryBold,
    warningBold: settings.warningBold,
    referenceBold: settings.referenceBold,
    badgeText: settings.badgeText || DEFAULT_BADGE_TEXT,
    headerPrefix: settings.headerPrefix || DEFAULT_HEADER_PREFIX,
    assyHeaderPrefix: settings.assyHeaderPrefix || DEFAULT_ASSY_HEADER_PREFIX,
    countryText: settings.countryText || DEFAULT_COUNTRY_TEXT,
    warningText: settings.warningText || DEFAULT_WARNING_TEXT,
    badgeFontFamily: settings.badgeFontFamily || DEFAULT_FONT_FAMILY,
    headerFontFamily: settings.headerFontFamily || DEFAULT_FONT_FAMILY,
    countryFontFamily: settings.countryFontFamily || DEFAULT_FONT_FAMILY,
    warningFontFamily: settings.warningFontFamily || DEFAULT_FONT_FAMILY,
    referenceFontFamily: settings.referenceFontFamily || DEFAULT_FONT_FAMILY,
    printerName: settings.printerName || '',
  };
}

function parsePositive(value: string, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseNonNegative(value: string, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function buildPreviewMetrics(draft: SettingsDraft) {
  const widthMm = parsePositive(draft.widthMm, 100);
  const heightMm = parsePositive(draft.heightMm, 50);
  const marginLeftMm = Math.min(parseNonNegative(draft.marginLeftMm), Math.max(widthMm - 1, 0));
  const marginTopMm = Math.min(parseNonNegative(draft.marginTopMm), Math.max(heightMm - 1, 0));
  const marginRightMm = Math.min(parseNonNegative(draft.marginRightMm), Math.max(widthMm - marginLeftMm - 1, 0));
  const marginBottomMm = Math.min(parseNonNegative(draft.marginBottomMm), Math.max(heightMm - marginTopMm - 1, 0));
  const badgeWidthMm = parsePositive(draft.badgeWidthMm, 21.5);
  const badgeHeightMm = parsePositive(draft.badgeHeightMm, 13.03);
  const badgeStrokeWidthMm = parsePositive(draft.badgeStrokeWidthMm, DEFAULT_BADGE_STROKE_WIDTH_MM);
  const badgeFontMm = parsePositive(draft.badgeFontMm, 7.5);
  const headerFontMm = parsePositive(draft.headerFontMm, 5.6);
  const countryFontMm = parsePositive(draft.countryFontMm, 6.6);
  const warningFontMm = parsePositive(draft.warningFontMm, 5.6);
  const referenceFontMm = parsePositive(draft.referenceFontMm, 4.8);
  const layoutScale = Math.max(0.45, Math.min(widthMm / 100, heightMm / 50));
  const topGapMm = 1.4 * layoutScale;
  const leftGapMm = 1.4 * layoutScale;
  const rowGapMm = Math.max(1.2, 2.8 * layoutScale);
  const headerLeftMm = leftGapMm + badgeWidthMm + rowGapMm;
  const topRowHeightMm = Math.max(badgeHeightMm, headerFontMm + (2.4 * layoutScale), 9.4 * layoutScale);
  const countryTopMm = topGapMm + topRowHeightMm + Math.max(1.6, 4.4 * layoutScale);
  const badgeLeftMm = parseNonNegative(draft.badgeLeftMm, DEFAULT_BADGE_LEFT_MM);
  const badgeTopMm = parseNonNegative(draft.badgeTopMm, DEFAULT_BADGE_TOP_MM);
  const headerPositionLeftMm = parseNonNegative(draft.headerLeftMm, headerLeftMm);
  const headerPositionTopMm = parseNonNegative(draft.headerTopMm, DEFAULT_HEADER_TOP_MM);
  const headerRightMm = parseNonNegative(draft.headerRightMm, DEFAULT_HEADER_RIGHT_MM);
  const countryPositionLeftMm = parseNonNegative(draft.countryLeftMm, headerLeftMm);
  const countryPositionTopMm = parseNonNegative(draft.countryTopMm, countryTopMm);
  const countryRightMm = parseNonNegative(draft.countryRightMm, DEFAULT_COUNTRY_RIGHT_MM);
  const warningLeftMm = parseNonNegative(draft.warningLeftMm, DEFAULT_WARNING_LEFT_MM);
  const warningTopMm = parseNonNegative(draft.warningTopMm, DEFAULT_WARNING_TOP_MM);
  const warningRightMm = parseNonNegative(draft.warningRightMm, DEFAULT_WARNING_RIGHT_MM);
  const referenceLeftMm = parseNonNegative(draft.referenceLeftMm, DEFAULT_REFERENCE_LEFT_MM);
  const referenceTopMm = parseNonNegative(draft.referenceTopMm, DEFAULT_REFERENCE_TOP_MM);
  const referenceRightMm = parseNonNegative(draft.referenceRightMm, DEFAULT_REFERENCE_RIGHT_MM);
  const previewScale = Math.min(440 / widthMm, 240 / heightMm);
  const px = (mm: number) => Math.max(mm * previewScale, 0);

  return {
    widthMm,
    heightMm,
    marginLeftMm,
    marginTopMm,
    marginRightMm,
    marginBottomMm,
    badgeWidthMm,
    badgeHeightMm,
    badgeStrokeWidthMm,
    badgeFontMm,
    headerFontMm,
    countryFontMm,
    warningFontMm,
    referenceFontMm,
    badgeLeftMm,
    badgeTopMm,
    headerPositionLeftMm,
    headerPositionTopMm,
    headerRightMm,
    countryPositionLeftMm,
    countryPositionTopMm,
    countryRightMm,
    warningLeftMm,
    warningTopMm,
    warningRightMm,
    referenceLeftMm,
    referenceTopMm,
    referenceRightMm,
    topRowHeightMm,
    previewScale,
    px,
  };
}

function ShippingLabelPreview({ draft }: { draft: SettingsDraft }) {
  const metrics = useMemo(() => buildPreviewMetrics(draft), [draft]);
  const contentWidthMm = Math.max(metrics.widthMm - metrics.marginLeftMm - metrics.marginRightMm, 20);
  const contentHeightMm = Math.max(metrics.heightMm - metrics.marginTopMm - metrics.marginBottomMm, 12);
  const pageWidthPx = metrics.px(metrics.widthMm);
  const pageHeightPx = metrics.px(metrics.heightMm);
  const referenceText = '2026071';
  const partNumber = 'PN-EXEMPLO';
  const headerText = `${draft.headerPrefix || DEFAULT_HEADER_PREFIX} ${partNumber}`.replace(/\s+/g, ' ').trim();

  return (
    <div className="grid gap-2 border-b border-slate-100 px-4 pb-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-medium text-slate-900">Prévia da etiqueta</div>
        <div className="text-xs text-slate-500">
          {metrics.widthMm.toFixed(2)} x {metrics.heightMm.toFixed(2)} mm
        </div>
      </div>
      <div className="overflow-auto rounded-md border border-slate-200 bg-slate-100 p-3">
        <div
          className="relative bg-white shadow-sm"
          style={{
            width: pageWidthPx,
            height: pageHeightPx,
            minWidth: pageWidthPx,
            minHeight: pageHeightPx,
          }}
        >
          <div
            className="absolute overflow-hidden border border-dashed border-red-300"
            style={{
              left: metrics.px(metrics.marginLeftMm),
              top: metrics.px(metrics.marginTopMm),
              width: metrics.px(contentWidthMm),
              height: metrics.px(contentHeightMm),
            }}
          >
            <div
              className="absolute"
              style={{
                top: metrics.px(metrics.badgeTopMm),
                left: metrics.px(metrics.badgeLeftMm),
                width: metrics.px(metrics.badgeWidthMm),
                height: metrics.px(metrics.badgeHeightMm),
              }}
            >
              <svg viewBox="0 0 99 60" fill="none" preserveAspectRatio="none" className="block h-full w-full">
                <path
                  d="M49.5 0.5C63.0931 0.5 75.3748 3.84073 84.2422 9.21484C93.1187 14.5946 98.5 21.9579 98.5 30C98.5 38.0421 93.1187 45.4054 84.2422 50.7852C75.3748 56.1593 63.0931 59.5 49.5 59.5C35.9069 59.5 23.6252 56.1593 14.7578 50.7852C5.88126 45.4054 0.5 38.0421 0.5 30C0.5 21.9579 5.88126 14.5946 14.7578 9.21484C23.6252 3.84073 35.9069 0.5 49.5 0.5Z"
                  stroke="black"
                  strokeWidth={metrics.px(metrics.badgeStrokeWidthMm)}
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
              <span
                className="absolute inset-0 flex items-center justify-center font-medium leading-none"
                style={{
                  fontSize: metrics.px(metrics.badgeFontMm),
                  fontWeight: draft.badgeBold ? 700 : 400,
                  fontFamily: draft.badgeFontFamily || DEFAULT_FONT_FAMILY,
                }}
              >
                {draft.badgeText || DEFAULT_BADGE_TEXT}
              </span>
            </div>

            <div
              className="absolute flex items-center"
              style={{
                top: metrics.px(metrics.headerPositionTopMm),
                left: metrics.px(metrics.headerPositionLeftMm),
                right: metrics.px(metrics.headerRightMm),
                minHeight: metrics.px(metrics.topRowHeightMm),
              }}
            >
              <div
                className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-medium leading-none"
                style={{
                  fontSize: metrics.px(metrics.headerFontMm),
                  fontWeight: draft.headerBold ? 700 : 400,
                  fontFamily: draft.headerFontFamily || DEFAULT_FONT_FAMILY,
                }}
              >
                {headerText}
              </div>
            </div>

            <div
              className="absolute overflow-hidden text-ellipsis whitespace-nowrap font-medium leading-none"
              style={{
                top: metrics.px(metrics.countryPositionTopMm),
                left: metrics.px(metrics.countryPositionLeftMm),
                right: metrics.px(metrics.countryRightMm),
                fontSize: metrics.px(metrics.countryFontMm),
                fontWeight: draft.countryBold ? 700 : 400,
                fontFamily: draft.countryFontFamily || DEFAULT_FONT_FAMILY,
              }}
            >
              {draft.countryText || DEFAULT_COUNTRY_TEXT}
            </div>

            <div
              className="absolute overflow-hidden text-ellipsis whitespace-nowrap leading-none"
              style={{
                top: metrics.px(metrics.warningTopMm),
                left: metrics.px(metrics.warningLeftMm),
                right: metrics.px(metrics.warningRightMm),
                fontSize: metrics.px(metrics.warningFontMm),
                fontWeight: draft.warningBold ? 700 : 400,
                fontFamily: draft.warningFontFamily || DEFAULT_FONT_FAMILY,
                textAlign: 'left',
              }}
            >
              {draft.warningText || DEFAULT_WARNING_TEXT}
            </div>

            <div
              className="absolute flex items-center justify-start whitespace-nowrap font-medium leading-none"
              style={{
                top: metrics.px(metrics.referenceTopMm),
                left: metrics.px(metrics.referenceLeftMm),
                right: metrics.px(metrics.referenceRightMm),
                fontSize: metrics.px(metrics.referenceFontMm),
                fontWeight: draft.referenceBold ? 700 : 400,
                fontFamily: draft.referenceFontFamily || DEFAULT_FONT_FAMILY,
              }}
            >
              {referenceText}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function selectClassName() {
  return cn(
    'border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-input-background px-3 py-1 text-sm outline-none transition-[color,box-shadow]',
    'focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50'
  );
}

function FontField({
  id,
  label,
  value,
  onChange,
  disabled,
  bold,
  onBoldChange,
  fontFamily,
  onFontFamilyChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  bold: boolean;
  onBoldChange: (value: boolean) => void;
  fontFamily: string;
  onFontFamilyChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-3 rounded-md border border-slate-200 bg-white p-3">
      <div className="text-sm font-medium text-slate-900">{label}</div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_120px_auto] sm:items-end">
        <div className="grid gap-2">
          <Label htmlFor={`${id}-family`}>Fonte</Label>
          <select
            id={`${id}-family`}
            value={FONT_OPTIONS.includes(fontFamily as typeof FONT_OPTIONS[number]) ? fontFamily : DEFAULT_FONT_FAMILY}
            onChange={(event) => onFontFamilyChange(event.target.value)}
            disabled={disabled}
            className={selectClassName()}
            style={{ fontFamily }}
          >
            {FONT_OPTIONS.map((option) => (
              <option key={option} value={option} style={{ fontFamily: option }}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor={id}>Tamanho (mm)</Label>
          <Input
            id={id}
            type="number"
            min="0.1"
            step="0.1"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            disabled={disabled}
          />
        </div>
        <label className="flex h-9 items-center gap-2 text-sm text-slate-700">
          <Checkbox checked={bold} onCheckedChange={(checked) => onBoldChange(checked === true)} disabled={disabled} />
          <span>Negrito</span>
        </label>
      </div>
    </div>
  );
}

function TextInputField({
  id,
  label,
  value,
  onChange,
  disabled,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
      />
    </div>
  );
}

function MeasureField({
  id,
  label,
  value,
  onChange,
  disabled,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="number"
        min="0"
        step="0.01"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
      />
    </div>
  );
}

function PositionFieldGroup({
  title,
  fields,
}: {
  title: string;
  fields: Array<{
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    disabled: boolean;
  }>;
}) {
  return (
    <div className="grid gap-3 rounded-md border border-slate-200 bg-white p-3">
      <div className="text-sm font-medium text-slate-900">{title}</div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {fields.map((field) => (
          <MeasureField key={field.id} {...field} />
        ))}
      </div>
    </div>
  );
}

export function ShippingLabelSettingsSheet({
  open,
  onOpenChange,
  settings,
  printers,
  username,
  onSave,
  isSaving = false,
}: ShippingLabelSettingsSheetProps) {
  const [draft, setDraft] = useState<SettingsDraft>(() => mapSettingsToDraft(settings));
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;

    setDraft(mapSettingsToDraft(settings));
    setError('');
  }, [open, settings]);

  const handleSave = async () => {
    const widthMm = Number(draft.widthMm);
    const heightMm = Number(draft.heightMm);
    const marginLeftMm = Number(draft.marginLeftMm);
    const marginTopMm = Number(draft.marginTopMm);
    const marginRightMm = Number(draft.marginRightMm);
    const marginBottomMm = Number(draft.marginBottomMm);
    const badgeLeftMm = Number(draft.badgeLeftMm);
    const badgeTopMm = Number(draft.badgeTopMm);
    const headerLeftMm = Number(draft.headerLeftMm);
    const headerTopMm = Number(draft.headerTopMm);
    const headerRightMm = Number(draft.headerRightMm);
    const countryLeftMm = Number(draft.countryLeftMm);
    const countryTopMm = Number(draft.countryTopMm);
    const countryRightMm = Number(draft.countryRightMm);
    const warningLeftMm = Number(draft.warningLeftMm);
    const warningTopMm = Number(draft.warningTopMm);
    const warningRightMm = Number(draft.warningRightMm);
    const referenceLeftMm = Number(draft.referenceLeftMm);
    const referenceTopMm = Number(draft.referenceTopMm);
    const referenceRightMm = Number(draft.referenceRightMm);
    const badgeWidthMm = Number(draft.badgeWidthMm);
    const badgeHeightMm = Number(draft.badgeHeightMm);
    const badgeStrokeWidthMm = Number(draft.badgeStrokeWidthMm);
    const badgeFontMm = Number(draft.badgeFontMm);
    const headerFontMm = Number(draft.headerFontMm);
    const countryFontMm = Number(draft.countryFontMm);
    const warningFontMm = Number(draft.warningFontMm);
    const referenceFontMm = Number(draft.referenceFontMm);

    if (!Number.isFinite(widthMm) || widthMm <= 0) {
      setError('Informe uma largura válida.');
      return;
    }

    if (!Number.isFinite(heightMm) || heightMm <= 0) {
      setError('Informe uma altura válida.');
      return;
    }

    if (!Number.isFinite(marginLeftMm) || marginLeftMm < 0) {
      setError('Informe uma margem esquerda válida.');
      return;
    }

    if (!Number.isFinite(marginTopMm) || marginTopMm < 0) {
      setError('Informe uma margem superior válida.');
      return;
    }

    if (!Number.isFinite(marginRightMm) || marginRightMm < 0) {
      setError('Informe uma margem direita válida.');
      return;
    }

    if (!Number.isFinite(marginBottomMm) || marginBottomMm < 0) {
      setError('Informe uma margem inferior válida.');
      return;
    }

    if (marginLeftMm + marginRightMm >= widthMm) {
      setError('A soma das margens esquerda e direita deve ser menor que a largura.');
      return;
    }

    if (marginTopMm + marginBottomMm >= heightMm) {
      setError('A soma das margens superior e inferior deve ser menor que a altura.');
      return;
    }

    const layoutFields = [
      badgeLeftMm,
      badgeTopMm,
      headerLeftMm,
      headerTopMm,
      headerRightMm,
      countryLeftMm,
      countryTopMm,
      countryRightMm,
      warningLeftMm,
      warningTopMm,
      warningRightMm,
      referenceLeftMm,
      referenceTopMm,
      referenceRightMm,
    ];

    if (layoutFields.some((value) => !Number.isFinite(value) || value < 0)) {
      setError('Informe posições e margens de campo válidas.');
      return;
    }

    if (!Number.isFinite(badgeWidthMm) || badgeWidthMm <= 0) {
      setError('Informe uma largura válida para o badge.');
      return;
    }

    if (!Number.isFinite(badgeHeightMm) || badgeHeightMm <= 0) {
      setError('Informe uma altura válida para o badge.');
      return;
    }

    if (!Number.isFinite(badgeStrokeWidthMm) || badgeStrokeWidthMm <= 0) {
      setError('Informe uma espessura válida para o contorno do oval.');
      return;
    }

    if (!Number.isFinite(badgeFontMm) || badgeFontMm <= 0) {
      setError('Informe uma fonte válida para o número do oval.');
      return;
    }

    if (!Number.isFinite(headerFontMm) || headerFontMm <= 0) {
      setError('Informe uma fonte válida para o cabeçalho.');
      return;
    }

    if (!Number.isFinite(countryFontMm) || countryFontMm <= 0) {
      setError('Informe uma fonte válida para o país.');
      return;
    }

    if (!Number.isFinite(warningFontMm) || warningFontMm <= 0) {
      setError('Informe uma fonte válida para o rodapé.');
      return;
    }

    if (!Number.isFinite(referenceFontMm) || referenceFontMm <= 0) {
      setError('Informe uma fonte válida para a data lateral.');
      return;
    }

    const badgeText = draft.badgeText.trim();
    const headerPrefix = draft.headerPrefix.trim();
    const assyHeaderPrefix = draft.assyHeaderPrefix.trim();
    const countryText = draft.countryText.trim();
    const warningText = draft.warningText.trim();

    if (!badgeText) {
      setError('Informe o texto do número oval.');
      return;
    }

    if (!headerPrefix || !assyHeaderPrefix) {
      setError('Informe os textos do cabeçalho dos dois modelos.');
      return;
    }

    if (!countryText) {
      setError('Informe o texto do país.');
      return;
    }

    if (!warningText) {
      setError('Informe o texto do aviso inferior.');
      return;
    }

    setError('');

    try {
      await onSave({
        username,
        widthMm,
        heightMm,
        marginLeftMm,
        marginTopMm,
        marginRightMm,
        marginBottomMm,
        badgeLeftMm,
        badgeTopMm,
        headerLeftMm,
        headerTopMm,
        headerRightMm,
        countryLeftMm,
        countryTopMm,
        countryRightMm,
        warningLeftMm,
        warningTopMm,
        warningRightMm,
        referenceLeftMm,
        referenceTopMm,
        referenceRightMm,
        badgeWidthMm,
        badgeHeightMm,
        badgeStrokeWidthMm,
        badgeFontMm,
        headerFontMm,
        countryFontMm,
        warningFontMm,
        referenceFontMm,
        badgeBold: draft.badgeBold,
        headerBold: draft.headerBold,
        countryBold: draft.countryBold,
        warningBold: draft.warningBold,
        referenceBold: draft.referenceBold,
        badgeText,
        headerPrefix,
        assyHeaderPrefix,
        countryText,
        warningText,
        badgeFontFamily: draft.badgeFontFamily || DEFAULT_FONT_FAMILY,
        headerFontFamily: draft.headerFontFamily || DEFAULT_FONT_FAMILY,
        countryFontFamily: draft.countryFontFamily || DEFAULT_FONT_FAMILY,
        warningFontFamily: draft.warningFontFamily || DEFAULT_FONT_FAMILY,
        referenceFontFamily: draft.referenceFontFamily || DEFAULT_FONT_FAMILY,
        printerName: draft.printerName.trim(),
      });
      onOpenChange(false);
    } catch {
      // O toast já é exibido na view.
    }
  };

  const selectedPrinter = printers.includes(draft.printerName) ? draft.printerName : '';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-hidden sm:max-w-[860px]">
        <SheetHeader>
          <SheetTitle>Configuração da Etiqueta</SheetTitle>
          <SheetDescription>
            Defina tamanho, margens, fontes por campo e a impressora padrão vinculada ao seu usuário.
          </SheetDescription>
        </SheetHeader>

        <ShippingLabelPreview draft={draft} />

        <div className="grid min-h-0 gap-6 overflow-y-auto px-4 pb-4">
          <div className="grid gap-4 rounded-md border border-slate-200 bg-slate-50 p-4">
            <div>
              <div className="text-sm font-medium text-slate-900">1. Textos livres</div>
              <div className="text-xs text-slate-500">Edite apenas os textos fixos da etiqueta. Part number, data e numeração continuam vindo do registro.</div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextInputField
                id="shipping-label-badge-text"
                label="Número oval"
                value={draft.badgeText}
                onChange={(value) => setDraft((current) => ({ ...current, badgeText: value }))}
                disabled={isSaving}
              />
              <TextInputField
                id="shipping-label-country-text"
                label="País"
                value={draft.countryText}
                onChange={(value) => setDraft((current) => ({ ...current, countryText: value }))}
                disabled={isSaving}
              />
              <TextInputField
                id="shipping-label-header-prefix"
                label="Cabeçalho - Modelo padrão"
                value={draft.headerPrefix}
                onChange={(value) => setDraft((current) => ({ ...current, headerPrefix: value }))}
                disabled={isSaving}
              />
              <TextInputField
                id="shipping-label-assy-header-prefix"
                label="Cabeçalho - Modelo ASSY"
                value={draft.assyHeaderPrefix}
                onChange={(value) => setDraft((current) => ({ ...current, assyHeaderPrefix: value }))}
                disabled={isSaving}
              />
              <div className="sm:col-span-2">
                <TextInputField
                  id="shipping-label-warning-text"
                  label="Aviso inferior"
                  value={draft.warningText}
                  onChange={(value) => setDraft((current) => ({ ...current, warningText: value }))}
                  disabled={isSaving}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 rounded-md border border-slate-200 bg-slate-50 p-4">
            <div>
              <div className="text-sm font-medium text-slate-900">2. Aparência dos textos</div>
              <div className="text-xs text-slate-500">Escolha fonte, tamanho e peso de cada área da etiqueta.</div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <FontField
                id="shipping-label-badge-font-mm"
                label="Número oval"
                value={draft.badgeFontMm}
                onChange={(value) => setDraft((current) => ({ ...current, badgeFontMm: value }))}
                disabled={isSaving}
                bold={draft.badgeBold}
                onBoldChange={(value) => setDraft((current) => ({ ...current, badgeBold: value }))}
                fontFamily={draft.badgeFontFamily}
                onFontFamilyChange={(value) => setDraft((current) => ({ ...current, badgeFontFamily: value }))}
              />
              <FontField
                id="shipping-label-header-font-mm"
                label="Cabeçalho"
                value={draft.headerFontMm}
                onChange={(value) => setDraft((current) => ({ ...current, headerFontMm: value }))}
                disabled={isSaving}
                bold={draft.headerBold}
                onBoldChange={(value) => setDraft((current) => ({ ...current, headerBold: value }))}
                fontFamily={draft.headerFontFamily}
                onFontFamilyChange={(value) => setDraft((current) => ({ ...current, headerFontFamily: value }))}
              />
              <FontField
                id="shipping-label-country-font-mm"
                label="País"
                value={draft.countryFontMm}
                onChange={(value) => setDraft((current) => ({ ...current, countryFontMm: value }))}
                disabled={isSaving}
                bold={draft.countryBold}
                onBoldChange={(value) => setDraft((current) => ({ ...current, countryBold: value }))}
                fontFamily={draft.countryFontFamily}
                onFontFamilyChange={(value) => setDraft((current) => ({ ...current, countryFontFamily: value }))}
              />
              <FontField
                id="shipping-label-warning-font-mm"
                label="Aviso inferior"
                value={draft.warningFontMm}
                onChange={(value) => setDraft((current) => ({ ...current, warningFontMm: value }))}
                disabled={isSaving}
                bold={draft.warningBold}
                onBoldChange={(value) => setDraft((current) => ({ ...current, warningBold: value }))}
                fontFamily={draft.warningFontFamily}
                onFontFamilyChange={(value) => setDraft((current) => ({ ...current, warningFontFamily: value }))}
              />
              <FontField
                id="shipping-label-reference-font-mm"
                label="Data e numeração lateral"
                value={draft.referenceFontMm}
                onChange={(value) => setDraft((current) => ({ ...current, referenceFontMm: value }))}
                disabled={isSaving}
                bold={draft.referenceBold}
                onBoldChange={(value) => setDraft((current) => ({ ...current, referenceBold: value }))}
                fontFamily={draft.referenceFontFamily}
                onFontFamilyChange={(value) => setDraft((current) => ({ ...current, referenceFontFamily: value }))}
              />
            </div>
          </div>

          <div className="grid gap-4 rounded-md border border-slate-200 bg-slate-50 p-4">
            <div>
              <div className="text-sm font-medium text-slate-900">3. Posição dos campos</div>
              <div className="text-xs text-slate-500">Ajuste posição e margem de cada texto em milímetros.</div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <PositionFieldGroup
                title="Número oval"
                fields={[
                  {
                    id: 'shipping-label-badge-left-mm',
                    label: 'Esquerda (mm)',
                    value: draft.badgeLeftMm,
                    onChange: (value) => setDraft((current) => ({ ...current, badgeLeftMm: value })),
                    disabled: isSaving,
                  },
                  {
                    id: 'shipping-label-badge-top-mm',
                    label: 'Topo (mm)',
                    value: draft.badgeTopMm,
                    onChange: (value) => setDraft((current) => ({ ...current, badgeTopMm: value })),
                    disabled: isSaving,
                  },
                ]}
              />
              <PositionFieldGroup
                title="Cabeçalho"
                fields={[
                  {
                    id: 'shipping-label-header-left-mm',
                    label: 'Esquerda (mm)',
                    value: draft.headerLeftMm,
                    onChange: (value) => setDraft((current) => ({ ...current, headerLeftMm: value })),
                    disabled: isSaving,
                  },
                  {
                    id: 'shipping-label-header-top-mm',
                    label: 'Topo (mm)',
                    value: draft.headerTopMm,
                    onChange: (value) => setDraft((current) => ({ ...current, headerTopMm: value })),
                    disabled: isSaving,
                  },
                  {
                    id: 'shipping-label-header-right-mm',
                    label: 'Margem direita (mm)',
                    value: draft.headerRightMm,
                    onChange: (value) => setDraft((current) => ({ ...current, headerRightMm: value })),
                    disabled: isSaving,
                  },
                ]}
              />
              <PositionFieldGroup
                title="País"
                fields={[
                  {
                    id: 'shipping-label-country-left-mm',
                    label: 'Esquerda (mm)',
                    value: draft.countryLeftMm,
                    onChange: (value) => setDraft((current) => ({ ...current, countryLeftMm: value })),
                    disabled: isSaving,
                  },
                  {
                    id: 'shipping-label-country-top-mm',
                    label: 'Topo (mm)',
                    value: draft.countryTopMm,
                    onChange: (value) => setDraft((current) => ({ ...current, countryTopMm: value })),
                    disabled: isSaving,
                  },
                  {
                    id: 'shipping-label-country-right-mm',
                    label: 'Margem direita (mm)',
                    value: draft.countryRightMm,
                    onChange: (value) => setDraft((current) => ({ ...current, countryRightMm: value })),
                    disabled: isSaving,
                  },
                ]}
              />
              <PositionFieldGroup
                title="Aviso inferior"
                fields={[
                  {
                    id: 'shipping-label-warning-left-mm',
                    label: 'Esquerda (mm)',
                    value: draft.warningLeftMm,
                    onChange: (value) => setDraft((current) => ({ ...current, warningLeftMm: value })),
                    disabled: isSaving,
                  },
                  {
                    id: 'shipping-label-warning-top-mm',
                    label: 'Topo (mm)',
                    value: draft.warningTopMm,
                    onChange: (value) => setDraft((current) => ({ ...current, warningTopMm: value })),
                    disabled: isSaving,
                  },
                  {
                    id: 'shipping-label-warning-right-mm',
                    label: 'Margem direita (mm)',
                    value: draft.warningRightMm,
                    onChange: (value) => setDraft((current) => ({ ...current, warningRightMm: value })),
                    disabled: isSaving,
                  },
                ]}
              />
              <PositionFieldGroup
                title="Data e serial"
                fields={[
                  {
                    id: 'shipping-label-reference-left-mm',
                    label: 'Esquerda (mm)',
                    value: draft.referenceLeftMm,
                    onChange: (value) => setDraft((current) => ({ ...current, referenceLeftMm: value })),
                    disabled: isSaving,
                  },
                  {
                    id: 'shipping-label-reference-top-mm',
                    label: 'Topo (mm)',
                    value: draft.referenceTopMm,
                    onChange: (value) => setDraft((current) => ({ ...current, referenceTopMm: value })),
                    disabled: isSaving,
                  },
                  {
                    id: 'shipping-label-reference-right-mm',
                    label: 'Margem direita (mm)',
                    value: draft.referenceRightMm,
                    onChange: (value) => setDraft((current) => ({ ...current, referenceRightMm: value })),
                    disabled: isSaving,
                  },
                ]}
              />
            </div>
          </div>

          <div className="grid gap-4 rounded-md border border-slate-200 bg-slate-50 p-4">
            <div>
              <div className="text-sm font-medium text-slate-900">4. Medidas</div>
              <div className="text-xs text-slate-500">Ajuste o tamanho físico da etiqueta, margens e oval.</div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="shipping-label-width-mm">Largura (mm)</Label>
                <Input
                  id="shipping-label-width-mm"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={draft.widthMm}
                  onChange={(event) => setDraft((current) => ({ ...current, widthMm: event.target.value }))}
                  disabled={isSaving}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="shipping-label-height-mm">Altura (mm)</Label>
                <Input
                  id="shipping-label-height-mm"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={draft.heightMm}
                  onChange={(event) => setDraft((current) => ({ ...current, heightMm: event.target.value }))}
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="shipping-label-margin-left-mm">Margem Esquerda (mm)</Label>
                <Input
                  id="shipping-label-margin-left-mm"
                  type="number"
                  min="0"
                  step="0.01"
                  value={draft.marginLeftMm}
                  onChange={(event) => setDraft((current) => ({ ...current, marginLeftMm: event.target.value }))}
                  disabled={isSaving}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="shipping-label-margin-top-mm">Margem Superior (mm)</Label>
                <Input
                  id="shipping-label-margin-top-mm"
                  type="number"
                  min="0"
                  step="0.01"
                  value={draft.marginTopMm}
                  onChange={(event) => setDraft((current) => ({ ...current, marginTopMm: event.target.value }))}
                  disabled={isSaving}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="shipping-label-margin-right-mm">Margem Direita (mm)</Label>
                <Input
                  id="shipping-label-margin-right-mm"
                  type="number"
                  min="0"
                  step="0.01"
                  value={draft.marginRightMm}
                  onChange={(event) => setDraft((current) => ({ ...current, marginRightMm: event.target.value }))}
                  disabled={isSaving}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="shipping-label-margin-bottom-mm">Margem Inferior (mm)</Label>
                <Input
                  id="shipping-label-margin-bottom-mm"
                  type="number"
                  min="0"
                  step="0.01"
                  value={draft.marginBottomMm}
                  onChange={(event) => setDraft((current) => ({ ...current, marginBottomMm: event.target.value }))}
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="shipping-label-badge-width-mm">Largura Badge (mm)</Label>
                <Input
                  id="shipping-label-badge-width-mm"
                  type="number"
                  min="0.1"
                  step="0.01"
                  value={draft.badgeWidthMm}
                  onChange={(event) => setDraft((current) => ({ ...current, badgeWidthMm: event.target.value }))}
                  disabled={isSaving}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="shipping-label-badge-height-mm">Altura Badge (mm)</Label>
                <Input
                  id="shipping-label-badge-height-mm"
                  type="number"
                  min="0.1"
                  step="0.01"
                  value={draft.badgeHeightMm}
                  onChange={(event) => setDraft((current) => ({ ...current, badgeHeightMm: event.target.value }))}
                  disabled={isSaving}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="shipping-label-badge-stroke-width-mm">Contorno Oval (mm)</Label>
                <Input
                  id="shipping-label-badge-stroke-width-mm"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={draft.badgeStrokeWidthMm}
                  onChange={(event) => setDraft((current) => ({ ...current, badgeStrokeWidthMm: event.target.value }))}
                  disabled={isSaving}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 rounded-md border border-slate-200 bg-slate-50 p-4">
            <div>
              <div className="text-sm font-medium text-slate-900">5. Impressora</div>
              <div className="text-xs text-slate-500">Escolha uma impressora detectada ou informe a fila manualmente.</div>
            </div>
            {printers.length > 0 ? (
              <div className="grid gap-2">
                <Label htmlFor="shipping-label-printer-select">Impressora local ou de rede</Label>
                <select
                  id="shipping-label-printer-select"
                  value={selectedPrinter}
                  onChange={(event) => setDraft((current) => ({ ...current, printerName: event.target.value }))}
                  disabled={isSaving}
                  className={selectClassName()}
                >
                  <option value="">Selecione a impressora</option>
                  {printers.map((printer) => (
                    <option key={printer} value={printer}>
                      {printer}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            <div className="grid gap-2">
              <Label htmlFor="shipping-label-printer-name">
                {printers.length > 0 ? 'Ou informe manualmente a fila' : 'Impressora Padrão'}
              </Label>
              <Input
                id="shipping-label-printer-name"
                value={draft.printerName}
                onChange={(event) => setDraft((current) => ({ ...current, printerName: event.target.value }))}
                placeholder="Nome da impressora ou \\\\servidor\\fila"
                disabled={isSaving}
              />
            </div>
          </div>

          {error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : null}
        </div>

        <SheetFooter className="border-t border-slate-100">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancelar
          </Button>
          <Button
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={() => void handleSave()}
            disabled={isSaving}
          >
            Salvar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
