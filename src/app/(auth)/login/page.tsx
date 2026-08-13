import { LoginForm } from "@/modules/identity";
import { site } from "@/shared/config/site";

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string | string[] }>;
}) {
  const params = await searchParams;
  const returnTo = firstParam(params.returnTo);

  return (
    <div className="grid gap-6">
      <div className="grid gap-1 text-center">
        <h1 className="text-xl font-semibold">ورود به {site.name}</h1>
        <p className="text-sm text-muted-foreground">با شماره موبایل و کد تایید وارد شوید.</p>
      </div>
      <LoginForm {...(returnTo ? { returnTo } : {})} />
    </div>
  );
}
