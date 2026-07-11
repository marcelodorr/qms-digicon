import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ClipboardCheck, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { toast } from '../../../lib/toast';
import { requestPasswordReset } from '../../../lib/users';

const forgotSchema = z.object({
  identifier: z.string().min(2, { message: "Informe o usuário ou e-mail" }).refine((value) => {
    if (!value.includes("@")) return true;
    return z.string().email().safeParse(value).success;
  }, { message: "Email inválido" }),
});

type ForgotValues = z.infer<typeof forgotSchema>;

export function ForgotPasswordView() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotValues>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotValues) => {
    setIsLoading(true);
    try {
      await requestPasswordReset(data.identifier);
      setSent(true);
      toast.success("Se existir uma conta, enviamos o link de redefinicao.");
    } catch (error) {
      console.error("Erro ao solicitar redefinicao:", error);
      toast.error("Falha ao solicitar redefinicao.");
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
          <CardTitle className="text-2xl text-center text-white">Esqueceu sua senha?</CardTitle>
          <CardDescription className="text-center text-slate-400">
            Informe seu usuario ou e-mail para receber o link de redefinicao.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="rounded-md border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm text-slate-300">
              Se existir uma conta com este usuario ou e-mail, enviamos um link para redefinir a senha.
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="identifier">Usuario ou E-mail</Label>
                <Input
                  id="identifier"
                  placeholder="usuario ou nome@empresa.com"
                  type="text"
                  className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-red-600"
                  {...register("identifier")}
                />
                {errors.identifier && <p className="text-sm text-red-500">{errors.identifier.message}</p>}
              </div>
              <Button className="w-full bg-red-600 hover:bg-red-700 text-white" type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enviar link
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
