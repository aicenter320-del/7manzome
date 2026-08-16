import Link from "next/link";

import { copy } from "@/shared/config/copy";
import { site } from "@/shared/config/site";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { PageHeader } from "@/shared/ui/page-header";

import { RedeemGiftCardForm } from "./redeem-form";

export default function GiftPage() {
  return (
    <main className="grid gap-8 px-4 py-6">
      <PageHeader title={copy.gift.title} description={copy.gift.description} />

      <p className="leading-relaxed text-muted-foreground">{copy.gift.body}</p>
      <p className="text-sm text-muted-foreground">{copy.gift.hasLinkHint}</p>

      <div className="flex flex-col gap-3">
        <Button asChild variant="gold" size="lg" className="rounded-full">
          <Link href="/products">{copy.gift.shopInstead}</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="rounded-full">
          <Link href="/login?returnTo=/dashboard/treasures/new">{copy.gift.startAsParent}</Link>
        </Button>
      </div>

      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>{copy.gift.cardTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <RedeemGiftCardForm />
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">{site.slogan}</p>
    </main>
  );
}
