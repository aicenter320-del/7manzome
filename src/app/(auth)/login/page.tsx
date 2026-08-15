import { LoginForm } from "@/modules/identity";
import { copy } from "@/shared/config/copy";

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
        <h1 className="text-xl font-semibold">{copy.login.title}</h1>
        <p className="text-sm text-muted-foreground">{copy.login.description}</p>
      </div>
      <LoginForm {...(returnTo ? { returnTo } : {})} />
    </div>
  );
}
