import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { MOCK_USERS, User } from '@/app/data/mockData';
import { AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginViewProps {
  onLogin: (user: User) => void;
}

export function LoginView({ onLogin }: LoginViewProps) {
  const [matricula, setMatricula] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = MOCK_USERS.find(u => u.matricula === matricula && u.password === password);
    if (user) {
      setError('');
      onLogin(user);
    } else {
      setError('Matrícula ou senha inválidos.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4 overflow-x-hidden">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full"
      >
        <Card className="w-full shadow-lg border-2 border-slate-200">
          <CardHeader className="text-center pb-8 pt-8">
            <CardTitle className="text-3xl text-slate-800">Apontamento de Qualidade</CardTitle>
            <CardDescription className="text-xl mt-2">Identifique-se para iniciar</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="matricula" className="text-lg">Matrícula</Label>
                <Input 
                  id="matricula" 
                  type="number"
                  placeholder="Digite sua matrícula" 
                  value={matricula}
                  onChange={(e) => setMatricula(e.target.value)}
                  className="text-2xl h-16"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-lg">Senha</Label>
                <Input 
                  id="password" 
                  type="password"
                  placeholder="Digite sua senha" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-2xl h-16"
                />
              </div>
              
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-md flex items-center gap-2 text-lg font-medium">
                  <AlertCircle className="w-6 h-6" />
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full h-16 text-xl mt-4" size="lg">
                ENTRAR
              </Button>
            </form>
          </CardContent>
        </Card>
        <div className="mt-8 text-center text-muted-foreground text-sm">
           <p>Dica: Use matrícula 12345 e senha 123</p>
        </div>
      </motion.div>
    </div>
  );
}
