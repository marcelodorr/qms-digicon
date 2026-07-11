import React, { useCallback, useEffect, useState } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { QmsDataGrid } from '../ui/data-grid';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle
} from '../ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '../ui/sheet';
import { Plus, Pencil, Trash2, User, ShieldAlert } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Switch } from '../ui/switch';
import type { GridColDef } from '@mui/x-data-grid';
import { toast } from '../../../lib/toast';
import { autocompleteBaseStyles } from '../../../lib/autocomplete-styles';
import {
  createUser,
  deleteUser,
  fetchUsers,
  updateUser,
  type UserAccount,
} from '../../../lib/users';
import {
  MODULE_DEFINITIONS,
  buildPermissionList,
  buildPermissionMap,
  fetchUserModulePermissions,
  updateUserModulePermissions,
  type ModulePermissionMap,
} from '../../../lib/module-permissions';

type UsersSettingsProps = {
  canEdit?: boolean;
};

export function UsersSettings({ canEdit = true }: UsersSettingsProps) {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState<Partial<UserAccount & { password?: string }>>({
    fullName: '',
    username: '',
    email: '',
    type: 'User',
  });
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const [isPermissionsLoading, setIsPermissionsLoading] = useState(false);
  const [isPermissionsSaving, setIsPermissionsSaving] = useState(false);
  const [permissionsUserId, setPermissionsUserId] = useState<string | null>(null);
  const [modulePermissions, setModulePermissions] = useState<ModulePermissionMap>(() =>
    buildPermissionMap()
  );
  const canManage = canEdit;

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await fetchUsers();
      setUsers(list);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      toast.error("Falha ao carregar usuários.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const groupedModules = React.useMemo(() => {
    const groups: Record<string, Array<(typeof MODULE_DEFINITIONS)[number]>> = {};
    MODULE_DEFINITIONS.forEach((definition) => {
      if (!groups[definition.group]) {
        groups[definition.group] = [];
      }
      groups[definition.group].push(definition);
    });
    return Object.entries(groups);
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    if (!isOpen) {
      setIsPermissionsOpen(false);
      setPermissionsUserId(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isPermissionsOpen || !permissionsUserId) {
      return;
    }

    let isActive = true;
    setIsPermissionsLoading(true);

    fetchUserModulePermissions(permissionsUserId)
      .then((permissions) => {
        if (!isActive) return;
        setModulePermissions(buildPermissionMap(permissions));
      })
      .catch((error) => {
        if (!isActive) return;
        console.error("Erro ao carregar permissoes:", error);
        toast.error("Falha ao carregar permissoes.");
        setModulePermissions(buildPermissionMap());
      })
      .finally(() => {
        if (!isActive) return;
        setIsPermissionsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [isPermissionsOpen, permissionsUserId]);

  const handleOpen = (user?: UserAccount) => {
    if (!canManage) {
      toast.error("Sem permissão para editar usuários.");
      return;
    }
    setIsPermissionsOpen(false);
    setPermissionsUserId(null);
    setModulePermissions(buildPermissionMap());
    if (user) {
      setCurrentUser(user);
      setIsEditing(true);
    } else {
      setCurrentUser({
        fullName: '',
        username: '',
        email: '',
        type: 'User',
        password: '',
      });
      setIsEditing(false);
    }
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (!canManage) {
      toast.error("Sem permissão para salvar usuários.");
      return;
    }
    if (!currentUser.username || !currentUser.email) {
      toast.error("Usuário e e-mail são obrigatórios.");
      return;
    }

    try {
      if (isEditing && currentUser.id) {
        const updated = await updateUser(currentUser.id, {
          fullName: currentUser.fullName || currentUser.username,
          username: currentUser.username,
          email: currentUser.email,
          type: currentUser.type || 'User',
        });
        setUsers(prev => prev.map(u => u.id === currentUser.id ? updated : u));
        toast.success("Usuário atualizado com sucesso.");
      } else {
        if (!currentUser.password) {
          toast.error("Senha é obrigatória para criar usuário.");
          return;
        }
        const created = await createUser({
          fullName: currentUser.fullName || currentUser.username,
          username: currentUser.username,
          email: currentUser.email,
          password: currentUser.password,
          type: currentUser.type || 'User',
        });
        setUsers(prev => [...prev, created]);
        toast.success("Usuário criado com sucesso.");
      }
      setIsOpen(false);
    } catch (error) {
      console.error("Erro ao salvar usuário:", error);
      toast.error("Falha ao salvar usuário.");
    }
  };

  const handleOpenPermissions = () => {
    if (!canManage) {
      toast.error("Sem permissão para editar permissões.");
      return;
    }
    if (!currentUser.id) {
      toast.error("Selecione um usuário para configurar.");
      return;
    }
    setPermissionsUserId(currentUser.id);
    setIsPermissionsOpen(true);
  };

  const handlePermissionsOpenChange = (open: boolean) => {
    setIsPermissionsOpen(open);
    if (!open) {
      setPermissionsUserId(null);
    }
  };

  const updateModulePermission = (
    moduleKey: string,
    updates: Partial<{ canView: boolean; canEdit: boolean }>
  ) => {
    setModulePermissions((prev) => {
      const current = prev[moduleKey] ?? { canView: true, canEdit: true };
      const next = { ...current, ...updates };
      if (!next.canView) {
        next.canEdit = false;
      }
      if (next.canEdit) {
        next.canView = true;
      }
      return { ...prev, [moduleKey]: next };
    });
  };

  const handleSavePermissions = async () => {
    if (!canManage) {
      toast.error("Sem permissão para salvar permissões.");
      return;
    }
    if (!permissionsUserId) {
      toast.error("Selecione um usuário para configurar.");
      return;
    }

    setIsPermissionsSaving(true);
    try {
      await updateUserModulePermissions(
        permissionsUserId,
        buildPermissionList(modulePermissions)
      );
      toast.success("Permissões atualizadas com sucesso.");
      handlePermissionsOpenChange(false);
    } catch (error) {
      console.error("Erro ao salvar permissões:", error);
      toast.error("Falha ao salvar permissões.");
    } finally {
      setIsPermissionsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!canManage) {
      toast.error("Sem permissão para remover usuários.");
      return;
    }
    try {
      await deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      toast.success("Usuário removido com sucesso.");
    } catch (error) {
      console.error("Erro ao remover usuário:", error);
      toast.error("Falha ao remover usuário.");
    }
  };

  const handleDeleteSelected = async (ids: string[]) => {
    if (!canManage) {
      toast.error("Sem permissão para remover usuários.");
      return;
    }
    const uniqueIds = Array.from(new Set(ids));
    if (uniqueIds.length === 0) return;
    if (!confirm(`Tem certeza que deseja excluir ${uniqueIds.length} usuário(s)?`)) {
      return;
    }

    const results = await Promise.allSettled(uniqueIds.map(id => deleteUser(id)));
    const deletedIds = uniqueIds.filter((_, index) => results[index].status === "fulfilled");
    const failedCount = results.length - deletedIds.length;

    if (deletedIds.length > 0) {
      setUsers(prev => prev.filter(user => !deletedIds.includes(user.id)));
      toast.success(`${deletedIds.length} usuário(s) removido(s) com sucesso.`);
    }
    if (failedCount > 0) {
      toast.error(`Falha ao remover ${failedCount} usuário(s).`);
    }
  };

  const columns = React.useMemo<GridColDef<UserAccount>[]>(() => {
    const baseColumns: GridColDef<UserAccount>[] = [
      {
        field: 'fullName',
        headerName: 'Nome Completo',
        flex: 1,
        minWidth: 180,
        renderCell: (params) => (
          <span className="font-medium">{params.value}</span>
        ),
      },
      {
        field: 'username',
        headerName: 'Usuário',
        flex: 1,
        minWidth: 160,
      },
      {
        field: 'email',
        headerName: 'E-mail',
        flex: 1.2,
        minWidth: 220,
      },
      {
        field: 'type',
        headerName: 'Tipo',
        width: 160,
        renderCell: (params) => (
          <div className="flex h-full items-center">
            {params.value === 'Admin' ? (
              <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200 shadow-none font-normal flex items-center gap-1">
                <ShieldAlert className="h-3 w-3" /> Admin
              </Badge>
            ) : (
              <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200 shadow-none font-normal flex items-center gap-1">
                <User className="h-3 w-3" /> Usuário
              </Badge>
            )}
          </div>
        ),
      },
      {
        field: 'isOnline',
        headerName: 'Status',
        width: 140,
        sortable: false,
        renderCell: (params) => (
          <Badge
            className={
              params.row.isOnline
                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200 shadow-none font-normal"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200 shadow-none font-normal"
            }
            title={
              params.row.lastSeen
                ? `Ultimo acesso: ${new Date(params.row.lastSeen).toLocaleString()}`
                : "Sem registro de acesso"
            }
          >
            {params.row.isOnline ? "Online" : "Offline"}
          </Badge>
        ),
      },
    ];

    if (!canManage) {
      return baseColumns;
    }

    return [
      ...baseColumns,
      {
        field: 'actions',
        headerName: 'Ações',
        width: 120,
        sortable: false,
        filterable: false,
        align: 'right',
        headerAlign: 'right',
        renderCell: (params) => (
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="icon" onClick={() => handleOpen(params.row)}>
              <Pencil className="h-4 w-4 text-slate-500 hover:text-blue-600" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleDelete(params.row.id)}>
              <Trash2 className="h-4 w-4 text-slate-500 hover:text-red-600" />
            </Button>
          </div>
        ),
      },
    ];
  }, [canManage, handleDelete, handleOpen]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle>Gerenciamento de Usuários</CardTitle>
                <CardDescription>
                    Adicione, edite ou remova usuários do sistema.
                </CardDescription>
            </div>
            {canManage && (
              <Button onClick={() => handleOpen()} className="bg-red-600 hover:bg-red-700">
                  <Plus className="mr-2 h-4 w-4" /> Adicionar Usuário
              </Button>
            )}
        </div>
      </CardHeader>
      <CardContent>
        <QmsDataGrid
          rows={users}
          columns={columns}
          loading={isLoading}
          emptyMessage="Nenhum usuário encontrado."
          loadingMessage="Carregando usuários..."
          onDeleteSelected={canManage ? (ids) => handleDeleteSelected(ids.map(String)) : undefined}
          sx={{
            width: "calc(100% - 16px)",
            margin: "8px",
          }}
        />

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
              <DialogDescription>
                Preencha os dados do usuário abaixo.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="fullName">Nome Completo</Label>
                <Input 
                  id="fullName" 
                  value={currentUser.fullName} 
                  onChange={(e) => setCurrentUser({...currentUser, fullName: e.target.value})}
                  placeholder="Ex: João da Silva" 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="username">Usuário</Label>
                <Input 
                  id="username" 
                  value={currentUser.username} 
                  onChange={(e) => setCurrentUser({...currentUser, username: e.target.value})}
                  placeholder="Ex: joao.silva" 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">E-mail</Label>
                <Input 
                  id="email" 
                  type="email"
                  value={currentUser.email} 
                  onChange={(e) => setCurrentUser({...currentUser, email: e.target.value})}
                  placeholder="Ex: joao@empresa.com" 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Tipo de Acesso</Label>
                <Autocomplete
                  disablePortal
                  options={[
                    { label: 'Usuário', value: 'User' },
                    { label: 'Administrador', value: 'Admin' },
                  ]}
                  value={
                    {
                      label: currentUser.type === 'Admin' ? 'Administrador' : 'Usuário',
                      value: currentUser.type,
                    } || null
                  }
                  onChange={(event, newValue) => {
                    if (newValue?.value) {
                      setCurrentUser({
                        ...currentUser,
                        type: newValue.value as 'User' | 'Admin',
                      });
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label=""
                      placeholder="Selecione o tipo"
                      variant="outlined"
                      size="small"
                      InputLabelProps={{ shrink: false }}
                    />
                  )}
                  sx={autocompleteBaseStyles}
                />
              </div>
              {!isEditing && (
                <div className="grid gap-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={currentUser.password || ''}
                    onChange={(e) => setCurrentUser({ ...currentUser, password: e.target.value })}
                    placeholder="Defina uma senha"
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              {isEditing && currentUser.id && (
                <Button variant="outline" onClick={handleOpenPermissions}>
                  Permissões de módulos
                </Button>
              )}
              <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
              <Button
                onClick={handleSave}
                className="bg-red-600 hover:bg-red-700"
                disabled={!canManage}
              >
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Sheet open={isPermissionsOpen} onOpenChange={handlePermissionsOpenChange}>
          <SheetContent className="sm:max-w-[520px]">
            <SheetHeader className="px-6 pt-6">
              <SheetTitle>Permissões de módulos</SheetTitle>
              <SheetDescription>
                Defina se o usuário pode visualizar e editar cada módulo do sistema.
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              {isPermissionsLoading ? (
                <div className="py-8 text-center text-sm text-slate-500">
                  Carregando permissões...
                </div>
              ) : (
                <div className="space-y-6">
                  {groupedModules.map(([groupName, modules]) => (
                    <div key={groupName} className="space-y-3">
                      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {groupName}
                      </div>
                      <div className="space-y-2">
                        {modules.map((definition) => {
                          const access = modulePermissions[definition.key] ?? {
                            canView: true,
                            canEdit: true,
                          };
                          return (
                            <div
                              key={definition.key}
                              className="grid grid-cols-[minmax(0,1fr)_80px_90px] items-center gap-3 rounded-md border border-slate-200 bg-white px-3 py-2"
                            >
                              <div>
                                <div className="text-sm font-medium text-slate-900">
                                  {definition.label}
                                </div>
                                <div className="text-xs text-slate-500">{definition.path}</div>
                              </div>
                              <div className="flex flex-col items-center gap-1">
                                <Switch
                                  checked={access.canView}
                                  onCheckedChange={(value) =>
                                    updateModulePermission(definition.key, { canView: value })
                                  }
                                  disabled={isPermissionsSaving}
                                />
                                <span className="text-[10px] uppercase text-slate-500">Ver</span>
                              </div>
                              <div className="flex flex-col items-center gap-1">
                                <Switch
                                  checked={access.canEdit}
                                  onCheckedChange={(value) =>
                                    updateModulePermission(definition.key, { canEdit: value })
                                  }
                                  disabled={!access.canView || isPermissionsSaving}
                                />
                                <span className="text-[10px] uppercase text-slate-500">Editar</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <SheetFooter className="border-t border-slate-100">
              <Button
                variant="outline"
                onClick={() => handlePermissionsOpenChange(false)}
                disabled={isPermissionsSaving}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSavePermissions}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={isPermissionsSaving || isPermissionsLoading}
              >
                Salvar permissões
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </CardContent>
    </Card>
  );
}
