"use server";

import { revalidatePath } from "next/cache";

import { ActionError, createAction } from "@/server/actions/action-kit";
import { saveUploadedFile, FileValidationError } from "@/server/storage/file-storage";
import { z } from "zod";
import { idSchema } from "@/shared/lib/validators";

import {
  addGuardianSchema,
  addTimelineEventSchema,
  childIdSchema,
  createChildSchema,
  updateChildSchema,
} from "../schema/child.schema";
import {
  addGuardian,
  addTimelineEvent,
  archive,
  BirthDateError,
  ChildAccessError,
  createChild,
  editChild,
  removeGuardian,
  restore,
} from "../service/child.service";

/** تبدیل خطاهای دامنه به خطای قابل نمایش. */
function rethrowDomainError(error: unknown): never {
  if (error instanceof BirthDateError) {
    throw new ActionError(error.message, { birthDateAt: [error.message] });
  }
  if (error instanceof ChildAccessError) {
    throw new ActionError(error.message);
  }
  throw error;
}

export const createChildProfile = createAction({
  name: "children.create",
  schema: createChildSchema,
  auth: "required",
  handler: async ({ input, user }) => {
    try {
      const child = await createChild({
        ownerUserId: user.id,
        firstName: input.firstName,
        ...(input.lastName ? { lastName: input.lastName } : {}),
        ...(input.nameEn ? { nameEn: input.nameEn } : {}),
        gender: input.gender,
        birthDateAt: input.birthDateAt,
        ...(input.note ? { note: input.note } : {}),
        relation: input.relation,
      });

      revalidatePath("/dashboard/children");
      revalidatePath("/dashboard");

      return { childId: child.id, displayName: child.displayName };
    } catch (error) {
      rethrowDomainError(error);
    }
  },
});

export const updateChildProfile = createAction({
  name: "children.update",
  schema: updateChildSchema,
  auth: "required",
  handler: async ({ input, user }) => {
    try {
      await editChild({ ...input, userId: user.id });

      revalidatePath("/dashboard/children");
      revalidatePath(`/dashboard/children/${input.childId}`);

      return { ok: true };
    } catch (error) {
      rethrowDomainError(error);
    }
  },
});

export const archiveChildProfile = createAction({
  name: "children.archive",
  schema: childIdSchema,
  auth: "required",
  handler: async ({ input, user }) => {
    try {
      await archive(input.childId, user.id);
      revalidatePath("/dashboard/children");
      return { ok: true };
    } catch (error) {
      rethrowDomainError(error);
    }
  },
});

export const restoreChildProfile = createAction({
  name: "children.restore",
  schema: childIdSchema,
  auth: "required",
  handler: async ({ input, user }) => {
    try {
      await restore(input.childId, user.id);
      revalidatePath("/dashboard/children");
      return { ok: true };
    } catch (error) {
      rethrowDomainError(error);
    }
  },
});

export const addChildGuardian = createAction({
  name: "children.addGuardian",
  schema: addGuardianSchema,
  auth: "required",
  handler: async ({ input, user }) => {
    try {
      await addGuardian({ ...input, actorUserId: user.id });
      revalidatePath(`/dashboard/children/${input.childId}`);
      return { ok: true };
    } catch (error) {
      rethrowDomainError(error);
    }
  },
});

export const removeChildGuardian = createAction({
  name: "children.removeGuardian",
  schema: z.object({ childId: idSchema, userId: idSchema }),
  auth: "required",
  handler: async ({ input, user }) => {
    try {
      await removeGuardian({ ...input, actorUserId: user.id });
      revalidatePath(`/dashboard/children/${input.childId}`);
      return { ok: true };
    } catch (error) {
      rethrowDomainError(error);
    }
  },
});

export const addChildTimelineEvent = createAction({
  name: "children.addTimelineEvent",
  schema: addTimelineEventSchema,
  auth: "required",
  handler: async ({ input, user }) => {
    try {
      await addTimelineEvent({ ...input, userId: user.id });
      revalidatePath(`/dashboard/children/${input.childId}`);
      return { ok: true };
    } catch (error) {
      rethrowDomainError(error);
    }
  },
});

/**
 * آپلود تصویر کودک.
 *
 * تصویر کودک داده حساس است، پس فایل private ذخیره می‌شود و فقط از مسیر
 * کنترل‌شده با بررسی دسترسی سرو می‌گردد.
 */
export const uploadChildAvatar = createAction({
  name: "children.uploadAvatar",
  schema: z.object({
    childId: idSchema,
    file: z.instanceof(File, { message: "فایل تصویر را انتخاب کنید" }),
  }),
  auth: "required",
  handler: async ({ input, user }) => {
    try {
      const saved = await saveUploadedFile({
        file: input.file,
        folder: "children",
        visibility: "private",
        uploadedByUserId: user.id,
      });

      await editChild({
        childId: input.childId,
        userId: user.id,
        avatarFileId: saved.id,
      });

      revalidatePath(`/dashboard/children/${input.childId}`);

      return { fileId: saved.id };
    } catch (error) {
      if (error instanceof FileValidationError) {
        throw new ActionError(error.message, { file: [error.message] });
      }
      rethrowDomainError(error);
    }
  },
});
