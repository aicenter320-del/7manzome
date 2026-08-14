"use client";

import { AccountStatusBadge } from "@/modules/identity/ui/user-account-status-select";
import { AdminUserProfileForm } from "@/modules/identity/ui/admin-user-profile-form";
import { KycDecisionSelect } from "@/modules/identity/ui/kyc-decision-select";
import { KycStatusBadge } from "@/modules/identity/ui/kyc-status-badge";
import { UserAccountStatusSelect } from "@/modules/identity/ui/user-account-status-select";
import { UserRoleSelect } from "@/modules/identity/ui/user-access-selects";
import { assignedRoleFromRoles, labelForAssignedRole, type StaffRoleOption } from "@/modules/identity/domain/user-access";
import type { AdminUserDetail } from "@/modules/identity/domain/types";
import type { ChildSummary } from "@/modules/children/domain/types";
import { formatJalaliDate } from "@/shared/lib/jalali";
import { toPersianDigits } from "@/shared/lib/persian";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";

import { AdminChildrenPanel } from "./admin-children-panel";
import { AdminCommercePanel, type AdminOrderRow, type AdminPaymentRow } from "./admin-commerce-panel";
import { AdminGiftsPanel, type AdminGiftCardRow, type AdminGiftLinkRow } from "./admin-gifts-panel";
import { AdminTreasuresPanel, type AdminTreasureRow } from "./admin-treasures-panel";
import { DeleteUserButton } from "./delete-user-button";

export type { AdminGiftCardRow, AdminGiftLinkRow, AdminOrderRow, AdminPaymentRow, AdminTreasureRow };

export function UserDetailTabs({
  actorId,
  canWrite,
  canAssignRole,
  canDelete,
  user,
  staffRoles,
  childProfiles,
  treasures,
  giftLinks,
  giftCards,
  orders,
  payments,
}: {
  actorId: string;
  canWrite: boolean;
  canAssignRole: boolean;
  canDelete: boolean;
  user: AdminUserDetail;
  staffRoles: readonly StaffRoleOption[];
  childProfiles: ChildSummary[];
  treasures: AdminTreasureRow[];
  giftLinks: AdminGiftLinkRow[];
  giftCards: AdminGiftCardRow[];
  orders: AdminOrderRow[];
  payments: AdminPaymentRow[];
}) {
  const role = assignedRoleFromRoles(user.roles);
  const isSelf = user.id === actorId;

  return (
    <Tabs defaultValue="account">
      <TabsList className="w-full flex-wrap">
        <TabsTrigger value="account">حساب</TabsTrigger>
        <TabsTrigger value="children">کودکان</TabsTrigger>
        <TabsTrigger value="treasures">گنجینه‌ها</TabsTrigger>
        <TabsTrigger value="gifts">هدیه</TabsTrigger>
        <TabsTrigger value="orders">سفارش و پرداخت</TabsTrigger>
      </TabsList>

      <TabsContent value="account" className="grid gap-8">
        {canWrite ? <AdminUserProfileForm user={user} /> : null}

        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="grid gap-1">
            <dt className="text-muted-foreground">کد ملی</dt>
            <dd className="ltr-nums">{user.nationalId ? toPersianDigits(user.nationalId) : "—"}</dd>
          </div>
          <div className="grid gap-1">
            <dt className="text-muted-foreground">تاریخ تولد</dt>
            <dd>{user.birthDateAt ? formatJalaliDate(user.birthDateAt) : "—"}</dd>
          </div>
        </dl>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="grid gap-2">
            <p className="text-sm text-muted-foreground">حساب</p>
            {canWrite ? (
              <UserAccountStatusSelect
                userId={user.id}
                displayName={user.displayName}
                status={user.status}
                isSelf={isSelf}
              />
            ) : (
              <AccountStatusBadge status={user.status} />
            )}
          </div>
          <div className="grid gap-2">
            <p className="text-sm text-muted-foreground">احراز هویت</p>
            {canWrite ? (
              <KycDecisionSelect
                userId={user.id}
                displayName={user.displayName}
                status={user.kycStatus}
              />
            ) : (
              <KycStatusBadge status={user.kycStatus} />
            )}
          </div>
          <div className="grid gap-2">
            <p className="text-sm text-muted-foreground">نقش</p>
            {canAssignRole ? (
              <UserRoleSelect userId={user.id} roles={user.roles} staffRoles={staffRoles} />
            ) : (
              <p>{labelForAssignedRole(role, staffRoles)}</p>
            )}
          </div>
        </div>

        {canWrite ? (
          <div className="grid gap-3 border-t border-border pt-6">
            <h2 className="font-medium">حذف حساب</h2>
            <DeleteUserButton
              userId={user.id}
              displayName={user.displayName}
              canDelete={canDelete}
              isSelf={isSelf}
            />
          </div>
        ) : null}
      </TabsContent>

      <TabsContent value="children">
        <AdminChildrenPanel userId={user.id} profiles={childProfiles} canWrite={canWrite} />
      </TabsContent>

      <TabsContent value="treasures">
        <AdminTreasuresPanel userId={user.id} treasures={treasures} canWrite={canWrite} />
      </TabsContent>

      <TabsContent value="gifts">
        <AdminGiftsPanel
          userId={user.id}
          links={giftLinks}
          cards={giftCards}
          canWrite={canWrite}
        />
      </TabsContent>

      <TabsContent value="orders">
        <AdminCommercePanel orders={orders} payments={payments} />
      </TabsContent>
    </Tabs>
  );
}
