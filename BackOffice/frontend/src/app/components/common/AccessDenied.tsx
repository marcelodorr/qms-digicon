import React from "react";
import { ShieldAlert } from "lucide-react";
import { Button } from "../ui/button";

export function AccessDenied({ onBack }: { onBack?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center px-6">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
        <ShieldAlert className="h-6 w-6" />
      </div>
      <h2 className="mt-4 text-2xl font-bold text-slate-800">Acesso negado</h2>
      <p className="mt-2 max-w-md text-slate-500">
        Voce nao tem permissao para visualizar este modulo.
      </p>
      {onBack && (
        <Button onClick={onBack} className="mt-6 bg-red-600 hover:bg-red-700 text-white">
          Voltar
        </Button>
      )}
    </div>
  );
}
