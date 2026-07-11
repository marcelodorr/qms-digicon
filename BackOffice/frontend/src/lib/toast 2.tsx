import { toast as sonnerToast } from 'sonner';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import React from 'react';

const createToast = (severity: 'success' | 'error' | 'warning' | 'info', title: string) => (message: string | React.ReactNode) => {
  return sonnerToast.custom((t) => (
    <Alert 
      severity={severity} 
      variant="filled" 
      onClose={() => sonnerToast.dismiss(t)}
      sx={{ width: '100%', boxShadow: 3 }}
    >
      <AlertTitle>{title}</AlertTitle>
      {message}
    </Alert>
  ));
};

export const toast = {
  success: createToast('success', 'Sucesso'),
  error: createToast('error', 'Erro'),
  warning: createToast('warning', 'Atenção'),
  info: createToast('info', 'Informação'),
  dismiss: sonnerToast.dismiss,
};
