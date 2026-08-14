"use server";

import { revalidatePath } from "next/cache";

import { ActionError, createAction } from "@/server/actions/action-kit";

import {
  createStaffRoleSchema,
  deleteStaffRoleSchema,
  updateStaffRoleSchema,
} from "../schema/identity.schema";
import {
  createStaffRole,
  removeStaffRole,
  saveStaffRole,
  StaffRoleError,
} from "../service/staff-role.service";

export const createStaffRoleAction = createAction({
  name: "identity.createStaffRole",
  schema: createStaffRoleSchema,
  auth: "required",
  permissions: ["role:write"],
  handler: async ({ input, user }) => {
    try {
      const role = await createStaffRole({
        title: input.title,
        description: input.description ?? null,
        grants: input.grants,
        actorUserId: user.id,
      });
      revalidatePath("/admin/roles");
      return { roleId: role.id };
    } catch (error) {
      if (error instanceof StaffRoleError) throw new ActionError(error.message);
      throw error;
    }
  },
});

export const updateStaffRoleAction = createAction({
  name: "identity.updateStaffRole",
  schema: updateStaffRoleSchema,
  auth: "required",
  permissions: ["role:write"],
  handler: async ({ input, user }) => {
    try {
      await saveStaffRole({
        roleId: input.roleId,
        title: input.title,
        description: input.description ?? null,
        grants: input.grants,
        actorUserId: user.id,
      });
      revalidatePath("/admin/roles");
      revalidatePath(`/admin/roles/${input.roleId}`);
      return { ok: true as const };
    } catch (error) {
      if (error instanceof StaffRoleError) throw new ActionError(error.message);
      throw error;
    }
  },
});

export const deleteStaffRoleAction = createAction({
  name: "identity.deleteStaffRole",
  schema: deleteStaffRoleSchema,
  auth: "required",
  permissions: ["role:write"],
  handler: async ({ input, user }) => {
    try {
      await removeStaffRole({ roleId: input.roleId, actorUserId: user.id });
      revalidatePath("/admin/roles");
      return { ok: true as const };
    } catch (error) {
      if (error instanceof StaffRoleError) throw new ActionError(error.message);
      throw error;
    }
  },
});
