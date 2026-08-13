import { getSettings, settingKeys, settingsLabels } from "@/modules/content";
import { requirePermission } from "@/server/auth/guards";
import { PageHeader } from "@/shared/ui/page-header";

import { SettingsEditor } from "./settings-form";

export default async function AdminSettingsPage() {
  await requirePermission("settings:write");
  const values = await getSettings(settingKeys);

  const items = settingKeys.map((key) => ({
    key,
    label: settingsLabels[key],
    value: values[key],
  }));

  return (
    <div className="grid gap-6">
      <PageHeader
        title="تنظیمات"
        description="مبالغ به ریال و درصدها به صدم درصد ذخیره می‌شوند."
      />
      <SettingsEditor items={items} />
    </div>
  );
}
