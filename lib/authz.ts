import { prisma } from "./prisma";

export type PermissionCheck = {
  module: string;
  resource?: string | null;
  action: "read" | "create" | "update" | "delete";
};

function actionMatches(rule: { canRead: boolean; canCreate: boolean; canUpdate: boolean; canDelete: boolean }, action: PermissionCheck["action"]): boolean {
  if (action === "read") return rule.canRead;
  if (action === "create") return rule.canCreate || rule.canUpdate;
  if (action === "update") return rule.canUpdate;
  if (action === "delete") return rule.canDelete;
  return false;
}

export async function hasPermission(userId: string, check: PermissionCheck): Promise<boolean> {
  const roles = await prisma.userRole.findMany({
    where: { userId },
    include: {
      role: {
        include: {
          permissionClass: {
            include: { rules: true },
          },
        },
      },
    },
  });

  const normModule = check.module.trim().toLowerCase();
  const normResource = check.resource?.trim().toLowerCase();

  for (const role of roles) {
    const cls = role.role.permissionClass;
    if (!cls) continue;
    for (const rule of cls.rules) {
      const m = rule.module.trim().toLowerCase();
      const r = rule.resource?.trim().toLowerCase();
      if (m !== normModule) continue;
      if (normResource && r && r !== normResource) continue;
      if (actionMatches(rule, check.action)) return true;
    }
  }

  return false;
}
