import { getPublicTreasures } from "@/modules/treasury";
import { Card, CardContent } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { GoldWeight } from "@/shared/ui/gold-weight";
import { PageHeader } from "@/shared/ui/page-header";
import { Progress } from "@/shared/ui/progress";
import { toPersianDigits } from "@/shared/lib/persian";

export default async function PublicTreasuresPage() {
  const treasures = await getPublicTreasures(12);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <PageHeader
        title="گنجینه‌هایی که در حال ساخته‌شدن‌اند"
        description="هر هدیه، یک قدم برای ساختن آینده یک کودک است. اینجا فقط نام کوچک و پیشرفت دیده می‌شود."
      />

      {treasures.length === 0 ? (
        <EmptyState
          className="mt-8"
          title="هنوز گنجینه عمومی‌ای نیست"
          description="وقتی خانواده‌ها گنجینه می‌سازند، داستان پیشرفت‌شان اینجا الهام‌بخش می‌شود."
        />
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {treasures.map((summary) => (
            <Card key={summary.treasure.id}>
              <CardContent className="grid gap-3 p-5">
                <p className="font-semibold">گنجینه {summary.child.firstName}</p>
                <p className="text-xs text-muted-foreground">{summary.child.ageLabel}</p>
                <GoldWeight mg={summary.balance.balanceMg} className="text-treasure" />
                {summary.goal ? (
                  <div className="grid gap-2">
                    <div className="flex items-baseline justify-between text-sm">
                      <span className="text-muted-foreground">پیشرفت</span>
                      <span className="text-gold-deep">
                        {toPersianDigits(summary.progressPercent)}٪
                      </span>
                    </div>
                    <Progress value={summary.progressPercent} />
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">هر هدیه‌ای به این گنجینه ارزشمند است.</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
