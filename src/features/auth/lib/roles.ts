import { Role } from "@prisma/client";

const CATALOGUE_EDITOR_ROLES: Role[] = [Role.PRODUCT_ADMIN, Role.ADMIN];

export function canEditCatalogue(role: Role): boolean {
  return CATALOGUE_EDITOR_ROLES.includes(role);
}
