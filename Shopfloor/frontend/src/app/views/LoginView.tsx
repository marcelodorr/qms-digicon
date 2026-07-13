import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { User } from '@/app/data/mockData';
import { authApi } from '@/features/auth/api';
import { AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginViewProps {
  onLogin: (user: User) => void;
}

export function LoginView({ onLogin }: LoginViewProps) {
  const [matricula, setMatricula] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const auth = await authApi.login(matricula, password);
      localStorage.setItem('shopfloor_token', auth.token);
      setError('');
      onLogin({ id: auth.userId, matricula: auth.username, name: auth.name, password: '' });
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Usuário ou senha inválidos.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-slate-900 px-4 overflow-x-hidden">
      <div className="mb-8 flex items-center gap-2 text-white">
        <h1 className="text-4xl font-bold tracking-tight">
          digicon<span className="text-red-600">QMS</span>
        </h1>
        <span className="rounded-full border border-slate-700 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-slate-300">
          Shopfloor
        </span>
      </div>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full"
        style={{ maxWidth: '36rem' }}
      >
        <Card className="w-full border-slate-800 bg-slate-950 text-slate-100 shadow-2xl">
          <CardHeader className="space-y-2 px-6 pt-8 pb-6 sm:px-10">
            <CardTitle className="text-3xl text-center text-white">Apontamento de Qualidade</CardTitle>
            <CardDescription className="text-center text-lg text-slate-400">Identifique-se para iniciar</CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-8 sm:px-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="matricula" className="text-lg text-slate-100">Usuário</Label>
                <Input 
                  id="matricula" 
                  type="text"
                  placeholder="Digite seu usuário" 
                  value={matricula}
                  onChange={(e) => setMatricula(e.target.value)}
                  className="h-16 border-slate-800 bg-slate-900 px-5 text-xl text-white placeholder:text-slate-500 focus-visible:ring-red-600"
                  autoFocus
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="password" className="text-lg text-slate-100">Senha</Label>
                <Input 
                  id="password" 
                  type="password"
                  placeholder="Digite sua senha" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-16 border-slate-800 bg-slate-900 px-5 text-xl text-white placeholder:text-slate-500 focus-visible:ring-red-600"
                />
              </div>
              
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-md flex items-center gap-2 text-lg font-medium">
                  <AlertCircle className="w-6 h-6" />
                  {error}
                </div>
              )}

              <Button type="submit" disabled={isLoading} className="h-16 w-full bg-red-600 text-xl font-bold text-white hover:bg-red-700" size="lg">
                {isLoading && <Loader2 className="mr-2 h-6 w-6 animate-spin" />}
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </CardContent>
        </Card>
        <div className="mt-8 text-center text-sm text-slate-500">
          Shopfloor · Digicon QMS
        </div>
      </motion.div>
    </div>
  );
}
