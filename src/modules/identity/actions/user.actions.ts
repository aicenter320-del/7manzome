"use server";

import { revalidatePath } from "next/cache";

import { ActionError, createAction } from "@/server/actions/action-kit";

import {
  reviewKycSchema,
  setRoleSchema,
  setUserStatusSchema,
  assignUserAccessSchema,
  submitKycSchema,
  updateAdminUserProfileSchema,
  updateProfileSchema,
} from "../schema/identity.schema";
import {
  KycConflictError,
  InvalidKycDecisionError,
  reviewKyc,
  saveProfile,
  assignUserAccess,
  setUserRole,
  setUserStatus,
  submitKycRequest,
} from "../service/user.service";

export const updateProfile = createAction({
  name: "identity.updateProfile",
  schema: updateProfileSchema,
  auth: "required",
  handler: async ({ input, user }) => {
    await saveProfile(user.id, {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email || null,
    });

    revalidatePath("/dashboard/profile");
    return { ok: true };
  },
});

export const submitKyc = createAction({
  name: "identity.submitKyc",
  schema: submitKycSchema,
  auth: "required",
  handler: async ({ input, user }) => {
    try {
      await submitKycRequest(user.id, input);
    } catch (error) {
      if (error instanceof KycConflictError) {
        throw new ActionError(error.message, { nationalId: [error.message] });
      }
      throw error;
    }

    revalidatePath("/dashboard/profile");
    return { ok: true };
  },
});

export const decideKyc = createAction({
  name: "identity.decideKyc",
  schema: reviewKycSchema,
  auth: "required",
  permissions: ["user:write"],
  handler: async ({ input, user }) => {
    try {
      await reviewKyc({
        userId: input.userId,
        decision: input.decision,
        ...(input.reason ? { reason: input.reason } : {}),
        actorUserId: user.id,
      });
    } catch (error) {
      if (error instanceof InvalidKycDecisionError) {
        throw new ActionError(error.message);
      }
      throw error;
    }

    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${input.userId}`);
    return { ok: true };
  },
});

export const changeUserStatus = createAction({
  name: "identity.changeUserStatus",
  schema: setUserStatusSchema,
  auth: "required",
  permissions: ["user:write"],
  handler: async ({ input, user }) => {
    if (input.userId === user.id) {
      throw new ActionError("نمی‌توانید وضعیت حساب خودتان را تغییر دهید.");
    }

    await setUserStatus({
      userId: input.userId,
      status: input.status,
      actorUserId: user.id,
    });

    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${input.userId}`);
    return { ok: true };
  },
});

export const changeUserRole = createAction({
  name: "identity.changeUserRole",
  schema: setRoleSchema,
  auth: "required",
  permissions: ["role:write"],
  handler: async ({ input, user }) => {
    // جلوگیری از قفل شدن سیستم: کسی نمی‌تواند نقش مدیر ارشد خودش را بردارد.
    if (input.userId === user.id && input.role === "super_admin" && !input.grant) {
      throw new ActionError("نمی‌توانید نقش مدیر ارشد خودتان را حذف کنید.");
    }

    await setUserRole({
      userId: input.userId,
      role: input.role,
      grant: input.grant,
      actorUserId: user.id,
    });

    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${input.userId}`);
    return { ok: true };
  },
});

export const assignUserAccessAction = createAction({
  name: "identity.assignUserAccess",
  schema: assignUserAccessSchema,
  auth: "required",
  permissions: ["role:write"],
  handler: async ({ input, user }) => {
    if (input.userId === user.id && input.role !== "super_admin") {
      throw new ActionError("نمی‌توانید نقش مدیر ارشد خودتان را حذف کنید.");
    }

    await assignUserAccess({
      userId: input.userId,
      role: input.role,
      actorUserId: user.id,
    });

    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${input.userId}`);
    return { ok: true };
  },
});

export const updateAdminUserProfile = createAction({
  name: "identity.updateAdminUserProfile",
  schema: updateAdminUserProfileSchema,
  auth: "required",
  permissions: ["user:write"],
  handler: async ({ input }) => {
    await saveProfile(input.userId, {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email || null,
    });

    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${input.userId}`);
    return { ok: true };
  },
});
