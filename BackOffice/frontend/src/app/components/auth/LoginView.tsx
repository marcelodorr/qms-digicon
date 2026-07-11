import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ClipboardCheck, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { toast } from '../../../lib/toast';
import { authenticate, type AuthSession } from '../../../lib/users';
import { getEnvironment, getEnvironmentLabel, subscribeEnvironment } from '../../../lib/environment';

const loginSchema = z.object({
  user: z.string().min(2, { message: "Informe o usuário ou e-mail" }).refine((value) => {
    if (!value.includes("@")) return true;
    return z.string().email().safeParse(value).success;
  }, { message: "Email inválido" }),
  password: z.string().min(6, { message: "A senha deve ter no mínimo 6 caracteres" }),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginView({ onLogin }: { onLogin: (payload: AuthSession) => void }) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [environment, setEnvironment] = React.useState(getEnvironment());

  useEffect(() => {
    const unsubscribe = subscribeEnvironment(setEnvironment);
    return unsubscribe;
  }, []);
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginValues) => {
    setIsLoading(true);
    try {
      const authSession = await authenticate(data.user, data.password);
      toast.success("Login realizado com sucesso!");
      onLogin(authSession);
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      toast.error("Usuário ou senha inválidos.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-slate-900 px-4">
        <div className="mb-8 flex items-center gap-2 text-white">
            <h1 className="text-3xl font-bold tracking-tight">
                digicon<span className="text-red-600">QMS</span>
            </h1>
            <span className="rounded-full border border-slate-700 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-slate-300">
              {getEnvironmentLabel(environment)}
            </span>
        </div>

      <Card className="w-full max-w-sm border-slate-800 bg-slate-950 text-slate-100 shadow-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center text-white">Bem-vindo de volta</CardTitle>
          <CardDescription className="text-center text-slate-400">
            Entre com suas credenciais para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user">Usuário ou Email</Label>
              <Input 
                id="user" 
                placeholder="usuario ou nome@empresa.com" 
                type="text" 
                className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-red-600"
                {...register("user")}
              />
              {errors.user && <p className="text-sm text-red-500">{errors.user.message}</p>}
            </div>
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="password">Senha</Label>
                    <Link to="/forgot-password" className="text-xs text-red-500 hover:text-red-400">Esqueceu a senha?</Link>
                </div>
              <Input 
                id="password" 
                type="password" 
                className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-red-600"
                {...register("password")}
              />
               {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox id="remember" className="border-slate-700 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600" />
                <label
                    htmlFor="remember"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-400"
                >
                    Lembrar-me por 30 dias
                </label>
            </div>
            <Button className="w-full bg-red-600 hover:bg-red-700 text-white" type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Entrar
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-center text-sm text-slate-400">
             <p>Não tem acesso? <a href="#" className="text-red-500 hover:text-red-400">Solicite ao administrador</a></p>
        </CardFooter>
      </Card>

      <div className="mt-8 text-center text-sm text-slate-500">
        <a 
          href="https://www.trackty.com.br" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="hover:text-slate-400 transition-colors"
        >
          &copy; TrackTy Tecnologia Ltda 2025
        </a>
      </div>
    </div>
  );
}
