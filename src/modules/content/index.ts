/**
 * ماژول محتوا — API عمومی.
 *
 * مسئول: صفحات محتوایی، پرسش‌های متداول و تنظیمات کلید/مقدار سایت.
 * مستندات: docs/03-modules/content.md
 */

export {
  settingKeys,
  settingsDefaults,
  settingsLabels,
  settingsSchemas,
  type SettingKey,
  type SettingValue,
} from "./domain/settings-keys";

export {
  getSetting,
  getSettings,
  setSetting,
  invalidateSettingsCache,
} from "./service/settings.service";

export { getPageBySlug, listPages, listFaqs } from "./service/content.service";

export { updateSetting, savePage, createFaq } from "./actions/content.actions";
