import "server-only";

import { z } from "zod";

import { getSessionUser, type SessionUser } from "../auth/session";
import { hasPermission, hasRole, isStaff, type Permission } from "../auth/rbac";
import { describeError, logger } from "../logger";
import type { UserRole } from "@/shared/types/enums";

/**
 * سازنده Server Action امن.
 *
 * چرا هیچ اکشن خامی نمی‌نویسیم: هر اکشن باید چهار کار را انجام دهد —
 * بررسی سشن، بررسی مجوز، اعتبارسنجی ورودی، و مدیریت خطا. اگر این‌ها را
 * دستی در هر اکشن بنویسیم، دیر یا زود یکی جا می‌افتد و آن یکی حفره امنیتی است.
 */

export type ActionResult<TData> =
  | { ok: true; data: TData }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export type AuthRequirement = "guest" | "required" | "kyc";

/** خطای قابل نمایش به کاربر؛ پیام آن مستقیم به رابط کاربری می‌رود. */
export class ActionError extends Error {
  constructor(
    message: string,
    readonly fieldErrors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ActionError";
  }
}

/** خطای دسترسی؛ پیام یکسان می‌دهد تا وجود یا نبود منبع افشا نشود. */
export class ForbiddenError extends ActionError {
  constructor(message = "شما به این بخش دسترسی ندارید.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends ActionError {
  constructor(message = "موردی که خواستید پیدا نشد.") {
    super(message);
    this.name = "NotFoundError";
  }
}

interface HandlerContext<TInput, TAuth extends AuthRequirement> {
  input: TInput;
  user: TAuth extends "guest" ? SessionUser | null : SessionUser;
}

interface ActionDefinition<TSchema extends z.ZodType, TData, TAuth extends AuthRequirement> {
  /** نام اکشن برای لاگ؛ انگلیسی و یکتا. */
  name: string;
  schema: TSchema;
  auth: TAuth;
  /** نقش‌های مجاز؛ خالی یعنی نقش خاصی لازم نیست. */
  roles?: readonly UserRole[];
  /** مجوزهای لازم؛ همه باید موجود باشند. */
  permissions?: readonly Permission[];
  handler: (context: HandlerContext<z.output<TSchema>, TAuth>) => Promise<TData>;
}

export function createAction<
  TSchema extends z.ZodType,
  TData,
  TAuth extends AuthRequirement,
>(definition: ActionDefinition<TSchema, TData, TAuth>) {
  return async (rawInput: z.input<TSchema>): Promise<ActionResult<TData>> => {
    try {
      // ۱) سشن
      const user = await getSessionUser();

      if (definition.auth !== "guest" && !user) {
        return { ok: false, error: "برای این کار باید وارد حساب خود شوید." };
      }

      if (definition.auth === "kyc" && user && user.kycStatus !== "verified") {
        return {
          ok: false,
          error: "برای این عملیات باید ابتدا احراز هویت خود را کامل کنید.",
        };
      }

      // ۲) مجوز
      if (definition.roles?.length || definition.permissions?.length) {
        if (!user || !isStaff(user.roles)) throw new ForbiddenError();

        if (definition.roles?.length && !hasRole(user.roles, definition.roles)) {
          throw new ForbiddenError();
        }

        if (definition.permissions?.length) {
          const missing = definition.permissions.filter(
            (permission) => !hasPermission(user.roles, permission),
          );
          if (missing.length > 0) throw new ForbiddenError();
        }
      }

      // ۳) اعتبارسنجی ورودی
      const parsed = definition.schema.safeParse(rawInput);

      if (!parsed.success) {
        return {
          ok: false,
          error: "اطلاعات وارد‌شده کامل یا درست نیست.",
          fieldErrors: collectFieldErrors(parsed.error),
        };
      }

      // ۴) اجرا
      const data = await definition.handler({
        input: parsed.data,
        user: user as HandlerContext<z.output<TSchema>, TAuth>["user"],
      });

      return { ok: true, data };
    } catch (error) {
      if (error instanceof ActionError) {
        return { ok: false, error: error.message, fieldErrors: error.fieldErrors };
      }

      // خطای پیش‌بینی‌نشده: جزئیات فقط در لاگ سرور، پیام عمومی به کاربر.
      logger.error("action failed", {
        action: definition.name,
        error: describeError(error),
      });

      return {
        ok: false,
        error: "خطای غیرمنتظره‌ای رخ داد. لطفاً چند لحظه بعد دوباره تلاش کنید.",
      };
    }
  };
}

function collectFieldErrors(error: z.ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? issue.path.join(".") : "_form";
    fieldErrors[key] ??= [];
    fieldErrors[key].push(issue.message);
  }

  return fieldErrors;
}

/** کمکی برای مواقعی که اکشن ورودی ندارد. */
export const emptyInput = z.object({}).optional().default({});
