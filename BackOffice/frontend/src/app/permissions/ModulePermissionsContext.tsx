import React from "react";
import type { ModulePermissionMap } from "../../lib/module-permissions";

type ModulePermissionsContextValue = {
  permissions: ModulePermissionMap;
  isLoading: boolean;
};

const ModulePermissionsContext = React.createContext<ModulePermissionsContextValue | undefined>(
  undefined
);

export function ModulePermissionsProvider({
  permissions,
  isLoading,
  children,
}: {
  permissions: ModulePermissionMap;
  isLoading: boolean;
  children: React.ReactNode;
}) {
  return (
    <ModulePermissionsContext.Provider value={{ permissions, isLoading }}>
      {children}
    </ModulePermissionsContext.Provider>
  );
}

export function useModulePermissions() {
  const context = React.useContext(ModulePermissionsContext);
  if (!context) {
    throw new Error("useModulePermissions must be used within ModulePermissionsProvider.");
  }
  return context;
}

export function useModulePermission(moduleKey: string) {
  const { permissions, isLoading } = useModulePermissions();
  const access = permissions[moduleKey] ?? { canView: true, canEdit: false };

  return {
    canView: access.canView,
    canEdit: isLoading ? false : access.canEdit,
    isLoading,
  };
}
