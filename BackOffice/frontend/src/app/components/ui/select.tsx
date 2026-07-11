"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  XIcon,
} from "lucide-react";

import { cn } from "./utils";
import { Input } from "./input";

// MUI
import Autocomplete, {
  AutocompleteProps,
} from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

// estilos do Autocomplete no estilo pill azul
import { autocompleteBaseStyles } from "./autocomplete-base-styles";

type SelectSearchContextValue = {
  query: string;
  normalizedQuery: string;
  setQuery: (value: string) => void;
  enabled: boolean;
};

const SelectSearchContext = React.createContext<SelectSearchContextValue | null>(
  null,
);

const normalizeSearchValue = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const extractText = (node: React.ReactNode): string => {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(extractText).join(" ");
  }
  if (React.isValidElement(node) && node.props) {
    return extractText(
      (node.props as { children?: React.ReactNode }).children,
    );
  }
  return "";
};

function Select({
  onOpenChange,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  const [query, setQuery] = React.useState("");
  const normalizedQuery = React.useMemo(
    () => normalizeSearchValue(query),
    [query],
  );

  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      if (!open) setQuery("");
      onOpenChange?.(open);
    },
    [onOpenChange],
  );

  const handleSetQuery = React.useCallback((value: string) => {
    setQuery(value);
  }, []);

  const contextValue = React.useMemo(
    () => ({
      query,
      normalizedQuery,
      setQuery: handleSetQuery,
      enabled: true,
    }),
    [query, normalizedQuery, handleSetQuery],
  );

  return (
    <SelectSearchContext.Provider value={contextValue}>
      <SelectPrimitive.Root
        data-slot="select"
        onOpenChange={handleOpenChange}
        {...props}
      >
        {children}
      </SelectPrimitive.Root>
    </SelectSearchContext.Provider>
  );
}

function SelectGroup(
  props: React.ComponentProps<typeof SelectPrimitive.Group>,
) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectValue(
  props: React.ComponentProps<typeof SelectPrimitive.Value>,
) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

/**
 * Trigger com estilo “barra/pílula” azul clara,
 * igual ao componente da imagem (Revisão / Automático).
 */
function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "default";
}) {
  const sizeClasses =
    size === "sm" ? "h-8 text-xs" : "h-10 text-sm";

  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "flex w-full items-center gap-2 rounded-xl bg-[#F3F7FC] px-4",
        "text-slate-600 shadow-none border-0 outline-none",
        "disabled:cursor-not-allowed disabled:opacity-60",
        "focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-0",
        sizeClasses,
        "*:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center",
        className,
      )}
      {...props}
    >
      <span className="truncate">{children}</span>

      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="ml-auto size-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

/**
 * AUTOCOMPLETE COM MESMO ESTILO DO SELECT
 * Usa MUI Autocomplete, mas visual 100% alinhado ao SelectTrigger.
 */
export type SelectAutocompleteOption = {
  label: string;
  value: string | number;
};

type SelectAutocompleteProps = Omit<
  AutocompleteProps<SelectAutocompleteOption, false, false, false>,
  "renderInput" | "options"
> & {
  options: SelectAutocompleteOption[];
  placeholder?: string;
};

function SelectAutocomplete({
  options,
  placeholder = "",
  ...props
}: SelectAutocompleteProps) {
  return (
    <Autocomplete<SelectAutocompleteOption, false, false, false>
      options={options}
      getOptionLabel={(option) => option.label ?? ""}
      sx={autocompleteBaseStyles}
      popupIcon={<ChevronDownIcon className="size-4 opacity-50" />}
      clearIcon={<XIcon className="size-4 opacity-50" />}
      {...props}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={placeholder}
          // importante: sem label, sem sublinhado, sem borda
          variant="outlined"
        />
      )}
    />
  );
}

function SelectContent({
  className,
  children,
  position = "popper",
  searchable = true,
  searchPlaceholder = "Digite para buscar...",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content> & {
  searchable?: boolean;
  searchPlaceholder?: string;
}) {
  const searchContext = React.useContext(SelectSearchContext);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const resolvedSearchable = Boolean(searchContext && searchable);

  React.useEffect(() => {
    if (!resolvedSearchable || !contentRef.current) return;

    const handleFocusOut = (event: FocusEvent) => {
      if (contentRef.current?.contains(event.target as Node)) {
        requestAnimationFrame(() => {
          if (document.activeElement !== inputRef.current) {
            inputRef.current?.focus();
          }
        });
      }
    };

    const contentElement = contentRef.current;
    contentElement.addEventListener("focusout", handleFocusOut, true);

    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 0);

    return () => {
      contentElement.removeEventListener("focusout", handleFocusOut, true);
      clearTimeout(timer);
    };
  }, [resolvedSearchable]);

  const handleSearchChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      event.stopPropagation();
      event.preventDefault();
      if (searchContext) {
        searchContext.setQuery(event.target.value);
      }
    },
    [searchContext],
  );

  const handleKeyDown = React.useCallback((event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      return;
    }
    event.stopPropagation();
  }, []);

  const handlePointerDown = React.useCallback((event: React.PointerEvent) => {
    event.stopPropagation();
  }, []);

  const handleClick = React.useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
  }, []);

  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={contentRef}
        data-slot="select-content"
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border shadow-md",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className,
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        {resolvedSearchable ? (
          <div
            className="bg-popover sticky top-0 z-10 px-2 pt-2 pb-1"
            onPointerDown={handlePointerDown}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
          >
            <Input
              ref={inputRef}
              placeholder={searchPlaceholder}
              value={searchContext?.query ?? ""}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              className="h-8 text-sm"
              autoFocus={false}
            />
          </div>
        ) : null}
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1",
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel(
  props: React.ComponentProps<typeof SelectPrimitive.Label>,
) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn(
        "text-muted-foreground px-2 py-1.5 text-xs",
        props.className,
      )}
      {...props}
    />
  );
}

function SelectItem({
  className,
  children,
  textValue,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  const searchContext = React.useContext(SelectSearchContext);
  const resolvedTextValue =
    textValue ??
    extractText(children) ??
    (typeof props.value === "string" ? props.value : "");
  const normalizedTextValue = React.useMemo(
    () => normalizeSearchValue(resolvedTextValue),
    [resolvedTextValue],
  );
  const matchesSearch =
    !searchContext?.enabled ||
    searchContext.normalizedQuery.length === 0 ||
    normalizedTextValue.includes(searchContext.normalizedQuery);

  if (!matchesSearch) {
    return null;
  }

  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      textValue={resolvedTextValue}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className,
      )}
      {...props}
    >
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator(
  props: React.ComponentProps<typeof SelectPrimitive.Separator>,
) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn(
        "bg-border pointer-events-none -mx-1 my-1 h-px",
        props.className,
      )}
      {...props}
    />
  );
}

function SelectScrollUpButton(
  props: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>,
) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn("flex cursor-default items-center justify-center py-1")}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  );
}

function SelectScrollDownButton(
  props: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>,
) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn("flex cursor-default items-center justify-center py-1")}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  SelectAutocomplete,
};
