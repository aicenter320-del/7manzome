import { cn } from "@/shared/lib/cn";
import type { ChildGender } from "@/shared/types/enums";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";

/**
 * آواتار کودک.
 *
 * تصویر از مسیر کنترل‌شده api/files سرو می‌شود، نه مستقیم از فایل‌سیستم،
 * چون تصویر کودک داده حساس است.
 */
export function ChildAvatar({
  displayName,
  avatarFileId,
  gender,
  size = "default",
  className,
}: {
  displayName: string;
  avatarFileId: string | null;
  gender?: ChildGender;
  size?: "sm" | "default" | "lg";
  className?: string;
}) {
  const sizeClass = {
    sm: "size-9",
    default: "size-12",
    lg: "size-20",
  }[size];

  const initial = displayName.trim().charAt(0) || "؟";

  return (
    <Avatar className={cn(sizeClass, className)}>
      {avatarFileId ? (
        <AvatarImage src={`/api/files/${avatarFileId}`} alt={displayName} />
      ) : null}
      <AvatarFallback
        className={cn(
          "font-semibold",
          gender === "girl" && "bg-gold-soft text-gold-deep",
          gender === "boy" && "bg-treasure-soft text-treasure",
        )}
      >
        {initial}
      </AvatarFallback>
    </Avatar>
  );
}
