import Link from "next/link";

import { copy } from "@/shared/config/copy";
import { site } from "@/shared/config/site";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { PageHeader } from "@/shared/ui/page-header";

import { RedeemGiftCardForm } from "./redeem-form";

export default function GiftPage() {
  return (
    <main className="mx-auto grid w-full max-w-3xl gap-8 px-4 py-10 sm:px-6">
      <PageHeader title={copy.gift.title} description={copy.gift.description} />

      <p className="leading-relaxed text-muted-foreground">{copy.gift.body}</p>
      <p className="text-sm text-muted-foreground">{copy.gift.hasLinkHint}</p>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button asChild variant="gold" size="lg">
          <Link href="/products">{copy.gift.shopInstead}</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/login?returnTo=/dashboard/treasures/new">{copy.gift.startAsParent}</Link>
        </Button>
      </div>

      <Card>
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
