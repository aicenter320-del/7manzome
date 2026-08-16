/**
 * بررسی سلامت معماری و همگامی مستندات.
 *
 * ESLint مرزهای import را قفل می‌کند، اما چیزهایی هست که لینتر نمی‌بیند:
 * ماژولی که کارت مستندات ندارد، متغیر محیطی که در .env.example نیامده،
 * جدولی که در مدل داده توضیح داده نشده، جدولی که در رجیستری seed نیست،
 * یا دور در گراف وابستگی ماژول‌ها.
 *
 * این اسکریپت همان‌ها را می‌گیرد. اجرا: npm run check:arch
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

import { SEED_TABLE_REGISTRY } from "./seed/registry";

const ROOT = process.cwd();

type Severity = "error" | "warning";

interface Problem {
  severity: Severity;
  rule: string;
  message: string;
  file?: string;
}

const problems: Problem[] = [];

function report(severity: Severity, rule: string, message: string, file?: string): void {
  problems.push({ severity, rule, message, file });
}

// ------------------------------------------------------------------
// کمکی‌ها
// ------------------------------------------------------------------

function readIfExists(path: string): string | null {
  const full = join(ROOT, path);
  return existsSync(full) ? readFileSync(full, "utf8") : null;
}

function listDirs(path: string): string[] {
  const full = join(ROOT, path);
  if (!existsSync(full)) return [];
  return readdirSync(full).filter((name) => statSync(join(full, name)).isDirectory());
}

function walkFiles(path: string, extensions: string[]): string[] {
  const full = join(ROOT, path);
  if (!existsSync(full)) return [];

  const found: string[] = [];

  const visit = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const child = join(dir, entry.name);
      if (entry.isDirectory()) {
        visit(child);
      } else if (extensions.some((ext) => entry.name.endsWith(ext))) {
        found.push(relative(ROOT, child).split(sep).join("/"));
      }
    }
  };

  visit(full);
  return found;
}

// ------------------------------------------------------------------
// ۱. هر ماژول باید index.ts، کارت مستندات و ردیف رجیستری داشته باشد
// ------------------------------------------------------------------

function checkModules(): string[] {
  const modules = listDirs("src/modules");
  const registry = readIfExists("docs/01-architecture/module-registry.md") ?? "";

  for (const name of modules) {
    if (!existsSync(join(ROOT, "src/modules", name, "index.ts"))) {
      report(
        "error",
        "module-public-api",
        `ماژول «${name}» فایل index.ts ندارد. تنها دروازه عمومی هر ماژول index.ts است.`,
        `src/modules/${name}`,
      );
    }

    if (!existsSync(join(ROOT, "docs/03-modules", `${name}.md`))) {
      report(
        "error",
        "module-doc",
        `ماژول «${name}» کارت مستندات ندارد. از docs/03-modules/_template.md بسازید.`,
        `docs/03-modules/${name}.md`,
      );
    }

    if (!registry.includes(`\`${name}\``)) {
      report(
        "error",
        "module-registry",
        `ماژول «${name}» در رجیستری ماژول‌ها ثبت نشده است.`,
        "docs/01-architecture/module-registry.md",
      );
    }
  }

  return modules;
}

// ------------------------------------------------------------------
// ۲. گراف وابستگی ماژول‌ها نباید دور داشته باشد
// ------------------------------------------------------------------

function checkModuleCycles(modules: string[]): void {
  const graph = new Map<string, Set<string>>();
  const importPattern = /from\s+["']@\/modules\/([a-z0-9-]+)/g;

  for (const name of modules) {
    const deps = new Set<string>();
    for (const file of walkFiles(`src/modules/${name}`, [".ts", ".tsx"])) {
      const content = readFileSync(join(ROOT, file), "utf8");
      for (const match of content.matchAll(importPattern)) {
        const target = match[1];
        if (target && target !== name) deps.add(target);
      }
    }
    graph.set(name, deps);
  }

  const state = new Map<string, "visiting" | "done">();
  const stack: string[] = [];

  const visit = (name: string): void => {
    const current = state.get(name);
    if (current === "done") return;

    if (current === "visiting") {
      const cycleStart = stack.indexOf(name);
      const cycle = [...stack.slice(cycleStart), name].join(" → ");
      report(
        "error",
        "module-cycle",
        `دور در گراف وابستگی ماژول‌ها: ${cycle}. یعنی منطق در ماژول اشتباهی نشسته است.`,
      );
      return;
    }

    state.set(name, "visiting");
    stack.push(name);
    for (const dep of graph.get(name) ?? []) visit(dep);
    stack.pop();
    state.set(name, "done");
  };

  for (const name of modules) visit(name);
}

// ------------------------------------------------------------------
// ۳. متغیرهای محیطی باید در .env.example و مستندات باشند
// ------------------------------------------------------------------

function checkEnvVars(): void {
  const envSource = readIfExists("src/shared/config/env.ts");
  if (!envSource) return;

  const example = readIfExists(".env.example") ?? "";
  const docs = readIfExists("docs/05-ops/environment.md") ?? "";

  const schemaStart = envSource.indexOf("const envSchema");
  const schemaEnd = envSource.indexOf("export type Env");
  if (schemaStart < 0 || schemaEnd < 0) return;

  const schemaBlock = envSource.slice(schemaStart, schemaEnd);
  const names = new Set<string>();
  for (const match of schemaBlock.matchAll(/^\s{2}([A-Z][A-Z0-9_]+):/gm)) {
    if (match[1]) names.add(match[1]);
  }

  for (const name of names) {
    if (name === "NODE_ENV") continue;

    if (!example.includes(name)) {
      report(
        "error",
        "env-example",
        `متغیر محیطی «${name}» در .env.example نیامده است.`,
        ".env.example",
      );
    }

    if (!docs.includes(name)) {
      report(
        "error",
        "env-docs",
        `متغیر محیطی «${name}» در docs/05-ops/environment.md مستند نشده است.`,
        "docs/05-ops/environment.md",
      );
    }
  }
}

// ------------------------------------------------------------------
// ۴. هر جدول دیتابیس باید در مدل داده توضیح داده شده باشد
// ------------------------------------------------------------------

function listSchemaTables(): Set<string> {
  const tables = new Set<string>();
  for (const file of walkFiles("src/server/db/schema", [".ts"])) {
    const content = readFileSync(join(ROOT, file), "utf8");
    for (const match of content.matchAll(/sqliteTable\(\s*["']([a-z0-9_]+)["']/g)) {
      if (match[1]) tables.add(match[1]);
    }
  }
  return tables;
}

function checkDatabaseDocs(): void {
  const dataModel = readIfExists("docs/02-domain/data-model.md");
  if (!dataModel) return;

  for (const table of listSchemaTables()) {
    if (!dataModel.includes(table)) {
      report(
        "error",
        "table-docs",
        `جدول «${table}» در docs/02-domain/data-model.md مستند نشده است.`,
        "docs/02-domain/data-model.md",
      );
    }
  }
}

function checkSeedRegistry(): void {
  const tables = listSchemaTables();
  const registry = new Map(SEED_TABLE_REGISTRY.map((entry) => [entry.table, entry]));

  for (const table of tables) {
    if (!registry.has(table)) {
      report(
        "error",
        "seed-registry",
        `جدول «${table}» در scripts/seed/registry.ts نیست. یا ردیف ماک اضافه کنید یا policy=runtime_empty بگذارید.`,
        "scripts/seed/registry.ts",
      );
    }
  }

  for (const entry of SEED_TABLE_REGISTRY) {
    if (!tables.has(entry.table)) {
      report(
        "error",
        "seed-registry",
        `رجیستری seed جدول «${entry.table}» را دارد که در اسکیما نیست.`,
        "scripts/seed/registry.ts",
      );
    }
  }

  const catalogDoc = readIfExists("docs/05-ops/seed-catalog.md") ?? "";
  if (!catalogDoc) {
    report(
      "error",
      "seed-catalog-doc",
      "فایل docs/05-ops/seed-catalog.md وجود ندارد. قرارداد ماک دیتا باید مستند باشد.",
      "docs/05-ops/seed-catalog.md",
    );
    return;
  }

  for (const table of tables) {
    if (!catalogDoc.includes(`\`${table}\``)) {
      report(
        "error",
        "seed-catalog-doc",
        `جدول «${table}» در docs/05-ops/seed-catalog.md نیامده است.`,
        "docs/05-ops/seed-catalog.md",
      );
    }
  }
}

// ------------------------------------------------------------------
// ۵. قوانین دامنه که لینتر نمی‌بیند
// ------------------------------------------------------------------

const APPEND_ONLY_TABLES = ["goldLedgerEntries", "goldCoverEntries", "goldPrices", "auditLogs"];

function checkAppendOnlyTables(): void {
  for (const file of walkFiles("src", [".ts", ".tsx"])) {
    const content = readFileSync(join(ROOT, file), "utf8");

    for (const table of APPEND_ONLY_TABLES) {
      // الگوهای db.update(x) و db.delete(x) روی جدول‌های append-only
      const mutation = new RegExp(`\\.(update|delete)\\(\\s*${table}\\b`);
      if (mutation.test(content)) {
        report(
          "error",
          "append-only",
          `جدول «${table}» فقط append-only است؛ UPDATE و DELETE روی آن ممنوع است. اصلاح = رکورد جدید.`,
          file,
        );
      }
    }
  }
}

function checkMoneyColumnNaming(): void {
  for (const file of walkFiles("src/server/db/schema", [".ts"])) {
    const content = readFileSync(join(ROOT, file), "utf8");

    for (const match of content.matchAll(/["']([a-z0-9_]*(?:price|amount|fee|total)[a-z0-9_]*)["']/g)) {
      const column = match[1];
      if (!column) continue;
      if (column.endsWith("_rial") || column.endsWith("_bp") || column.endsWith("_mg")) continue;
      // ستون‌هایی که واحد ندارند و واحدشان از نام مشخص نیست.
      if (/^(price|amount|fee|total)$/.test(column)) {
        report(
          "error",
          "unit-suffix",
          `ستون «${column}» بدون پسوند واحد است. ستون پولی باید به _rial و وزنی به _mg ختم شود.`,
          file,
        );
      }
    }
  }
}

// ------------------------------------------------------------------
// ۶. قوانین رابط کاربری
// ------------------------------------------------------------------

const PHYSICAL_DIRECTION_CLASSES =
  /\b(?:ml|mr|pl|pr|border-l|border-r|rounded-l|rounded-r)-(?:\[|\d|px|auto|none|full)/;
const PHYSICAL_TEXT_ALIGN = /\btext-(?:left|right)\b/;
const HARDCODED_TAILWIND_COLOR =
  /\b(?:bg|text|border|ring|from|to|via)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/;
const HARDCODED_BW = /\b(?:bg|text|border)-(?:white|black)\b/;

function checkUiRules(): void {
  const uiFiles = [
    ...walkFiles("src/app", [".tsx"]),
    ...walkFiles("src/shared/ui", [".tsx"]),
    ...walkFiles("src/modules", [".tsx"]),
  ];

  for (const file of uiFiles) {
    const lines = readFileSync(join(ROOT, file), "utf8").split("\n");

    lines.forEach((line, index) => {
      const at = `${file}:${index + 1}`;

      if (line.includes("check-architecture-ignore")) return;

      if (PHYSICAL_DIRECTION_CLASSES.test(line)) {
        report(
          "error",
          "rtl-logical-classes",
          "کلاس جهت‌دار فیزیکی استفاده شده. از ms/me/ps/pe/border-s/border-e استفاده کنید.",
          at,
        );
      }

      if (PHYSICAL_TEXT_ALIGN.test(line)) {
        report(
          "error",
          "rtl-logical-classes",
          "به‌جای text-left و text-right از text-start و text-end استفاده کنید.",
          at,
        );
      }

      if (HARDCODED_TAILWIND_COLOR.test(line) || HARDCODED_BW.test(line)) {
        report(
          "error",
          "design-tokens",
          "رنگ hard-coded استفاده شده. فقط توکن‌های برند مجازند (bg-card، text-muted-foreground، bg-gold و ...).",
          at,
        );
      }
    });
  }
}

// ------------------------------------------------------------------
// ۷. مستندات کهنه
// ------------------------------------------------------------------

function checkContextFreshness(): void {
  if (!existsSync(join(ROOT, "docs/CONTEXT.md"))) {
    report("error", "context-doc", "فایل docs/CONTEXT.md وجود ندارد.", "docs/CONTEXT.md");
  }

  const requiredDocs = [
    "docs/README.md",
    "docs/00-overview/glossary.md",
    "docs/01-architecture/overview.md",
    "docs/01-architecture/module-registry.md",
    "docs/02-domain/domain-rules.md",
    "docs/02-domain/data-model.md",
    "docs/05-ops/seed-catalog.md",
    "AGENTS.md",
  ];

  for (const doc of requiredDocs) {
    if (!existsSync(join(ROOT, doc))) {
      report("error", "missing-doc", `مستند اجباری «${doc}» وجود ندارد.`, doc);
    }
  }
}

// ------------------------------------------------------------------
// اجرا
// ------------------------------------------------------------------

const modules = checkModules();
checkModuleCycles(modules);
checkEnvVars();
checkDatabaseDocs();
checkSeedRegistry();
checkAppendOnlyTables();
checkMoneyColumnNaming();
checkUiRules();
checkContextFreshness();

const errors = problems.filter((problem) => problem.severity === "error");
const warnings = problems.filter((problem) => problem.severity === "warning");

if (problems.length === 0) {
  console.log("بررسی معماری: بدون ایراد ✔");
  console.log(`  ماژول‌های بررسی‌شده: ${modules.length === 0 ? "هنوز ماژولی ساخته نشده" : modules.join(", ")}`);
  process.exit(0);
}

const group = (list: Problem[], title: string): void => {
  if (list.length === 0) return;
  console.log(`\n${title} (${list.length})`);
  for (const problem of list) {
    console.log(`  [${problem.rule}] ${problem.message}`);
    if (problem.file) console.log(`      ${problem.file}`);
  }
};

group(errors, "خطاها");
group(warnings, "هشدارها");

console.log("");

if (errors.length > 0) {
  console.error(`بررسی معماری شکست خورد: ${errors.length} خطا.`);
  process.exit(1);
}

console.log("بررسی معماری با هشدار تمام شد.");
