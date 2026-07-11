import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ClipboardCheck, Loader2 } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { toast } from '../../../lib/toast';
import { resetPasswordWithToken } from '../../../lib/users';

const resetSchema = z.object({
  password: z.string().min(6, { message: "A senha deve ter no minimo 6 caracteres" }),
  confirmPassword: z.string().min(6, { message: "A confirmacao deve ter no minimo 6 caracteres" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "A confirmacao de senha nao confere",
  path: ["confirmPassword"],
});

type ResetValues = z.infer<typeof resetSchema>;

export function ResetPasswordView() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";

  const { register, handleSubmit, formState: { errors } } = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetValues) => {
    if (!token) {
      toast.error("Token invalido.");
      return;
    }
    setIsLoading(true);
    try {
      await resetPasswordWithToken(token, data.password);
      setSuccess(true);
      toast.success("Senha redefinida com sucesso.");
    } catch (error) {
      console.error("Erro ao redefinir senha:", error);
      toast.error("Falha ao redefinir senha.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-slate-900 px-4">
      <div className="mb-8 flex items-center gap-2 text-white">
        <ClipboardCheck className="h-8 w-8 text-red-600" />
        <h1 className="text-3xl font-bold tracking-tight">
          digicon<span className="text-red-600">QMS</span>
        </h1>
      </div>

      <Card className="w-full max-w-sm border-slate-800 bg-slate-950 text-slate-100 shadow-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center text-white">Nova senha</CardTitle>
          <CardDescription className="text-center text-slate-400">
            Defina uma nova senha para acessar o sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!token ? (
            <div className="rounded-md border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm text-slate-300">
              Token invalido ou ausente. Solicite um novo link.
            </div>
          ) : success ? (
            <div className="rounded-md border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm text-slate-300">
              Sua senha foi redefinida. Voce ja pode acessar o sistema.
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nova senha</Label>
                <Input
                  id="password"
                  type="password"
                  className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-red-600"
                  {...register("password")}
                />
                {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-red-600"
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
              </div>
              <Button className="w-full bg-red-600 hover:bg-red-700 text-white" type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Redefinir senha
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-center text-sm text-slate-400">
          <Link to="/" className="text-red-500 hover:text-red-400">Voltar para o login</Link>
        </CardFooter>
      </Card>
    </div>
  );
}
