import { requestJson } from "./api";

export type ShippingLabelModelType = "DEFAULT" | "ASSY";

const DEFAULT_BADGE_TEXT = "283";
const DEFAULT_HEADER_PREFIX = "|-S-| 73030 -";
const DEFAULT_ASSY_HEADER_PREFIX = "|-S-| 73030 ASSY-";
const DEFAULT_COUNTRY_TEXT = "BRAZIL";
const DEFAULT_WARNING_TEXT = "MATCHED SET DO NOT ISSUE SEPARATION";
const DEFAULT_FONT_FAMILY = "Arial";
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

export const SHIPPING_LABEL_MODEL_OPTIONS: Array<{
  value: ShippingLabelModelType;
  label: string;
}> = [
  { value: "DEFAULT", label: "Tipo 1 - DEFAULT" },
  { value: "ASSY", label: "Tipo 2 - ASSY" },
];

type ShippingLabelLayoutFields = {
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
};

export type ShippingLabel = {
  id: string;
  partNumberId: string;
  partNumber: string;
  referenceDate: string;
  rangeStart: number;
  rangeEnd: number;
  quantity: number;
  labelModel: ShippingLabelModelType;
  badgeFontMm: number;
  headerFontMm: number;
  countryFontMm: number;
  warningFontMm: number;
  referenceFontMm: number;
  badgeWidthMm: number;
  badgeHeightMm: number;
  badgeStrokeWidthMm: number;
  labelWidthMm: number;
  labelHeightMm: number;
  marginLeftMm: number;
  marginTopMm: number;
  marginRightMm: number;
  marginBottomMm: number;
} & ShippingLabelLayoutFields & {
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
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type ShippingLabelPrintSettings = {
  id: string;
  username: string;
  widthMm: number;
  heightMm: number;
  marginLeftMm: number;
  marginTopMm: number;
  marginRightMm: number;
  marginBottomMm: number;
} & ShippingLabelLayoutFields & {
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
  badgeWidthMm: number;
  badgeHeightMm: number;
  badgeStrokeWidthMm: number;
  printerName: string;
  createdAt: string;
  updatedAt: string;
};

export type ShippingLabelPrintItem = {
  sequence: number;
  serialNumber: string;
  referenceText: string;
  partNumber: string;
};

export type ShippingLabelPrintJob = {
  recordId: string;
  partNumber: string;
  labelModel: ShippingLabelModelType;
  printerName: string;
  badgeFontMm: number;
  headerFontMm: number;
  countryFontMm: number;
  warningFontMm: number;
  referenceFontMm: number;
  badgeWidthMm: number;
  badgeHeightMm: number;
  badgeStrokeWidthMm: number;
  widthMm: number;
  heightMm: number;
  marginLeftMm: number;
  marginTopMm: number;
  marginRightMm: number;
  marginBottomMm: number;
} & ShippingLabelLayoutFields & {
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
  labels: ShippingLabelPrintItem[];
};

export type ShippingLabelSavePayload = {
  partNumberId: string;
  referenceDate: string;
  rangeStart: number;
  rangeEnd: number;
  labelModel: ShippingLabelModelType;
  badgeFontMm: number;
  headerFontMm: number;
  countryFontMm: number;
  warningFontMm: number;
  referenceFontMm: number;
  badgeWidthMm: number;
  badgeHeightMm: number;
  badgeStrokeWidthMm: number;
  labelWidthMm: number;
  labelHeightMm: number;
  marginLeftMm: number;
  marginTopMm: number;
  marginRightMm: number;
  marginBottomMm: number;
} & ShippingLabelLayoutFields & {
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
  printerName?: string;
  createBy?: string;
};

export type ShippingLabelPrintSettingsPayload = {
  username: string;
  widthMm: number;
  heightMm: number;
  marginLeftMm: number;
  marginTopMm: number;
  marginRightMm: number;
  marginBottomMm: number;
} & ShippingLabelLayoutFields & {
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
  badgeWidthMm: number;
  badgeHeightMm: number;
  badgeStrokeWidthMm: number;
  printerName?: string;
};

type ShippingLabelApiModel = {
  Id?: number;
  PartNumberId?: number;
  PartNumber?: string;
  ReferenceDate?: string;
  RangeStart?: number;
  RangeEnd?: number;
  Quantity?: number;
  LabelModel?: string;
  BadgeFontMm?: number;
  HeaderFontMm?: number;
  CountryFontMm?: number;
  WarningFontMm?: number;
  ReferenceFontMm?: number;
  BadgeWidthMm?: number;
  BadgeHeightMm?: number;
  BadgeStrokeWidthMm?: number;
  LabelWidthMm?: number;
  LabelHeightMm?: number;
  MarginLeftMm?: number;
  MarginTopMm?: number;
  MarginRightMm?: number;
  MarginBottomMm?: number;
  BadgeBold?: boolean;
  HeaderBold?: boolean;
  CountryBold?: boolean;
  WarningBold?: boolean;
  ReferenceBold?: boolean;
  BadgeText?: string;
  HeaderPrefix?: string;
  AssyHeaderPrefix?: string;
  CountryText?: string;
  WarningText?: string;
  BadgeFontFamily?: string;
  HeaderFontFamily?: string;
  CountryFontFamily?: string;
  WarningFontFamily?: string;
  ReferenceFontFamily?: string;
  PrinterName?: string | null;
  CreateBy?: string;
  CreateDate?: string;
  LastUpdate?: string | null;
  id?: number;
  partNumberId?: number;
  partNumber?: string;
  referenceDate?: string;
  rangeStart?: number;
  rangeEnd?: number;
  quantity?: number;
  labelModel?: string;
  badgeFontMm?: number;
  headerFontMm?: number;
  countryFontMm?: number;
  warningFontMm?: number;
  referenceFontMm?: number;
  badgeWidthMm?: number;
  badgeHeightMm?: number;
  badgeStrokeWidthMm?: number;
  labelWidthMm?: number;
  labelHeightMm?: number;
  marginLeftMm?: number;
  marginTopMm?: number;
  marginRightMm?: number;
  marginBottomMm?: number;
  badgeBold?: boolean;
  headerBold?: boolean;
  countryBold?: boolean;
  warningBold?: boolean;
  referenceBold?: boolean;
  badgeText?: string;
  headerPrefix?: string;
  assyHeaderPrefix?: string;
  countryText?: string;
  warningText?: string;
  badgeFontFamily?: string;
  headerFontFamily?: string;
  countryFontFamily?: string;
  warningFontFamily?: string;
  referenceFontFamily?: string;
  printerName?: string | null;
  createBy?: string;
  createDate?: string;
  lastUpdate?: string | null;
};

type ShippingLabelPrintSettingsApiModel = {
  Id?: number;
  Username?: string;
  WidthMm?: number;
  HeightMm?: number;
  MarginLeftMm?: number;
  MarginTopMm?: number;
  MarginRightMm?: number;
  MarginBottomMm?: number;
  BadgeFontMm?: number;
  HeaderFontMm?: number;
  CountryFontMm?: number;
  WarningFontMm?: number;
  ReferenceFontMm?: number;
  BadgeBold?: boolean;
  HeaderBold?: boolean;
  CountryBold?: boolean;
  WarningBold?: boolean;
  ReferenceBold?: boolean;
  BadgeText?: string;
  HeaderPrefix?: string;
  AssyHeaderPrefix?: string;
  CountryText?: string;
  WarningText?: string;
  BadgeFontFamily?: string;
  HeaderFontFamily?: string;
  CountryFontFamily?: string;
  WarningFontFamily?: string;
  ReferenceFontFamily?: string;
  BadgeWidthMm?: number;
  BadgeHeightMm?: number;
  BadgeStrokeWidthMm?: number;
  PrinterName?: string | null;
  CreateDate?: string;
  LastUpdate?: string | null;
  id?: number;
  username?: string;
  widthMm?: number;
  heightMm?: number;
  marginLeftMm?: number;
  marginTopMm?: number;
  marginRightMm?: number;
  marginBottomMm?: number;
  badgeFontMm?: number;
  headerFontMm?: number;
  countryFontMm?: number;
  warningFontMm?: number;
  referenceFontMm?: number;
  badgeBold?: boolean;
  headerBold?: boolean;
  countryBold?: boolean;
  warningBold?: boolean;
  referenceBold?: boolean;
  badgeText?: string;
  headerPrefix?: string;
  assyHeaderPrefix?: string;
  countryText?: string;
  warningText?: string;
  badgeFontFamily?: string;
  headerFontFamily?: string;
  countryFontFamily?: string;
  warningFontFamily?: string;
  referenceFontFamily?: string;
  badgeWidthMm?: number;
  badgeHeightMm?: number;
  badgeStrokeWidthMm?: number;
  printerName?: string | null;
  createDate?: string;
  lastUpdate?: string | null;
};

type ShippingLabelPrintJobApiModel = {
  RecordId?: number;
  PartNumber?: string;
  LabelModel?: string;
  PrinterName?: string | null;
  BadgeFontMm?: number;
  HeaderFontMm?: number;
  CountryFontMm?: number;
  WarningFontMm?: number;
  ReferenceFontMm?: number;
  BadgeWidthMm?: number;
  BadgeHeightMm?: number;
  BadgeStrokeWidthMm?: number;
  WidthMm?: number;
  HeightMm?: number;
  MarginLeftMm?: number;
  MarginTopMm?: number;
  MarginRightMm?: number;
  MarginBottomMm?: number;
  BadgeText?: string;
  HeaderPrefix?: string;
  AssyHeaderPrefix?: string;
  CountryText?: string;
  WarningText?: string;
  BadgeFontFamily?: string;
  HeaderFontFamily?: string;
  CountryFontFamily?: string;
  WarningFontFamily?: string;
  ReferenceFontFamily?: string;
  Labels?: ShippingLabelPrintItemApiModel[];
  recordId?: number;
  partNumber?: string;
  labelModel?: string;
  printerName?: string | null;
  badgeFontMm?: number;
  headerFontMm?: number;
  countryFontMm?: number;
  warningFontMm?: number;
  referenceFontMm?: number;
  badgeWidthMm?: number;
  badgeHeightMm?: number;
  badgeStrokeWidthMm?: number;
  widthMm?: number;
  heightMm?: number;
  marginLeftMm?: number;
  marginTopMm?: number;
  marginRightMm?: number;
  marginBottomMm?: number;
  badgeText?: string;
  headerPrefix?: string;
  assyHeaderPrefix?: string;
  countryText?: string;
  warningText?: string;
  badgeFontFamily?: string;
  headerFontFamily?: string;
  countryFontFamily?: string;
  warningFontFamily?: string;
  referenceFontFamily?: string;
  BadgeBold?: boolean;
  HeaderBold?: boolean;
  CountryBold?: boolean;
  WarningBold?: boolean;
  ReferenceBold?: boolean;
  badgeBold?: boolean;
  headerBold?: boolean;
  countryBold?: boolean;
  warningBold?: boolean;
  referenceBold?: boolean;
  labels?: ShippingLabelPrintItemApiModel[];
};

type ShippingLabelPrintItemApiModel = {
  Sequence?: number;
  SerialNumber?: string;
  ReferenceText?: string;
  PartNumber?: string;
  sequence?: number;
  serialNumber?: string;
  referenceText?: string;
  partNumber?: string;
};

type ShippingLabelApiResponse = {
  success?: boolean;
  message?: string;
  shippingLabel?: ShippingLabelApiModel;
};

type ShippingLabelPrintSettingsResponse = {
  success?: boolean;
  message?: string;
  settings?: ShippingLabelPrintSettingsApiModel;
};

function toNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeLabelModel(value: unknown): ShippingLabelModelType {
  const normalized = String(value ?? "").trim().toUpperCase();
  return normalized === "ASSY" ? "ASSY" : "DEFAULT";
}

function toFontNumber(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function toBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function toText(value: unknown, fallback: string) {
  const normalized = String(value ?? "").trim();
  return normalized.length > 0 ? normalized : fallback;
}

function mapLayoutFields(raw: Record<string, unknown>): ShippingLabelLayoutFields {
  return {
    badgeLeftMm: toNumber(raw.BadgeLeftMm ?? raw.badgeLeftMm, DEFAULT_BADGE_LEFT_MM),
    badgeTopMm: toNumber(raw.BadgeTopMm ?? raw.badgeTopMm, DEFAULT_BADGE_TOP_MM),
    headerLeftMm: toNumber(raw.HeaderLeftMm ?? raw.headerLeftMm, DEFAULT_HEADER_LEFT_MM),
    headerTopMm: toNumber(raw.HeaderTopMm ?? raw.headerTopMm, DEFAULT_HEADER_TOP_MM),
    headerRightMm: toNumber(raw.HeaderRightMm ?? raw.headerRightMm, DEFAULT_HEADER_RIGHT_MM),
    countryLeftMm: toNumber(raw.CountryLeftMm ?? raw.countryLeftMm, DEFAULT_COUNTRY_LEFT_MM),
    countryTopMm: toNumber(raw.CountryTopMm ?? raw.countryTopMm, DEFAULT_COUNTRY_TOP_MM),
    countryRightMm: toNumber(raw.CountryRightMm ?? raw.countryRightMm, DEFAULT_COUNTRY_RIGHT_MM),
    warningLeftMm: toNumber(raw.WarningLeftMm ?? raw.warningLeftMm, DEFAULT_WARNING_LEFT_MM),
    warningTopMm: toNumber(raw.WarningTopMm ?? raw.warningTopMm, DEFAULT_WARNING_TOP_MM),
    warningRightMm: toNumber(raw.WarningRightMm ?? raw.warningRightMm, DEFAULT_WARNING_RIGHT_MM),
    referenceLeftMm: toNumber(raw.ReferenceLeftMm ?? raw.referenceLeftMm, DEFAULT_REFERENCE_LEFT_MM),
    referenceTopMm: toNumber(raw.ReferenceTopMm ?? raw.referenceTopMm, DEFAULT_REFERENCE_TOP_MM),
    referenceRightMm: toNumber(raw.ReferenceRightMm ?? raw.referenceRightMm, DEFAULT_REFERENCE_RIGHT_MM),
  };
}

function mapShippingLabelFromApi(payload: ShippingLabelApiModel): ShippingLabel {
  const raw = payload as Record<string, unknown>;
  const createdAt = String(raw.CreateDate ?? raw.createDate ?? new Date().toISOString());
  const updatedAt = String(raw.LastUpdate ?? raw.lastUpdate ?? createdAt);

  return {
    id: String(raw.Id ?? raw.id ?? ""),
    partNumberId: String(raw.PartNumberId ?? raw.partNumberId ?? ""),
    partNumber: String(raw.PartNumber ?? raw.partNumber ?? ""),
    referenceDate: String(raw.ReferenceDate ?? raw.referenceDate ?? createdAt),
    rangeStart: toNumber(raw.RangeStart ?? raw.rangeStart),
    rangeEnd: toNumber(raw.RangeEnd ?? raw.rangeEnd),
    quantity: toNumber(raw.Quantity ?? raw.quantity),
    labelModel: normalizeLabelModel(raw.LabelModel ?? raw.labelModel),
    badgeFontMm: toFontNumber(raw.BadgeFontMm ?? raw.badgeFontMm, 7.5),
    headerFontMm: toFontNumber(raw.HeaderFontMm ?? raw.headerFontMm, 5.6),
    countryFontMm: toFontNumber(raw.CountryFontMm ?? raw.countryFontMm, 6.6),
    warningFontMm: toFontNumber(raw.WarningFontMm ?? raw.warningFontMm, 5.6),
    referenceFontMm: toFontNumber(raw.ReferenceFontMm ?? raw.referenceFontMm, 4.8),
    badgeWidthMm: toFontNumber(raw.BadgeWidthMm ?? raw.badgeWidthMm, 21.5),
    badgeHeightMm: toFontNumber(raw.BadgeHeightMm ?? raw.badgeHeightMm, 13.03),
    badgeStrokeWidthMm: toFontNumber(raw.BadgeStrokeWidthMm ?? raw.badgeStrokeWidthMm, DEFAULT_BADGE_STROKE_WIDTH_MM),
    labelWidthMm: toNumber(raw.LabelWidthMm ?? raw.labelWidthMm, 100),
    labelHeightMm: toNumber(raw.LabelHeightMm ?? raw.labelHeightMm, 50),
    marginLeftMm: toNumber(raw.MarginLeftMm ?? raw.marginLeftMm),
    marginTopMm: toNumber(raw.MarginTopMm ?? raw.marginTopMm),
    marginRightMm: toNumber(raw.MarginRightMm ?? raw.marginRightMm),
    marginBottomMm: toNumber(raw.MarginBottomMm ?? raw.marginBottomMm),
    ...mapLayoutFields(raw),
    badgeBold: toBoolean(raw.BadgeBold ?? raw.badgeBold, true),
    headerBold: toBoolean(raw.HeaderBold ?? raw.headerBold, true),
    countryBold: toBoolean(raw.CountryBold ?? raw.countryBold, true),
    warningBold: toBoolean(raw.WarningBold ?? raw.warningBold, false),
    referenceBold: toBoolean(raw.ReferenceBold ?? raw.referenceBold, true),
    badgeText: toText(raw.BadgeText ?? raw.badgeText, DEFAULT_BADGE_TEXT),
    headerPrefix: toText(raw.HeaderPrefix ?? raw.headerPrefix, DEFAULT_HEADER_PREFIX),
    assyHeaderPrefix: toText(raw.AssyHeaderPrefix ?? raw.assyHeaderPrefix, DEFAULT_ASSY_HEADER_PREFIX),
    countryText: toText(raw.CountryText ?? raw.countryText, DEFAULT_COUNTRY_TEXT),
    warningText: toText(raw.WarningText ?? raw.warningText, DEFAULT_WARNING_TEXT),
    badgeFontFamily: toText(raw.BadgeFontFamily ?? raw.badgeFontFamily, DEFAULT_FONT_FAMILY),
    headerFontFamily: toText(raw.HeaderFontFamily ?? raw.headerFontFamily, DEFAULT_FONT_FAMILY),
    countryFontFamily: toText(raw.CountryFontFamily ?? raw.countryFontFamily, DEFAULT_FONT_FAMILY),
    warningFontFamily: toText(raw.WarningFontFamily ?? raw.warningFontFamily, DEFAULT_FONT_FAMILY),
    referenceFontFamily: toText(raw.ReferenceFontFamily ?? raw.referenceFontFamily, DEFAULT_FONT_FAMILY),
    printerName: String(raw.PrinterName ?? raw.printerName ?? ""),
    createdBy: String(raw.CreateBy ?? raw.createBy ?? "Sistema"),
    createdAt,
    updatedAt,
  };
}

function mapPrintSettingsFromApi(payload: ShippingLabelPrintSettingsApiModel): ShippingLabelPrintSettings {
  const raw = payload as Record<string, unknown>;
  const createdAt = String(raw.CreateDate ?? raw.createDate ?? new Date().toISOString());
  const updatedAt = String(raw.LastUpdate ?? raw.lastUpdate ?? createdAt);

  return {
    id: String(raw.Id ?? raw.id ?? ""),
    username: String(raw.Username ?? raw.username ?? "Sistema"),
    widthMm: toNumber(raw.WidthMm ?? raw.widthMm, 100),
    heightMm: toNumber(raw.HeightMm ?? raw.heightMm, 50),
    marginLeftMm: toNumber(raw.MarginLeftMm ?? raw.marginLeftMm),
    marginTopMm: toNumber(raw.MarginTopMm ?? raw.marginTopMm),
    marginRightMm: toNumber(raw.MarginRightMm ?? raw.marginRightMm),
    marginBottomMm: toNumber(raw.MarginBottomMm ?? raw.marginBottomMm),
    ...mapLayoutFields(raw),
    badgeFontMm: toFontNumber(raw.BadgeFontMm ?? raw.badgeFontMm, 7.5),
    headerFontMm: toFontNumber(raw.HeaderFontMm ?? raw.headerFontMm, 5.6),
    countryFontMm: toFontNumber(raw.CountryFontMm ?? raw.countryFontMm, 6.6),
    warningFontMm: toFontNumber(raw.WarningFontMm ?? raw.warningFontMm, 5.6),
    referenceFontMm: toFontNumber(raw.ReferenceFontMm ?? raw.referenceFontMm, 4.8),
    badgeBold: toBoolean(raw.BadgeBold ?? raw.badgeBold, true),
    headerBold: toBoolean(raw.HeaderBold ?? raw.headerBold, true),
    countryBold: toBoolean(raw.CountryBold ?? raw.countryBold, true),
    warningBold: toBoolean(raw.WarningBold ?? raw.warningBold, false),
    referenceBold: toBoolean(raw.ReferenceBold ?? raw.referenceBold, true),
    badgeText: toText(raw.BadgeText ?? raw.badgeText, DEFAULT_BADGE_TEXT),
    headerPrefix: toText(raw.HeaderPrefix ?? raw.headerPrefix, DEFAULT_HEADER_PREFIX),
    assyHeaderPrefix: toText(raw.AssyHeaderPrefix ?? raw.assyHeaderPrefix, DEFAULT_ASSY_HEADER_PREFIX),
    countryText: toText(raw.CountryText ?? raw.countryText, DEFAULT_COUNTRY_TEXT),
    warningText: toText(raw.WarningText ?? raw.warningText, DEFAULT_WARNING_TEXT),
    badgeFontFamily: toText(raw.BadgeFontFamily ?? raw.badgeFontFamily, DEFAULT_FONT_FAMILY),
    headerFontFamily: toText(raw.HeaderFontFamily ?? raw.headerFontFamily, DEFAULT_FONT_FAMILY),
    countryFontFamily: toText(raw.CountryFontFamily ?? raw.countryFontFamily, DEFAULT_FONT_FAMILY),
    warningFontFamily: toText(raw.WarningFontFamily ?? raw.warningFontFamily, DEFAULT_FONT_FAMILY),
    referenceFontFamily: toText(raw.ReferenceFontFamily ?? raw.referenceFontFamily, DEFAULT_FONT_FAMILY),
    badgeWidthMm: toFontNumber(raw.BadgeWidthMm ?? raw.badgeWidthMm, 21.5),
    badgeHeightMm: toFontNumber(raw.BadgeHeightMm ?? raw.badgeHeightMm, 13.03),
    badgeStrokeWidthMm: toFontNumber(raw.BadgeStrokeWidthMm ?? raw.badgeStrokeWidthMm, DEFAULT_BADGE_STROKE_WIDTH_MM),
    printerName: String(raw.PrinterName ?? raw.printerName ?? ""),
    createdAt,
    updatedAt,
  };
}

function mapPrintJobFromApi(payload: ShippingLabelPrintJobApiModel): ShippingLabelPrintJob {
  const raw = payload as Record<string, unknown>;
  const labelsPayload = Array.isArray(raw.Labels ?? raw.labels)
    ? (raw.Labels ?? raw.labels) as ShippingLabelPrintItemApiModel[]
    : [];

  return {
    recordId: String(raw.RecordId ?? raw.recordId ?? ""),
    partNumber: String(raw.PartNumber ?? raw.partNumber ?? ""),
    labelModel: normalizeLabelModel(raw.LabelModel ?? raw.labelModel),
    printerName: String(raw.PrinterName ?? raw.printerName ?? ""),
    badgeFontMm: toFontNumber(raw.BadgeFontMm ?? raw.badgeFontMm, 7.5),
    headerFontMm: toFontNumber(raw.HeaderFontMm ?? raw.headerFontMm, 5.6),
    countryFontMm: toFontNumber(raw.CountryFontMm ?? raw.countryFontMm, 6.6),
    warningFontMm: toFontNumber(raw.WarningFontMm ?? raw.warningFontMm, 5.6),
    referenceFontMm: toFontNumber(raw.ReferenceFontMm ?? raw.referenceFontMm, 4.8),
    badgeWidthMm: toFontNumber(raw.BadgeWidthMm ?? raw.badgeWidthMm, 21.5),
    badgeHeightMm: toFontNumber(raw.BadgeHeightMm ?? raw.badgeHeightMm, 13.03),
    badgeStrokeWidthMm: toFontNumber(raw.BadgeStrokeWidthMm ?? raw.badgeStrokeWidthMm, DEFAULT_BADGE_STROKE_WIDTH_MM),
    widthMm: toNumber(raw.WidthMm ?? raw.widthMm, 100),
    heightMm: toNumber(raw.HeightMm ?? raw.heightMm, 50),
    marginLeftMm: toNumber(raw.MarginLeftMm ?? raw.marginLeftMm),
    marginTopMm: toNumber(raw.MarginTopMm ?? raw.marginTopMm),
    marginRightMm: toNumber(raw.MarginRightMm ?? raw.marginRightMm),
    marginBottomMm: toNumber(raw.MarginBottomMm ?? raw.marginBottomMm),
    ...mapLayoutFields(raw),
    badgeBold: toBoolean(raw.BadgeBold ?? raw.badgeBold, true),
    headerBold: toBoolean(raw.HeaderBold ?? raw.headerBold, true),
    countryBold: toBoolean(raw.CountryBold ?? raw.countryBold, true),
    warningBold: toBoolean(raw.WarningBold ?? raw.warningBold, false),
    referenceBold: toBoolean(raw.ReferenceBold ?? raw.referenceBold, true),
    badgeText: toText(raw.BadgeText ?? raw.badgeText, DEFAULT_BADGE_TEXT),
    headerPrefix: toText(raw.HeaderPrefix ?? raw.headerPrefix, DEFAULT_HEADER_PREFIX),
    assyHeaderPrefix: toText(raw.AssyHeaderPrefix ?? raw.assyHeaderPrefix, DEFAULT_ASSY_HEADER_PREFIX),
    countryText: toText(raw.CountryText ?? raw.countryText, DEFAULT_COUNTRY_TEXT),
    warningText: toText(raw.WarningText ?? raw.warningText, DEFAULT_WARNING_TEXT),
    badgeFontFamily: toText(raw.BadgeFontFamily ?? raw.badgeFontFamily, DEFAULT_FONT_FAMILY),
    headerFontFamily: toText(raw.HeaderFontFamily ?? raw.headerFontFamily, DEFAULT_FONT_FAMILY),
    countryFontFamily: toText(raw.CountryFontFamily ?? raw.countryFontFamily, DEFAULT_FONT_FAMILY),
    warningFontFamily: toText(raw.WarningFontFamily ?? raw.warningFontFamily, DEFAULT_FONT_FAMILY),
    referenceFontFamily: toText(raw.ReferenceFontFamily ?? raw.referenceFontFamily, DEFAULT_FONT_FAMILY),
    labels: labelsPayload.map((item) => {
      const itemRaw = item as Record<string, unknown>;
      return {
        sequence: toNumber(itemRaw.Sequence ?? itemRaw.sequence),
        serialNumber: String(itemRaw.SerialNumber ?? itemRaw.serialNumber ?? ""),
        referenceText: String(itemRaw.ReferenceText ?? itemRaw.referenceText ?? ""),
        partNumber: String(itemRaw.PartNumber ?? itemRaw.partNumber ?? ""),
      };
    }),
  };
}

function buildSavePayload(payload: ShippingLabelSavePayload) {
  return {
    PartNumberId: Number(payload.partNumberId),
    ReferenceDate: payload.referenceDate,
    RangeStart: Number(payload.rangeStart),
    RangeEnd: Number(payload.rangeEnd),
    LabelModel: payload.labelModel,
    BadgeFontMm: payload.badgeFontMm,
    HeaderFontMm: payload.headerFontMm,
    CountryFontMm: payload.countryFontMm,
    WarningFontMm: payload.warningFontMm,
    ReferenceFontMm: payload.referenceFontMm,
    BadgeWidthMm: payload.badgeWidthMm,
    BadgeHeightMm: payload.badgeHeightMm,
    BadgeStrokeWidthMm: payload.badgeStrokeWidthMm,
    LabelWidthMm: payload.labelWidthMm,
    LabelHeightMm: payload.labelHeightMm,
    MarginLeftMm: payload.marginLeftMm,
    MarginTopMm: payload.marginTopMm,
    MarginRightMm: payload.marginRightMm,
    MarginBottomMm: payload.marginBottomMm,
    BadgeLeftMm: payload.badgeLeftMm,
    BadgeTopMm: payload.badgeTopMm,
    HeaderLeftMm: payload.headerLeftMm,
    HeaderTopMm: payload.headerTopMm,
    HeaderRightMm: payload.headerRightMm,
    CountryLeftMm: payload.countryLeftMm,
    CountryTopMm: payload.countryTopMm,
    CountryRightMm: payload.countryRightMm,
    WarningLeftMm: payload.warningLeftMm,
    WarningTopMm: payload.warningTopMm,
    WarningRightMm: payload.warningRightMm,
    ReferenceLeftMm: payload.referenceLeftMm,
    ReferenceTopMm: payload.referenceTopMm,
    ReferenceRightMm: payload.referenceRightMm,
    BadgeBold: payload.badgeBold,
    HeaderBold: payload.headerBold,
    CountryBold: payload.countryBold,
    WarningBold: payload.warningBold,
    ReferenceBold: payload.referenceBold,
    BadgeText: payload.badgeText,
    HeaderPrefix: payload.headerPrefix,
    AssyHeaderPrefix: payload.assyHeaderPrefix,
    CountryText: payload.countryText,
    WarningText: payload.warningText,
    BadgeFontFamily: payload.badgeFontFamily,
    HeaderFontFamily: payload.headerFontFamily,
    CountryFontFamily: payload.countryFontFamily,
    WarningFontFamily: payload.warningFontFamily,
    ReferenceFontFamily: payload.referenceFontFamily,
    PrinterName: payload.printerName?.trim() || null,
    CreateBy: payload.createBy?.trim() || null,
  };
}

export async function fetchShippingLabels(): Promise<ShippingLabel[]> {
  const list = await requestJson<ShippingLabelApiModel[]>("/api/ShippingLabel");
  if (!Array.isArray(list)) return [];
  return list.map(mapShippingLabelFromApi);
}

export async function createShippingLabel(payload: ShippingLabelSavePayload): Promise<ShippingLabel> {
  const response = await requestJson<ShippingLabelApiResponse>("/api/ShippingLabel", {
    method: "POST",
    body: JSON.stringify(buildSavePayload(payload)),
  });

  if (!response?.shippingLabel) {
    throw new Error(response?.message || "Resposta inválida do servidor.");
  }

  return mapShippingLabelFromApi(response.shippingLabel);
}

export async function updateShippingLabel(id: string, payload: ShippingLabelSavePayload): Promise<ShippingLabel> {
  const response = await requestJson<ShippingLabelApiResponse>(`/api/ShippingLabel/${id}`, {
    method: "PUT",
    body: JSON.stringify(buildSavePayload(payload)),
  });

  if (!response?.shippingLabel) {
    throw new Error(response?.message || "Resposta inválida do servidor.");
  }

  return mapShippingLabelFromApi(response.shippingLabel);
}

export async function deleteShippingLabel(id: string) {
  await requestJson(`/api/ShippingLabel/${id}`, {
    method: "DELETE",
  });
}

export async function fetchShippingLabelPrintSettings(username: string): Promise<ShippingLabelPrintSettings> {
  const response = await requestJson<ShippingLabelPrintSettingsApiModel>(
    `/api/ShippingLabel/print-settings?username=${encodeURIComponent(username)}`
  );
  return mapPrintSettingsFromApi(response);
}

export async function saveShippingLabelPrintSettings(
  payload: ShippingLabelPrintSettingsPayload
): Promise<ShippingLabelPrintSettings> {
  const response = await requestJson<ShippingLabelPrintSettingsResponse>("/api/ShippingLabel/print-settings", {
    method: "PUT",
    body: JSON.stringify({
      Username: payload.username,
      WidthMm: payload.widthMm,
      HeightMm: payload.heightMm,
      MarginLeftMm: payload.marginLeftMm,
      MarginTopMm: payload.marginTopMm,
      MarginRightMm: payload.marginRightMm,
      MarginBottomMm: payload.marginBottomMm,
      BadgeLeftMm: payload.badgeLeftMm,
      BadgeTopMm: payload.badgeTopMm,
      HeaderLeftMm: payload.headerLeftMm,
      HeaderTopMm: payload.headerTopMm,
      HeaderRightMm: payload.headerRightMm,
      CountryLeftMm: payload.countryLeftMm,
      CountryTopMm: payload.countryTopMm,
      CountryRightMm: payload.countryRightMm,
      WarningLeftMm: payload.warningLeftMm,
      WarningTopMm: payload.warningTopMm,
      WarningRightMm: payload.warningRightMm,
      ReferenceLeftMm: payload.referenceLeftMm,
      ReferenceTopMm: payload.referenceTopMm,
      ReferenceRightMm: payload.referenceRightMm,
      BadgeFontMm: payload.badgeFontMm,
      HeaderFontMm: payload.headerFontMm,
      CountryFontMm: payload.countryFontMm,
      WarningFontMm: payload.warningFontMm,
      ReferenceFontMm: payload.referenceFontMm,
      BadgeBold: payload.badgeBold,
      HeaderBold: payload.headerBold,
      CountryBold: payload.countryBold,
      WarningBold: payload.warningBold,
      ReferenceBold: payload.referenceBold,
      BadgeText: payload.badgeText,
      HeaderPrefix: payload.headerPrefix,
      AssyHeaderPrefix: payload.assyHeaderPrefix,
      CountryText: payload.countryText,
      WarningText: payload.warningText,
      BadgeFontFamily: payload.badgeFontFamily,
      HeaderFontFamily: payload.headerFontFamily,
      CountryFontFamily: payload.countryFontFamily,
      WarningFontFamily: payload.warningFontFamily,
      ReferenceFontFamily: payload.referenceFontFamily,
      BadgeWidthMm: payload.badgeWidthMm,
      BadgeHeightMm: payload.badgeHeightMm,
      BadgeStrokeWidthMm: payload.badgeStrokeWidthMm,
      PrinterName: payload.printerName?.trim() || null,
    }),
  });

  if (!response?.settings) {
    throw new Error(response?.message || "Resposta inválida do servidor.");
  }

  return mapPrintSettingsFromApi(response.settings);
}

export async function fetchShippingLabelPrinters(): Promise<string[]> {
  const list = await requestJson<string[]>("/api/ShippingLabel/printers");
  if (!Array.isArray(list)) return [];
  return Array.from(
    new Set(
      list
        .map((name) => String(name ?? "").trim())
        .filter((name) => name.length > 0)
    )
  ).sort((a, b) => a.localeCompare(b, "pt-BR"));
}

export async function fetchShippingLabelPrintJob(id: string): Promise<ShippingLabelPrintJob> {
  const response = await requestJson<ShippingLabelPrintJobApiModel>(`/api/ShippingLabel/${id}/print-job`);
  return mapPrintJobFromApi(response);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeCssString(value: string) {
  return value.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

function formatMm(value: number) {
  return `${Math.max(value, 0).toFixed(2)}mm`;
}

function positiveMm(value: number, fallback: number) {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function buildHeaderText(job: ShippingLabelPrintJob, partNumber: string) {
  const prefix = normalizeLabelModel(job.labelModel) === "ASSY" ? job.assyHeaderPrefix : job.headerPrefix;
  return `${prefix} ${partNumber}`.replace(/\s+/g, " ").trim();
}

function buildBadgeMarkup() {
  return `
    <svg class="label-badge-shape" viewBox="0 0 99 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" preserveAspectRatio="none">
      <path d="M49.5 0.5C63.0931 0.5 75.3748 3.84073 84.2422 9.21484C93.1187 14.5946 98.5 21.9579 98.5 30C98.5 38.0421 93.1187 45.4054 84.2422 50.7852C75.3748 56.1593 63.0931 59.5 49.5 59.5C35.9069 59.5 23.6252 56.1593 14.7578 50.7852C5.88126 45.4054 0.5 38.0421 0.5 30C0.5 21.9579 5.88126 14.5946 14.7578 9.21484C23.6252 3.84073 35.9069 0.5 49.5 0.5Z" stroke="black"/>
    </svg>
  `;
}

function buildPrintMarkup(job: ShippingLabelPrintJob) {
  const widthMm = positiveMm(job.widthMm, 100);
  const heightMm = positiveMm(job.heightMm, 50);
  const marginLeftMm = Math.max(job.marginLeftMm, 0);
  const marginTopMm = Math.max(job.marginTopMm, 0);
  const marginRightMm = Math.max(job.marginRightMm, 0);
  const marginBottomMm = Math.max(job.marginBottomMm, 0);
  const innerWidthMm = Math.max(widthMm - marginLeftMm - marginRightMm, 20);
  const innerHeightMm = Math.max(heightMm - marginTopMm - marginBottomMm, 12);
  const layoutScale = Math.max(0.45, Math.min(widthMm / 100, heightMm / 50));
  const badgeFontMm = positiveMm(job.badgeFontMm, 7.5);
  const headerFontMm = positiveMm(job.headerFontMm, 5.6);
  const countryFontMm = positiveMm(job.countryFontMm, 6.6);
  const warningFontMm = positiveMm(job.warningFontMm, 5.6);
  const referenceFontMm = positiveMm(job.referenceFontMm, 4.8);
  const badgeWidthMm = positiveMm(job.badgeWidthMm, 21.5);
  const badgeHeightMm = positiveMm(job.badgeHeightMm, 13.03);
  const badgeStrokeWidthMm = positiveMm(job.badgeStrokeWidthMm, DEFAULT_BADGE_STROKE_WIDTH_MM);
  const badgeText = escapeHtml(toText(job.badgeText, DEFAULT_BADGE_TEXT));
  const countryText = escapeHtml(toText(job.countryText, DEFAULT_COUNTRY_TEXT));
  const warningText = escapeHtml(toText(job.warningText, DEFAULT_WARNING_TEXT));
  const badgeFontFamily = escapeCssString(toText(job.badgeFontFamily, DEFAULT_FONT_FAMILY));
  const headerFontFamily = escapeCssString(toText(job.headerFontFamily, DEFAULT_FONT_FAMILY));
  const countryFontFamily = escapeCssString(toText(job.countryFontFamily, DEFAULT_FONT_FAMILY));
  const warningFontFamily = escapeCssString(toText(job.warningFontFamily, DEFAULT_FONT_FAMILY));
  const referenceFontFamily = escapeCssString(toText(job.referenceFontFamily, DEFAULT_FONT_FAMILY));
  const topGapMm = 1.4 * layoutScale;
  const leftGapMm = 1.4 * layoutScale;
  const rowGapMm = Math.max(1.2, 2.8 * layoutScale);
  const headerLeftMm = leftGapMm + badgeWidthMm + rowGapMm;
  const topRowHeightMm = Math.max(
    badgeHeightMm,
    headerFontMm + (2.4 * layoutScale),
    9.4 * layoutScale
  );
  const countryTopMm = topGapMm + topRowHeightMm + Math.max(1.6, 4.4 * layoutScale);
  const badgeLeftMm = Math.max(job.badgeLeftMm, 0);
  const badgeTopMm = Math.max(job.badgeTopMm, 0);
  const headerLeft = Math.max(job.headerLeftMm, headerLeftMm);
  const headerTop = Math.max(job.headerTopMm, 0);
  const headerRight = Math.max(job.headerRightMm, 0);
  const countryLeft = Math.max(job.countryLeftMm, headerLeftMm);
  const countryTop = Math.max(job.countryTopMm, countryTopMm);
  const countryRight = Math.max(job.countryRightMm, 0);
  const warningLeft = Math.max(job.warningLeftMm, 0);
  const warningTop = Math.max(job.warningTopMm, 0);
  const warningRight = Math.max(job.warningRightMm, 0);
  const referenceLeft = Math.max(job.referenceLeftMm, 0);
  const referenceTop = Math.max(job.referenceTopMm, 0);
  const referenceRight = Math.max(job.referenceRightMm, 0);

  const pages = job.labels
    .map((label) => {
      const referenceText = escapeHtml(label.referenceText);
      const serialNumber = escapeHtml(label.serialNumber);
      const partNumber = escapeHtml(label.partNumber);
      const headerText = escapeHtml(buildHeaderText(job, label.partNumber));

      return `
        <section class="label-page">
          <div class="label-content">
            <div class="label-badge">
              ${buildBadgeMarkup()}
              <span class="label-badge-text">${badgeText}</span>
            </div>
            <div class="label-top-row">
              <div class="label-header">${headerText}</div>
            </div>
            <div class="label-country">${countryText}</div>
            <div class="label-warning">${warningText}</div>
            <div class="label-reference">${referenceText}</div>
            <div class="label-serial" aria-hidden="true">${serialNumber}</div>
            <div class="label-part-number" aria-hidden="true">${partNumber}</div>
          </div>
        </section>
      `;
    })
    .join("");

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <title>Etiqueta de Embarque</title>
        <style>
          @page {
            size: ${widthMm}mm ${heightMm}mm;
            margin: 0;
          }

          html, body {
            margin: 0;
            padding: 0;
            background: #fff;
          }

          body {
            font-family: Arial, Helvetica, sans-serif;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .label-page {
            width: ${formatMm(widthMm)};
            height: ${formatMm(heightMm)};
            box-sizing: border-box;
            page-break-after: always;
            break-after: page;
            padding-left: ${formatMm(marginLeftMm)};
            padding-top: ${formatMm(marginTopMm)};
            padding-right: ${formatMm(marginRightMm)};
            padding-bottom: ${formatMm(marginBottomMm)};
            overflow: hidden;
          }

          .label-page:last-child {
            page-break-after: auto;
            break-after: auto;
          }

          .label-content {
            position: relative;
            width: ${formatMm(innerWidthMm)};
            height: ${formatMm(innerHeightMm)};
            box-sizing: border-box;
            overflow: hidden;
          }

          .label-top-row {
            position: absolute;
            top: ${formatMm(headerTop)};
            left: ${formatMm(headerLeft)};
            right: ${formatMm(headerRight)};
            min-height: ${formatMm(topRowHeightMm)};
            display: flex;
            align-items: center;
            box-sizing: border-box;
          }

          .label-badge {
            position: absolute;
            top: ${formatMm(badgeTopMm)};
            left: ${formatMm(badgeLeftMm)};
            width: ${formatMm(badgeWidthMm)};
            height: ${formatMm(badgeHeightMm)};
          }

          .label-badge-shape {
            width: 100%;
            height: 100%;
            display: block;
          }

          .label-badge-shape path {
            stroke-width: ${formatMm(badgeStrokeWidthMm)};
            vector-effect: non-scaling-stroke;
          }

          .label-badge-text {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${formatMm(badgeFontMm)};
            font-family: "${badgeFontFamily}", Arial, Helvetica, sans-serif;
            line-height: 1.05;
            font-weight: ${job.badgeBold ? 700 : 400};
          }

          .label-header {
            position: static;
            flex: 1 1 auto;
            min-width: 0;
            min-height: ${formatMm(Math.max(headerFontMm + (2.4 * layoutScale), 9.4 * layoutScale))};
            display: flex;
            align-items: center;
            font-size: ${formatMm(headerFontMm)};
            font-family: "${headerFontFamily}", Arial, Helvetica, sans-serif;
            line-height: 1.05;
            font-weight: ${job.headerBold ? 700 : 400};
            letter-spacing: 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .label-country {
            position: absolute;
            top: ${formatMm(countryTop)};
            left: ${formatMm(countryLeft)};
            right: ${formatMm(countryRight)};
            font-size: ${formatMm(countryFontMm)};
            font-family: "${countryFontFamily}", Arial, Helvetica, sans-serif;
            line-height: 1.05;
            font-weight: ${job.countryBold ? 700 : 400};
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .label-warning {
            position: absolute;
            top: ${formatMm(warningTop)};
            left: ${formatMm(warningLeft)};
            right: ${formatMm(warningRight)};
            font-size: ${formatMm(warningFontMm)};
            font-family: "${warningFontFamily}", Arial, Helvetica, sans-serif;
            line-height: 1.05;
            font-weight: ${job.warningBold ? 700 : 400};
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            text-align: left;
          }

          .label-reference {
            position: absolute;
            top: ${formatMm(referenceTop)};
            left: ${formatMm(referenceLeft)};
            right: ${formatMm(referenceRight)};
            display: flex;
            align-items: center;
            justify-content: flex-start;
            font-size: ${formatMm(referenceFontMm)};
            font-family: "${referenceFontFamily}", Arial, Helvetica, sans-serif;
            line-height: 1;
            font-weight: ${job.referenceBold ? 700 : 400};
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .label-serial,
          .label-part-number {
            display: none;
          }
        </style>
      </head>
      <body>${pages}</body>
    </html>
  `;
}

export async function printShippingLabel(job: ShippingLabelPrintJob): Promise<void> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("Impressão disponível apenas no navegador.");
  }

  await new Promise<void>((resolve, reject) => {
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";

    const cleanup = () => {
      window.setTimeout(() => {
        iframe.remove();
      }, 2000);
    };

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc || !iframe.contentWindow) {
      iframe.remove();
      reject(new Error("Falha ao preparar a impressão."));
      return;
    }

    doc.open();
    doc.write(buildPrintMarkup(job));
    doc.close();

    window.setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        cleanup();
        resolve();
      } catch (error) {
        cleanup();
        reject(error instanceof Error ? error : new Error("Falha ao imprimir."));
      }
    }, 300);
  });
}
