/**
 * Estilos padronizados para MUI Autocomplete
 * Compatível com o design do shadcn/ui e tema do projeto
 * Agora alinhado ao estilo do Select "Revisão / Automático"
 */
export const autocompleteBaseStyles = {
  width: '100%',
  '& .MuiOutlinedInput-root': {
    minHeight: '2.5rem', // um pouco mais alto para parecer a pill do select
    padding: 0,
    fontSize: '0.875rem', // text-sm
    backgroundColor: '#F3F7FC', // mesmo fundo da barra de Revisão
    borderRadius: '0.75rem', // ~ rounded-xl
    color: 'rgb(71 85 105)', // text-slate-600
    boxShadow: 'none',
    border: 'none',
    transition: 'box-shadow 150ms ease, background-color 150ms ease',

    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: 'transparent',
      borderWidth: 0,
    },

    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: 'transparent',
    },

    '&.Mui-focused': {
      boxShadow: '0 0 0 2px rgba(239, 68, 68, 0.35)', // ring-red-300 approx
      backgroundColor: '#F3F7FC',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: 'transparent',
        borderWidth: 0,
      },
    },

    '&.Mui-error': {
      boxShadow: '0 0 0 2px hsl(var(--destructive) / 0.4)',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: 'transparent',
        borderWidth: 0,
      },
    },

    '&.Mui-disabled': {
      opacity: 0.6,
      cursor: 'not-allowed',
      pointerEvents: 'none',
      backgroundColor: '#F3F7FC',
    },
  },

  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: 'transparent',
    borderRadius: '0.75rem',
    top: 0,
  },

  '& .MuiInputBase-input': {
    padding: '0.375rem 1rem !important', // aproxima do padding do SelectTrigger (px-4)
    fontSize: 'inherit !important',
    height: 'auto !important',
    lineHeight: 1.4,
    '&::placeholder': {
      color: 'hsl(var(--muted-foreground))',
      opacity: 1,
    },
    '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
      WebkitAppearance: 'none',
      margin: 0,
    },
  },

  '& .MuiAutocomplete-endAdornment': {
    right: '0.75rem',
    top: '50% !important',
    transform: 'translateY(-50%)',
  },

  '& .MuiAutocomplete-popupIndicator': {
    color: 'hsl(var(--muted-foreground))',
    padding: 0,
    '&:hover': {
      backgroundColor: 'transparent',
    },
  },

  '& .MuiAutocomplete-clearIndicator': {
    color: 'hsl(var(--muted-foreground))',
    padding: 0,
    '&:hover': {
      backgroundColor: 'transparent',
    },
  },

  // Esconde totalmente labels/flutuantes
  '& .MuiInputLabel-root': {
    display: 'none !important',
  },
  '& .MuiOutlinedInput-notchedOutline legend': {
    width: '0 !important',
    padding: '0 !important',
    display: 'none !important',
  },
  '& .MuiFormLabel-root': {
    display: 'none !important',
  },

  // Lista de opções (dropdown) – mantém padrão anterior
  '& .MuiAutocomplete-listbox': {
    fontSize: '0.875rem',
    padding: '0.25rem',
    '&::-webkit-scrollbar': {
      width: '8px',
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: 'hsl(var(--background))',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'hsl(var(--border))',
      borderRadius: '4px',
    },
  },

  '& .MuiAutocomplete-option': {
    padding: '0.5rem 0.75rem !important',
    fontSize: '0.875rem !important',
    borderRadius: '0.25rem',
    margin: '0.125rem 0',
    cursor: 'pointer',
    '&[aria-selected="true"]': {
      backgroundColor: 'hsl(var(--accent)) !important',
      color: 'hsl(var(--accent-foreground)) !important',
      fontWeight: 500,
    },
    '&.Mui-focused': {
      backgroundColor: 'hsl(var(--accent)) !important',
      color: 'hsl(var(--accent-foreground)) !important',
    },
    '&[aria-selected="true"].Mui-focused': {
      backgroundColor: 'hsl(var(--accent)) !important',
      color: 'hsl(var(--accent-foreground)) !important',
    },
  },

  '& .MuiAutocomplete-paper': {
    borderRadius: '0.375rem',
    boxShadow:
      '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    border: '1px solid hsl(var(--border))',
  },

  '& .MuiAutocomplete-noOptions': {
    padding: '0.75rem',
    fontSize: '0.875rem',
    color: 'hsl(var(--muted-foreground))',
  },
} as const;
