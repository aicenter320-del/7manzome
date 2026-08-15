/**
 * مسیر پس از ورود. کارمند به پنل مدیریت می‌رود مگر خودش مسیر دیگری خواسته باشد.
 */
export function postLoginPath(isStaffUser: boolean, returnTo?: string): string {
  if (returnTo) {
    return returnTo;
  }

  return isStaffUser ? "/admin" : "/dashboard";
}
