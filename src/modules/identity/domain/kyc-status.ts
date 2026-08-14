import type { KycStatus } from "@/shared/types/enums";

export type KycDecision = Extract<KycStatus, "verified" | "rejected" | "none">;

export const KYC_DECISION_LABELS: Record<KycDecision, string> = {
  verified: "تایید احراز هویت",
  rejected: "رد احراز هویت",
  none: "لغو احراز هویت",
};

/**
 * تصمیم‌های مجاز ادمین روی احراز هویت.
 * تایید دستی از «انجام‌نشده» برای مراجعه حضوری است.
 * لغو از «تاییدشده» برای اصلاح اشتباه یا تغییر مدارک است.
 */
export function nextKycDecisions(from: KycStatus): readonly KycDecision[] {
  switch (from) {
    case "none":
      return ["verified"];
    case "pending":
      return ["verified", "rejected"];
    case "rejected":
      return ["verified"];
    case "verified":
      return ["none"];
  }
}

export function canAdminDecideKyc(from: KycStatus, to: KycDecision): boolean {
  return nextKycDecisions(from).includes(to);
}
