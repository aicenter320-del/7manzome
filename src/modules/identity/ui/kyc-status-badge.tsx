import { KYC_STATUS_LABELS, type KycStatus } from "@/shared/types/enums";
import { Badge } from "@/shared/ui/badge";

const KYC_BADGE_VARIANT: Record<
  KycStatus,
  "muted" | "warning" | "success" | "destructive"
> = {
  none: "muted",
  pending: "warning",
  verified: "success",
  rejected: "destructive",
};

export function KycStatusBadge({ status }: { status: KycStatus }) {
  return <Badge variant={KYC_BADGE_VARIANT[status]}>{KYC_STATUS_LABELS[status]}</Badge>;
}
