import Link from "next/link";

import { copy, cta } from "@/shared/config/copy";
import { Button } from "@/shared/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold">{copy.notFound.title}</h1>
      <p className="text-muted-foreground">{copy.notFound.body}</p>
      <Button asChild>
        <Link href="/">{cta.backHome}</Link>
      </Button>
    </main>
  );
}
