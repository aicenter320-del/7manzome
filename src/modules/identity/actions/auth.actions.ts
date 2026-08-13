"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { ActionError, createAction } from "@/server/actions/action-kit";
import { destroySession } from "@/server/auth/session";

import { requestOtpSchema, verifyOtpSchema } from "../schema/identity.schema";
import { OtpError, requestOtp, verifyOtpAndLogin } from "../service/auth.service";

/** استخراج آی‌پی و مرورگر از هدرها برای ثبت در سشن و گزارش رخداد. */
async function requestMeta(): Promise<{ ip: string | null; userAgent: string }> {
  const headerList = await headers();

  // ترتیب: هدر پروکسی، سپس هدر مستقیم.
  const forwarded = headerList.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? headerList.get("x-real-ip") ?? null;

  return { ip, userAgent: headerList.get("user-agent") ?? "" };
}

export const requestLoginCode = createAction({
  name: "identity.requestLoginCode",
  schema: requestOtpSchema,
  auth: "guest",
  handler: async ({ input }) => {
    const { ip } = await requestMeta();

    try {
      return await requestOtp({ phone: input.phone, ip });
    } catch (error) {
      if (error instanceof OtpError) {
        throw new ActionError(error.message);
      }
      throw error;
    }
  },
});

export const verifyLoginCode = createAction({
  name: "identity.verifyLoginCode",
  schema: verifyOtpSchema,
  auth: "guest",
  handler: async ({ input }) => {
    const { ip, userAgent } = await requestMeta();

    try {
      const result = await verifyOtpAndLogin({
        phone: input.phone,
        code: input.code,
        userAgent,
        ip,
      });

      revalidatePath("/", "layout");

      return {
        isNewUser: result.isNewUser,
        redirectTo: input.returnTo ?? "/dashboard",
      };
    } catch (error) {
      if (error instanceof OtpError) {
        throw new ActionError(error.message, { code: [error.message] });
      }
      throw error;
    }
  },
});

export const logout = createAction({
  name: "identity.logout",
  schema: z.object({}),
  auth: "guest",
  handler: async () => {
    await destroySession();
    revalidatePath("/", "layout");
    return { ok: true };
  },
});
