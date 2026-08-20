import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Autocomplete, TextField } from '@mui/material';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Switch } from '../ui/switch';
import { useTheme } from '../theme-provider';
import { UsersSettings } from './UsersSettings';
import { toast } from '../../../lib/toast';
import { useModulePermission } from '../../permissions/ModulePermissionsContext';
import { fetchDbConfig, updateDbConfig } from '../../../lib/db-config';
import { fetchSmtpConfig, pingSmtpConfig, testSmtpConfig, updateSmtpConfig } from '../../../lib/smtp-config';
import { changePassword, fetchProfile, updateProfile } from '../../../lib/users';
import { MODULE_KEYS } from '../../../lib/module-permissions';
import { autocompleteBaseStyles } from '../../../lib/autocomplete-styles';
import {
  getEnvironment,
  getEnvironmentLabel,
  setEnvironment,
  type AppEnvironment,
} from '../../../lib/environment';

interface SettingsViewProps {
  user?: {
    name: string;
    email: string;
    role?: string;
    avatar?: string;
  };
}

export function SettingsView({ user }: SettingsViewProps) {
  const { t, i18n } = useTranslation();
  const { setTheme, theme } = useTheme();
  const { canEdit } = useModulePermission(MODULE_KEYS.settings);
  const isReadOnly = !canEdit;
  const [avatar, setAvatar] = useState<string | null>(user?.avatar ?? null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileName, setProfileName] = useState(user?.name ?? '');
  const [profileEmail, setProfileEmail] = useState(user?.email ?? '');
  const [profileUsername, setProfileUsername] = useState<string | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [dbServer, setDbServer] = useState('');
  const [dbPort, setDbPort] = useState('5432');
  const [dbName, setDbName] = useState('');
  const [dbUser, setDbUser] = useState('');
  const [dbPassword, setDbPassword] = useState('');
  const [isDbLoading, setIsDbLoading] = useState(false);
  const [isDbSaving, setIsDbSaving] = useState(false);
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPassword, setSmtpPassword] = useState('');
  const [smtpFromEmail, setSmtpFromEmail] = useState('');
  const [smtpFromName, setSmtpFromName] = useState('');
  const [smtpUseSsl, setSmtpUseSsl] = useState(true);
  const [smtpTestEmail, setSmtpTestEmail] = useState('');
  const [isSmtpLoading, setIsSmtpLoading] = useState(false);
  const [isSmtpSaving, setIsSmtpSaving] = useState(false);
  const [isSmtpTesting, setIsSmtpTesting] = useState(false);
  const [isSmtpPinging, setIsSmtpPinging] = useState(false);
  const [appEnvironment, setAppEnvironment] = useState<AppEnvironment>(getEnvironment());
  const isMasterAdmin = (user?.name ?? '').toLowerCase() === 'admin' || user?.email === 'admin@local';

  const loadProfile = useCallback(async () => {
    if (isMasterAdmin) {
      setProfileName('Administrador');
      setProfileEmail('admin@local');
      setProfileUsername('admin');
      setAvatar(user?.avatar ?? null);
      return;
    }

    if (!user?.email && !user?.name) {
      return;
    }

    setIsProfileLoading(true);
    try {
      const profile = await fetchProfile({
        email: user?.email,
        username: user?.name,
      });
      setProfileName(profile.fullName || profile.username);
      setProfileEmail(profile.email);
      setProfileUsername(profile.username);
      setAvatar(profile.image ?? null);
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
      toast.error("Falha ao carregar perfil.");
    } finally {
      setIsProfileLoading(false);
    }
  }, [isMasterAdmin, user?.avatar, user?.email, user?.name]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const loadDbConfig = useCallback(async () => {
    setIsDbLoading(true);
    try {
      const config = await fetchDbConfig();
      setDbServer(config.server ?? '');
      setDbPort(String(config.port ?? 5432));
      setDbName(config.database ?? '');
      setDbUser(config.user ?? '');
      setDbPassword(config.password ?? '');
    } catch (error) {
      console.error("Erro ao carregar configuração do banco:", error);
      toast.error("Falha ao carregar configuração do banco.");
    } finally {
      setIsDbLoading(false);
    }
  }, []);

  const loadSmtpConfig = useCallback(async () => {
    setIsSmtpLoading(true);
    try {
      const config = await fetchSmtpConfig();
      setSmtpHost(config.host ?? '');
      setSmtpPort(config.port ? String(config.port) : '');
      setSmtpUser(config.user ?? '');
      setSmtpPassword(config.password ?? '');
      setSmtpFromEmail(config.fromEmail ?? '');
      setSmtpFromName(config.fromName ?? '');
      setSmtpUseSsl(config.useSsl ?? true);
      setSmtpTestEmail(config.fromEmail ?? '');
    } catch (error) {
      console.error("Erro ao carregar configuração de e-mail:", error);
      toast.error("Falha ao carregar configuração de e-mail.");
    } finally {
      setIsSmtpLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'database' && user?.role === 'Admin') {
      loadDbConfig();
    }
  }, [activeTab, loadDbConfig, user?.role]);

  useEffect(() => {
    if (activeTab === 'email' && user?.role === 'Admin') {
      loadSmtpConfig();
    }
  }, [activeTab, loadSmtpConfig, user?.role]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const handleSaveProfile = async () => {
    if (isMasterAdmin) {
      toast.error("O perfil do admin master é fixo.");
      return;
    }

    if (!profileName) {
      toast.error("Nome é obrigatório.");
      return;
    }

    try {
      const updated = await updateProfile({
        username: profileUsername ?? user?.name,
        email: profileEmail,
        newUsername: profileName,
        newEmail: profileEmail,
        image: avatar,
      });
      setProfileName(updated.fullName);
      setProfileEmail(updated.email);
      setProfileUsername(updated.username);
      setAvatar(updated.image ?? avatar ?? null);
      toast.success("Perfil atualizado com sucesso.");
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      toast.error("Falha ao atualizar perfil.");
    }
  };

  const handleChangePassword = async () => {
    if (isMasterAdmin) {
      toast.error("A senha do admin master é fixa.");
      return;
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Preencha todos os campos de senha.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("A confirmação de senha não confere.");
      return;
    }

    try {
      await changePassword({
        username: profileUsername ?? user?.name,
        email: profileEmail,
        currentPassword,
        newPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success("Senha atualizada com sucesso.");
    } catch (error) {
      console.error("Erro ao atualizar senha:", error);
      toast.error("Falha ao atualizar senha.");
    }
  };

  const handleEnvironmentChange = (value: AppEnvironment) => {
    setAppEnvironment(value);
    setEnvironment(value);
    toast.success(`Ambiente definido como ${getEnvironmentLabel(value)}.`);
  };

  const handleSaveDatabase = async () => {
    const port = Number(dbPort);
    if (!dbServer || !dbName || !dbUser || !dbPassword || !Number.isInteger(port) || port <= 0 || port > 65535) {
      toast.error("Preencha todos os campos de conexão.");
      return;
    }

    setIsDbSaving(true);
    try {
      await updateDbConfig({
        server: dbServer,
        port,
        database: dbName,
        user: dbUser,
        password: dbPassword,
      });
      toast.success("Configuração do banco atualizada.");
    } catch (error) {
      console.error("Erro ao salvar configuração do banco:", error);
      toast.error("Falha ao salvar configuração do banco.");
    } finally {
      setIsDbSaving(false);
    }
  };

  const handleSaveEmail = async () => {
    const portValue = Number(smtpPort);
    if (!smtpHost || !smtpPort || Number.isNaN(portValue) || portValue <= 0 || !smtpFromEmail) {
      toast.error("Preencha Servidor, Porta e E-mail remetente.");
      return;
    }

    setIsSmtpSaving(true);
    try {
      await updateSmtpConfig({
        host: smtpHost,
        port: portValue,
        user: smtpUser,
        password: smtpPassword,
        fromEmail: smtpFromEmail,
        fromName: smtpFromName,
        useSsl: smtpUseSsl,
      });
      toast.success("Configuração de e-mail atualizada.");
    } catch (error) {
      console.error("Erro ao salvar configuração de e-mail:", error);
      toast.error("Falha ao salvar configuração de e-mail.");
    } finally {
      setIsSmtpSaving(false);
    }
  };

  const handleTestEmail = async () => {
    const targetEmail = smtpTestEmail.trim();
    if (!targetEmail) {
      toast.error("Informe o e-mail de teste.");
      return;
    }

    setIsSmtpTesting(true);
    try {
      await testSmtpConfig(targetEmail);
      toast.success("E-mail de teste enviado.");
    } catch (error) {
      console.error("Erro ao enviar e-mail de teste:", error);
      const message = error instanceof Error ? error.message : "Falha ao enviar e-mail de teste.";
      toast.error(message);
    } finally {
      setIsSmtpTesting(false);
    }
  };

  const handlePingEmail = async () => {
    setIsSmtpPinging(true);
    try {
      await pingSmtpConfig();
      toast.success("Conexao SMTP realizada.");
    } catch (error) {
      console.error("Erro ao testar conexao SMTP:", error);
      const message = error instanceof Error ? error.message : "Falha ao testar conexao SMTP.";
      toast.error(message);
    } finally {
      setIsSmtpPinging(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="space-y-0.5">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{t('settings.title')}</h2>
        <p className="text-slate-500 dark:text-slate-400">
          {t('settings.description')}
        </p>
      </div>
      <Separator className="my-6" />
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <div className={`flex-1 ${activeTab === 'users' ? 'lg:max-w-none' : 'lg:max-w-2xl'}`}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList>
              <TabsTrigger value="profile">{t('settings.tabs.profile')}</TabsTrigger>
              <TabsTrigger value="appearance">{t('settings.tabs.appearance')}</TabsTrigger>
              <TabsTrigger value="language">{t('settings.tabs.language')}</TabsTrigger>
              {user?.role === 'Admin' && (
                <>
                  <TabsTrigger value="users">Usuários</TabsTrigger>
                  <TabsTrigger value="environment">Ambiente</TabsTrigger>
                  <TabsTrigger value="database">Banco de Dados</TabsTrigger>
                  <TabsTrigger value="email">{t('settings.tabs.email')}</TabsTrigger>
                </>
              )}
            </TabsList>
            
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('settings.profile.title')}</CardTitle>
                  <CardDescription>
                    {t('settings.profile.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                        <AvatarImage src={avatar || "/placeholder-avatar.jpg"} />
                        <AvatarFallback className="text-lg bg-red-100 text-red-700">JD</AvatarFallback>
                    </Avatar>
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()}>{t('settings.profile.changePhoto')}</Button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="name">{t('settings.profile.name')}</Label>
                    <Input
                      id="name"
                      value={profileName}
                      onChange={(event) => setProfileName(event.target.value)}
                      disabled={isProfileLoading || isReadOnly}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">{t('settings.profile.email')}</Label>
                    <Input
                      id="email"
                      value={profileEmail}
                      disabled
                    />
                  </div>
                </CardContent>
                <CardFooter>
                    <Button
                      className="bg-red-600 hover:bg-red-700"
                      onClick={handleSaveProfile}
                      disabled={isProfileLoading || isReadOnly}
                    >
                      {t('settings.profile.save')}
                    </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('settings.security.title')}</CardTitle>
                  <CardDescription>
                    {t('settings.security.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="current-password">{t('settings.security.currentPassword')}</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(event) => setCurrentPassword(event.target.value)}
                      disabled={isReadOnly}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="new-password">{t('settings.security.newPassword')}</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      disabled={isReadOnly}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirm-password">{t('settings.security.confirmPassword')}</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      disabled={isReadOnly}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                    <Button variant="outline" onClick={handleChangePassword} disabled={isReadOnly}>
                      {t('settings.security.changePassword')}
                    </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="appearance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('settings.appearance.title')}</CardTitle>
                  <CardDescription>
                    {t('settings.appearance.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-2">
                    <div className="space-y-2">
                      <div 
                        onClick={() => setTheme("light")} 
                        className={`cursor-pointer overflow-hidden rounded-md border-2 ${theme === 'light' ? 'border-red-600' : 'border-slate-200 hover:border-slate-300'}`}
                      >
                        <div className="items-center rounded-md bg-[#ecedef] p-1">
                          <div className="space-y-2 rounded-sm bg-white p-2 shadow-sm">
                            <div className="h-2 w-[80px] rounded-lg bg-[#ecedef]" />
                            <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                          </div>
                          <div className="flex items-center space-x-2 rounded-sm bg-white p-2 shadow-sm mt-2">
                            <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                            <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                          </div>
                          <div className="flex items-center space-x-2 rounded-sm bg-white p-2 shadow-sm mt-2">
                            <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                            <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                          </div>
                        </div>
                      </div>
                      <span className="block w-full p-2 text-center font-normal text-sm">{t('settings.appearance.light')}</span>
                    </div>

                    <div className="space-y-2">
                      <div 
                        onClick={() => setTheme("dark")} 
                        className={`cursor-pointer overflow-hidden rounded-md border-2 ${theme === 'dark' ? 'border-red-600' : 'border-slate-200 hover:border-slate-300'}`}
                      >
                        <div className="items-center rounded-md bg-slate-950 p-1">
                          <div className="space-y-2 rounded-sm bg-slate-800 p-2 shadow-sm">
                            <div className="h-2 w-[80px] rounded-lg bg-slate-400" />
                            <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                          </div>
                          <div className="flex items-center space-x-2 rounded-sm bg-slate-800 p-2 shadow-sm mt-2">
                            <div className="h-4 w-4 rounded-full bg-slate-400" />
                            <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                          </div>
                          <div className="flex items-center space-x-2 rounded-sm bg-slate-800 p-2 shadow-sm mt-2">
                            <div className="h-4 w-4 rounded-full bg-slate-400" />
                            <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                          </div>
                        </div>
                      </div>
                      <span className="block w-full p-2 text-center font-normal text-sm">{t('settings.appearance.dark')}</span>
                    </div>

                    <div className="space-y-2">
                      <div 
                        onClick={() => setTheme("system")} 
                        className={`cursor-pointer overflow-hidden rounded-md border-2 ${theme === 'system' ? 'border-red-600' : 'border-slate-200 hover:border-slate-300'}`}
                      >
                        <div className="items-center rounded-md bg-slate-100 p-1">
                          <div className="space-y-2 rounded-sm bg-slate-200 p-2 shadow-sm">
                            <div className="h-2 w-[80px] rounded-lg bg-slate-400" />
                            <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                          </div>
                          <div className="flex items-center space-x-2 rounded-sm bg-slate-800 p-2 shadow-sm mt-2">
                            <div className="h-4 w-4 rounded-full bg-slate-400" />
                            <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                          </div>
                          <div className="flex items-center space-x-2 rounded-sm bg-slate-200 p-2 shadow-sm mt-2">
                            <div className="h-4 w-4 rounded-full bg-slate-400" />
                            <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                          </div>
                        </div>
                      </div>
                      <span className="block w-full p-2 text-center font-normal text-sm">{t('settings.appearance.system')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="language" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('settings.language.title')}</CardTitle>
                  <CardDescription>
                    {t('settings.language.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 max-w-sm">
                    <Label htmlFor="language">{t('settings.language.title')}</Label>
                    <Autocomplete
                      disablePortal
                      options={[
                        { label: t('settings.language.portuguese'), value: 'pt-BR' },
                        { label: t('settings.language.english'), value: 'en' },
                        { label: t('settings.language.spanish'), value: 'es' },
                      ]}
                      value={
                        {
                          label:
                            i18n.language === 'pt-BR'
                              ? t('settings.language.portuguese')
                              : i18n.language === 'en'
                                ? t('settings.language.english')
                                : t('settings.language.spanish'),
                          value: i18n.language,
                        } || null
                      }
                      onChange={(event, newValue) => {
                        if (newValue?.value) changeLanguage(newValue.value);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label=""
                          placeholder={t('settings.language.select')}
                          variant="outlined"
                          size="small"
                          InputLabelProps={{ shrink: false }}
                        />
                      )}
                      sx={autocompleteBaseStyles}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {user?.role === 'Admin' && (
              <TabsContent value="environment" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Ambiente do Sistema</CardTitle>
                    <CardDescription>
                      Define se esta instância está em QA ou Produção (PD). Essa etiqueta aparece no login e no menu lateral.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="environment">Ambiente</Label>
                      <select
                        id="environment"
                        value={appEnvironment}
                        onChange={(event) => handleEnvironmentChange(event.target.value as AppEnvironment)}
                        className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        disabled={isReadOnly}
                      >
                        <option value="PD">Produção (PD)</option>
                        <option value="QA">Qualidade (QA)</option>
                      </select>
                      <p className="text-xs text-slate-500">
                        Ambiente atual: <span className="font-semibold">{getEnvironmentLabel(appEnvironment)}</span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {user?.role === 'Admin' && (
              <>
                <TabsContent value="users" className="space-y-6">
                  <UsersSettings canEdit={canEdit} />
                </TabsContent>

                <TabsContent value="database" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Configuração de Banco de Dados</CardTitle>
                      <CardDescription>
                        Configure os dados de conexão com o banco de dados do sistema.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="db-server">Servidor</Label>
                        <Input
                          id="db-server"
                          placeholder="postgres.exemplo.com"
                          value={dbServer}
                          onChange={(event) => setDbServer(event.target.value)}
                          disabled={isDbLoading || isDbSaving || isReadOnly}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="db-port">Porta</Label>
                        <Input
                          id="db-port"
                          type="number"
                          min="1"
                          max="65535"
                          placeholder="5432"
                          value={dbPort}
                          onChange={(event) => setDbPort(event.target.value)}
                          disabled={isDbLoading || isDbSaving || isReadOnly}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="db-name">Banco de Dados</Label>
                        <Input
                          id="db-name"
                          placeholder="dbqms"
                          value={dbName}
                          onChange={(event) => setDbName(event.target.value)}
                          disabled={isDbLoading || isDbSaving || isReadOnly}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="db-user">Usuário</Label>
                        <Input
                          id="db-user"
                          placeholder="admin"
                          value={dbUser}
                          onChange={(event) => setDbUser(event.target.value)}
                          disabled={isDbLoading || isDbSaving || isReadOnly}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="db-password">Senha</Label>
                        <Input
                          id="db-password"
                          type="password"
                          value={dbPassword}
                          onChange={(event) => setDbPassword(event.target.value)}
                          disabled={isDbLoading || isDbSaving || isReadOnly}
                        />
                      </div>
                    </CardContent>
                    <CardFooter>
                        <Button
                          className="bg-red-600 hover:bg-red-700"
                          onClick={handleSaveDatabase}
                          disabled={isDbLoading || isDbSaving || isReadOnly}
                        >
                          Salvar Configuração
                        </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>

                <TabsContent value="email" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('settings.email.title')}</CardTitle>
                      <CardDescription>
                        {t('settings.email.description')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="smtp-host">{t('settings.email.host')}</Label>
                        <Input
                          id="smtp-host"
                          placeholder="smtp.seudominio.com"
                          value={smtpHost}
                          onChange={(event) => setSmtpHost(event.target.value)}
                          disabled={isSmtpLoading || isSmtpSaving || isReadOnly}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="smtp-port">{t('settings.email.port')}</Label>
                        <Input
                          id="smtp-port"
                          type="number"
                          placeholder="587"
                          value={smtpPort}
                          onChange={(event) => setSmtpPort(event.target.value)}
                          disabled={isSmtpLoading || isSmtpSaving || isReadOnly}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="smtp-user">{t('settings.email.user')}</Label>
                        <Input
                          id="smtp-user"
                          placeholder="usuario@seudominio.com"
                          value={smtpUser}
                          onChange={(event) => setSmtpUser(event.target.value)}
                          disabled={isSmtpLoading || isSmtpSaving || isReadOnly}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="smtp-password">{t('settings.email.password')}</Label>
                        <Input
                          id="smtp-password"
                          type="password"
                          value={smtpPassword}
                          onChange={(event) => setSmtpPassword(event.target.value)}
                          disabled={isSmtpLoading || isSmtpSaving || isReadOnly}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="smtp-from-email">{t('settings.email.fromEmail')}</Label>
                        <Input
                          id="smtp-from-email"
                          placeholder="nao-responda@seudominio.com"
                          value={smtpFromEmail}
                          onChange={(event) => setSmtpFromEmail(event.target.value)}
                          disabled={isSmtpLoading || isSmtpSaving || isReadOnly}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="smtp-from-name">{t('settings.email.fromName')}</Label>
                        <Input
                          id="smtp-from-name"
                          placeholder="Digicon QMS"
                          value={smtpFromName}
                          onChange={(event) => setSmtpFromName(event.target.value)}
                          disabled={isSmtpLoading || isSmtpSaving || isReadOnly}
                        />
                      </div>
                      <div className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-200">
                        <div className="space-y-1">
                          <span className="font-medium">{t('settings.email.useSsl')}</span>
                          <p className="text-xs text-slate-500 dark:text-slate-400">TLS/SSL para conexao segura</p>
                        </div>
                        <Switch
                          checked={smtpUseSsl}
                          onCheckedChange={setSmtpUseSsl}
                          disabled={isSmtpLoading || isSmtpSaving || isReadOnly}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="smtp-test-email">{t('settings.email.testRecipient')}</Label>
                        <Input
                          id="smtp-test-email"
                          placeholder="teste@seudominio.com"
                          value={smtpTestEmail}
                          onChange={(event) => setSmtpTestEmail(event.target.value)}
                          disabled={isSmtpLoading || isSmtpSaving || isSmtpTesting || isReadOnly}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleTestEmail}
                        disabled={isSmtpLoading || isSmtpSaving || isSmtpTesting || isReadOnly}
                      >
                        {t('settings.email.testButton')}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handlePingEmail}
                        disabled={isSmtpLoading || isSmtpSaving || isSmtpPinging || isReadOnly}
                      >
                        {t('settings.email.testConnection')}
                      </Button>
                    </CardContent>
                    <CardFooter>
                        <Button
                          className="bg-red-600 hover:bg-red-700"
                          onClick={handleSaveEmail}
                          disabled={isSmtpLoading || isSmtpSaving || isReadOnly}
                        >
                          {t('settings.email.save')}
                        </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
