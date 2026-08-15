"use client";

import { ChevronDownIcon } from "lucide-react";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type InputHTMLAttributes,
  type KeyboardEvent,
} from "react";

import { cn } from "@/shared/lib/cn";
import {
  exactSearchOption,
  filterSearchOptions,
  uniqueCompletion,
  type SearchSelectOption,
} from "@/shared/lib/search-select";

import { Popover, PopoverAnchor, PopoverContent } from "./popover";

export type { SearchSelectOption };

const EMPTY_ALIASES: readonly string[] = [];

/**
 * انتخاب از فهرست با امکان تایپ: فیلتر پیشوندی، تکمیل کمرنگ وقتی فقط یک مورد مانده،
 * و انتخاب با کلیک یا Enter. مقدار نهایی باید یکی از گزینه‌ها باشد؛ متن آزاد ذخیره نمی‌شود.
 */
export function SearchSelect({
  id,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  emptyText = "موردی پیدا نشد",
  queryAliases = EMPTY_ALIASES,
  className,
  inputMode,
  dir,
  "aria-label": ariaLabel,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly SearchSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  emptyText?: string;
  /** پیشوندهایی مثل «بانک» که در برچسب نیستند ولی کاربر می‌نویسد. */
  queryAliases?: readonly string[];
  className?: string;
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
  dir?: "rtl" | "ltr";
  "aria-label"?: string;
}) {
  const listboxId = useId();
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const selected = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value],
  );

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(selected?.label ?? "");
  const [highlighted, setHighlighted] = useState(0);
  const [boxWidth, setBoxWidth] = useState<number>();

  useLayoutEffect(() => {
    if (inputRef.current === document.activeElement) {
      return;
    }
    setQuery(selected?.label ?? "");
  }, [value, selected?.label]);

  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) {
      return;
    }
    const update = () => setBoxWidth(el.getBoundingClientRect().width);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const filtered = useMemo(
    () => filterSearchOptions(options, query, queryAliases),
    [options, query, queryAliases],
  );

  const completion = useMemo(
    () => uniqueCompletion(options, query, queryAliases),
    [options, query, queryAliases],
  );

  const activeIndex = filtered.length === 0 ? 0 : Math.min(highlighted, filtered.length - 1);

  useEffect(() => {
    if (!open) {
      return;
    }
    itemRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, filtered, open]);

  const selectOption = (option: SearchSelectOption) => {
    onChange(option.value);
    setQuery(option.label);
    setOpen(false);
  };

  /** بستن بدون انتخاب از فهرست: فقط تطبیق دقیق یا تکمیل یکتا؛ وگرنه برچسب قبلی. */
  const commitTypedOrRevert = () => {
    const exact = exactSearchOption(options, query, queryAliases);
    if (exact) {
      selectOption(exact);
      return;
    }
    if (completion) {
      selectOption(completion.option);
      return;
    }
    setQuery(selected?.label ?? "");
    setOpen(false);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setHighlighted((index) => Math.min(index + 1, Math.max(filtered.length - 1, 0)));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setHighlighted((index) => Math.max(index - 1, 0));
      return;
    }

    if (event.key === "Enter") {
      if (open) {
        event.preventDefault();
        const highlightedOption = filtered[activeIndex];
        if (highlightedOption) {
          selectOption(highlightedOption);
        } else {
          commitTypedOrRevert();
        }
      }
      return;
    }

    if (event.key === "Tab") {
      const exact = exactSearchOption(options, query, queryAliases);
      if (exact) {
        selectOption(exact);
      } else if (completion) {
        selectOption(completion.option);
      }
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setQuery(selected?.label ?? "");
      setOpen(false);
    }
  };

  return (
    <Popover
      modal={false}
      open={open && !disabled}
      onOpenChange={(next) => {
        if (disabled) {
          return;
        }
        setOpen(next);
      }}
    >
      <PopoverAnchor asChild>
        <div
          ref={boxRef}
          className={cn(
            "relative flex h-11 w-full items-center rounded-lg border border-transparent bg-glass shadow-glow backdrop-blur-md",
            "focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30",
            disabled && "cursor-not-allowed opacity-50",
            className,
          )}
        >
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-0 flex items-center overflow-hidden px-3 pe-9 text-sm",
              dir === "ltr" && "flex-row",
            )}
            dir={dir}
          >
            <span className="invisible whitespace-pre">{query}</span>
            {open && completion?.remainder ? (
              <span className="whitespace-pre text-muted-foreground">{completion.remainder}</span>
            ) : null}
          </div>
          <input
            ref={inputRef}
            id={id}
            type="text"
            role="combobox"
            aria-expanded={open}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={open ? `${listboxId}-opt-${activeIndex}` : undefined}
            aria-label={ariaLabel}
            autoComplete="off"
            disabled={disabled}
            dir={dir}
            inputMode={inputMode}
            placeholder={placeholder}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setHighlighted(0);
              setOpen(true);
              if (event.target.value === "") {
                onChange("");
              }
            }}
            onFocus={() => {
              if (!disabled) {
                setOpen(true);
              }
            }}
            onBlur={commitTypedOrRevert}
            onKeyDown={onKeyDown}
            className={cn(
              "relative z-10 h-full w-full min-w-0 bg-transparent px-3 pe-9 text-sm outline-none",
              "placeholder:text-muted-foreground",
              "disabled:cursor-not-allowed",
              dir === "ltr" && "ltr-nums",
            )}
          />
          <ChevronDownIcon className="pointer-events-none absolute end-3 z-10 size-4 shrink-0 opacity-60" />
        </div>
      </PopoverAnchor>
      <PopoverContent
        align="start"
        onOpenAutoFocus={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => event.preventDefault()}
        onWheel={(event) => event.stopPropagation()}
        className="max-w-none"
        style={boxWidth ? { width: boxWidth } : undefined}
      >
        <ul id={listboxId} role="listbox" className="-m-1 max-h-72 overflow-auto p-1">
          {filtered.length === 0 ? (
            <li className="px-2 py-2 text-sm text-muted-foreground">{emptyText}</li>
          ) : (
            filtered.map((option, index) => {
              const isActive = index === activeIndex;
              const isSelected = option.value === value;
              return (
                <li key={option.value} role="none">
                  <button
                    ref={(node) => {
                      itemRefs.current[index] = node;
                    }}
                    type="button"
                    id={`${listboxId}-opt-${index}`}
                    role="option"
                    aria-selected={isSelected}
                    className={cn(
                      "flex w-full cursor-pointer items-center rounded-md px-2 py-2 text-start text-sm outline-none",
                      isActive && "bg-muted text-foreground",
                      isSelected && !isActive && "text-gold-deep",
                    )}
                    onMouseEnter={() => setHighlighted(index)}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => selectOption(option)}
                  >
                    {option.label}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
