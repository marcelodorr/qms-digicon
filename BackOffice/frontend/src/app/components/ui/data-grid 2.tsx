import * as React from "react";
import {
  DataGrid,
  GridOverlay,
  GridToolbarContainer,
  type DataGridProps,
  type GridColDef,
  type GridValidRowModel,
  type GridRowSelectionModel,
  type GridRowId,
} from "@mui/x-data-grid";
import * as XLSX from "xlsx";
import { FileOutput } from "lucide-react";
import { Button } from "./button";

type QmsDataGridProps = DataGridProps & {
  emptyMessage?: string;
  loadingMessage?: string;
  exportFileName?: string;
  exportSheetName?: string;
  enableSelection?: boolean;
  onDeleteSelected?: (ids: GridRowId[]) => void | Promise<void>;
  deleteSelectedLabel?: string;
};

function GridMessage({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-6 text-sm text-slate-500">
      {message}
    </div>
  );
}

function EmptyOverlay({ message }: { message: string }) {
  return (
    <GridOverlay>
      <GridMessage message={message} />
    </GridOverlay>
  );
}

function LoadingOverlay({ message }: { message: string }) {
  return (
    <GridOverlay>
      <GridMessage message={message} />
    </GridOverlay>
  );
}

type ExportToolbarProps = {
  rows: GridValidRowModel[];
  columns: GridColDef[];
  fileName: string;
  sheetName: string;
  selectedIds: GridRowId[];
  onDeleteSelected?: (ids: GridRowId[]) => void | Promise<void>;
  onClearSelection: () => void;
  deleteSelectedLabel: string;
};

const emptySelection: GridRowSelectionModel = {
  type: "include",
  ids: new Set<GridRowId>(),
};

const normalizeFileName = (name: string) => {
  const trimmed = name.trim() || "dados";
  return trimmed.toLowerCase().endsWith(".xlsx") ? trimmed : `${trimmed}.xlsx`;
};

const getColumnHeader = (column: GridColDef) => {
  if (typeof column.headerName === "string" && column.headerName.trim()) {
    return column.headerName.trim();
  }
  return column.field;
};

const getCellExportValue = (row: GridValidRowModel, column: GridColDef) => {
  let value = row[column.field as keyof GridValidRowModel];
  if (column.valueGetter) {
    value = column.valueGetter({ row, value, field: column.field } as never);
  }
  if (column.valueFormatter) {
    value = column.valueFormatter({ row, value, field: column.field } as never);
  }
  if (Array.isArray(value)) {
    return value.map(item => String(item ?? "")).join(", ");
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (value == null) {
    return "";
  }
  return String(value);
};

const getRowIdValue = (
  row: GridValidRowModel,
  getRowId?: (row: GridValidRowModel) => GridRowId
) => {
  if (getRowId) {
    return getRowId(row);
  }
  return (row as { id?: GridRowId }).id ?? "";
};

const resolveSelectedIds = (
  model: GridRowSelectionModel,
  rows: GridValidRowModel[],
  getRowId?: (row: GridValidRowModel) => GridRowId
) => {
  if (model.type === "exclude") {
    const excluded = model.ids;
    return rows
      .map(row => getRowIdValue(row, getRowId))
      .filter(id => id !== "" && !excluded.has(id));
  }
  return Array.from(model.ids);
};

function ExportToolbar({
  rows,
  columns,
  fileName,
  sheetName,
  selectedIds,
  onDeleteSelected,
  onClearSelection,
  deleteSelectedLabel,
}: ExportToolbarProps) {
  const handleExport = () => {
    const exportColumns = columns.filter(
      column =>
        column.field !== "actions" &&
        !(column as { disableExport?: boolean }).disableExport &&
        !("hide" in column && Boolean((column as { hide?: boolean }).hide))
    );

    const headerRow = exportColumns.map(getColumnHeader);
    const dataRows = rows.map(row =>
      exportColumns.map(column => getCellExportValue(row, column))
    );

    const worksheet = XLSX.utils.aoa_to_sheet([headerRow, ...dataRows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName || "Dados");
    XLSX.writeFile(workbook, normalizeFileName(fileName));
  };

  const handleDelete = async () => {
    if (!onDeleteSelected || selectedIds.length === 0) return;
    try {
      await onDeleteSelected(selectedIds);
      onClearSelection();
    } catch {
      // Keep selection to allow retry after failure.
    }
  };

  return (
    <GridToolbarContainer sx={{ justifyContent: "space-between", p: 1 }}>
      {onDeleteSelected ? (
        <Button
          variant="outline"
          size="sm"
          onClick={handleDelete}
          disabled={selectedIds.length === 0}
        >
          {deleteSelectedLabel}
        </Button>
      ) : (
        <span />
      )}
      <Button variant="outline" size="sm" onClick={handleExport}>
        <FileOutput className="h-4 w-4 mr-2" />
        Exportar XLSX
      </Button>
    </GridToolbarContainer>
  );
}

export function QmsDataGrid({
  emptyMessage = "Nenhum registro encontrado.",
  loadingMessage = "Carregando...",
  exportFileName = "dados_exportados.xlsx",
  exportSheetName = "Dados",
  enableSelection,
  onDeleteSelected,
  deleteSelectedLabel = "Excluir selecionados",
  showToolbar,
  sx,
  slots,
  slotProps,
  ...props
}: QmsDataGridProps) {
  const resolvedShowToolbar = showToolbar ?? true;
  const resolvedEnableSelection = props.checkboxSelection ?? (enableSelection ?? Boolean(onDeleteSelected));
  const [selectionModel, setSelectionModel] = React.useState<GridRowSelectionModel>(emptySelection);
  const isSelectionControlled = props.rowSelectionModel !== undefined;
  const resolvedSelectionModel = isSelectionControlled ? props.rowSelectionModel : selectionModel;

  const handleSelectionChange = (newSelection: GridRowSelectionModel) => {
    if (!isSelectionControlled) {
      setSelectionModel(newSelection);
    }
    props.onRowSelectionModelChange?.(newSelection);
  };

  const clearSelection = () => {
    const nextSelection = { type: "include", ids: new Set<GridRowId>() };
    if (isSelectionControlled) {
      props.onRowSelectionModelChange?.(nextSelection);
    } else {
      setSelectionModel(nextSelection);
    }
  };

  return (
    <DataGrid
      {...props}
      autoHeight
      disableRowSelectionOnClick
      disableColumnSelector
      disableDensitySelector
      showToolbar={resolvedShowToolbar}
      checkboxSelection={resolvedEnableSelection}
      rowSelectionModel={resolvedEnableSelection ? resolvedSelectionModel : undefined}
      onRowSelectionModelChange={resolvedEnableSelection ? handleSelectionChange : undefined}
      pagination
      pageSizeOptions={[10]}
      initialState={{
        pagination: {
          paginationModel: {
            page: 0,
            pageSize: 10,
          },
        },
      }}
      rowHeight={52}
      columnHeaderHeight={48}
      slots={{
        toolbar: ExportToolbar,
        noRowsOverlay: () => <EmptyOverlay message={emptyMessage} />,
        noResultsOverlay: () => <EmptyOverlay message={emptyMessage} />,
        loadingOverlay: () => <LoadingOverlay message={loadingMessage} />,
        ...slots,
      }}
      slotProps={{
        ...slotProps,
        toolbar: {
          rows: (props.rows ?? []) as GridValidRowModel[],
          columns: (props.columns ?? []) as GridColDef[],
          fileName: exportFileName,
          sheetName: exportSheetName,
          selectedIds: resolvedEnableSelection && resolvedSelectionModel
            ? resolveSelectedIds(
                resolvedSelectionModel,
                (props.rows ?? []) as GridValidRowModel[],
                props.getRowId as ((row: GridValidRowModel) => GridRowId) | undefined
              )
            : [],
          onDeleteSelected: resolvedEnableSelection ? onDeleteSelected : undefined,
          onClearSelection: clearSelection,
          deleteSelectedLabel,
        },
      }}
      sx={{
        width: "calc(100% - 32px)",
        margin: "16px",
        boxSizing: "border-box",
        border: 0,
        fontFamily: "inherit",
        fontSize: 14,
        color: "var(--foreground)",
        backgroundColor: "var(--card)",
        "& .MuiDataGrid-columnHeaders": {
          backgroundColor: "var(--secondary)",
          color: "var(--data-grid-header-foreground)",
          borderBottom: "1px solid var(--border)",
        },
        "& .MuiDataGrid-columnHeader": {
          color: "var(--data-grid-header-foreground)",
        },
        "& .MuiDataGrid-columnHeaderTitle": {
          color: "var(--data-grid-header-foreground)",
          fontWeight: 600,
        },
        "& .MuiDataGrid-cell": {
          borderBottom: "1px solid var(--border)",
        },
        "& .MuiDataGrid-row:hover": {
          backgroundColor: "var(--accent)",
        },
        "& .MuiDataGrid-row.Mui-selected": {
          backgroundColor: "var(--secondary)",
        },
        "& .MuiDataGrid-virtualScroller": {
          backgroundColor: "var(--card)",
        },
        "& .MuiDataGrid-footerContainer": {
          borderTop: "1px solid var(--border)",
          backgroundColor: "var(--card)",
        },
        "& .MuiDataGrid-columnSeparator": {
          color: "var(--border)",
        },
        "& .MuiDataGrid-sortIcon": {
          color: "var(--data-grid-header-foreground)",
        },
        "& .MuiDataGrid-menuIconButton": {
          color: "var(--data-grid-header-foreground)",
        },
        "& .MuiDataGrid-filterIcon": {
          color: "var(--data-grid-header-foreground)",
        },
        "& .MuiDataGrid-cell:focus, & .MuiDataGrid-columnHeader:focus": {
          outline: "none",
        },
        "& .MuiDataGrid-cell:focus-within, & .MuiDataGrid-columnHeader:focus-within": {
          outline: "none",
        },
        ...sx,
      }}
    />
  );
}
