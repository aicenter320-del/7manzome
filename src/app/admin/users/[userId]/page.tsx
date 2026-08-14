import { notFound } from "next/navigation";

import { UserDetailTabs } from "@/modules/admin";
import { getChildrenForUser } from "@/modules/children";
import { getGiftLinksForUser, listGiftCardsForUser } from "@/modules/gifting";
import { getUserDetailForAdmin, listAssignableStaffRoles } from "@/modules/identity";
import { getOrdersForUser } from "@/modules/orders";
import { listPayments } from "@/modules/payments";
import { getTreasuresForUser } from "@/modules/treasury";
import { requirePermission } from "@/server/auth/guards";
import { hasPermission } from "@/server/auth/rbac";
import { formatPhoneFa } from "@/shared/lib/persian";
import { PageHeader } from "@/shared/ui/page-header";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const actor = await requirePermission("user:read");
  const { userId } = await params;
  const user = await getUserDetailForAdmin(userId);
  if (!user) notFound();

  const canWrite = hasPermission(actor.roles, "user:write");
  const canAssignRole = hasPermission(actor.roles, "role:write");

  const [children, treasures, giftLinks, ordersResult, payments, staffRoles] = await Promise.all([
    getChildrenForUser(user.id, { includeArchived: true }),
    getTreasuresForUser(user.id, { includeArchived: true }),
    getGiftLinksForUser(user.id),
    getOrdersForUser(user.id, { limit: 50 }),
    listPayments({ payerUserId: user.id, limit: 50, offset: 0 }),
    listAssignableStaffRoles(),
  ]);

  const giftCards = await listGiftCardsForUser(
    user.id,
    treasures.map((item) => item.treasure.id),
  );

  const canDelete = ordersResult.total === 0 && treasures.length === 0;

  return (
    <div className="grid gap-6">
      <PageHeader title={user.displayName} description={formatPhoneFa(user.phone)} />

      <UserDetailTabs
        actorId={actor.id}
        canWrite={canWrite}
        canAssignRole={canAssignRole}
        canDelete={canDelete}
        user={user}
        staffRoles={staffRoles}
        childProfiles={children}
        treasures={treasures.map((item) => ({
          id: item.treasure.id,
          title: item.treasure.title,
          status: item.treasure.status,
          childName: item.child.displayName,
          balanceMg: item.balance.balanceMg,
          entryCount: item.balance.entryCount,
          contributorCount: item.contributorCount,
        }))}
        giftLinks={giftLinks.map((link) => ({
          id: link.id,
          title: link.title,
          status: link.status,
          url: link.url,
        }))}
        giftCards={giftCards.map((card) => ({
          id: card.id,
          code: card.code,
          status: card.status,
        }))}
        orders={ordersResult.orders.map((order) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          totalRial: order.totalRial,
          placedAt: order.placedAt,
        }))}
        payments={payments.map((payment) => ({
          id: payment.id,
          paymentNumber: payment.paymentNumber,
          status: payment.status,
          amountRial: payment.amountRial,
          createdAt: payment.createdAt,
        }))}
      />
    </div>
  );
}
