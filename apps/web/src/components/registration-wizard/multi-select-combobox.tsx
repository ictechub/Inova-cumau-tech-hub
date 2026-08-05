"use client";

import { useMemo, useState } from "react";
import { CheckIcon, ChevronDownIcon, SearchIcon, XIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollHoverButton } from "@/components/ui/scroll-hover-button";
import { useScrollableList } from "@/hooks/use-scrollable-list";
import { cn } from "@/lib/utils";

export type MultiSelectOption = { value: string; label: string };

// A partir de 3 selecionadas, a 3ª posição vira a badge "+N" em vez de um item real.
const MAX_VISIBLE_ITEMS = 2;

export function MultiSelectCombobox({
  options,
  value,
  onChange,
  placeholder = "Selecione",
  searchPlaceholder = "Buscar...",
  emptyMessage = "Nenhum resultado encontrado.",
}: {
  options: readonly MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
}) {
  const [query, setQuery] = useState("");
  const { listRef, setListRef, canScrollUp, canScrollDown, updateScrollState } =
    useScrollableList();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(q) ||
        option.value.toLowerCase().includes(q),
    );
  }, [query, options]);

  const selected = options.filter((option) => value.includes(option.value));
  const isOverflowing = selected.length > MAX_VISIBLE_ITEMS;
  const visible = isOverflowing ? selected.slice(0, MAX_VISIBLE_ITEMS) : selected;
  const hiddenCount = selected.length - visible.length;

  function toggle(optionValue: string) {
    onChange(
      value.includes(optionValue)
        ? value.filter((v) => v !== optionValue)
        : [...value, optionValue],
    );
  }

  function remove(optionValue: string) {
    onChange(value.filter((v) => v !== optionValue));
  }

  return (
    <Popover onOpenChange={(open) => !open && setQuery("")}>
      <PopoverTrigger
        className={cn(
          "flex min-h-8 w-full flex-nowrap items-center gap-1.5 overflow-hidden rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30",
        )}
      >
        {selected.length === 0 ? (
          <span className="text-placeholder-foreground">{placeholder}</span>
        ) : (
          <>
            {visible.map((option) => (
              <Badge
                key={option.value}
                variant="secondary"
                className="shrink-0 gap-1 pr-1"
              >
                {option.label}
                <span
                  role="button"
                  tabIndex={-1}
                  aria-label={`Remover ${option.label}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    remove(option.value);
                  }}
                  className="rounded-full p-0.5 hover:bg-foreground/10"
                >
                  <XIcon className="size-3" />
                </span>
              </Badge>
            ))}
            {hiddenCount > 0 && (
              <Badge variant="secondary" className="shrink-0">
                +{hiddenCount}
              </Badge>
            )}
          </>
        )}
        <ChevronDownIcon className="ml-auto size-4 shrink-0 text-muted-foreground" />
      </PopoverTrigger>

      <PopoverContent
        align="start"
        data-slot="combobox-content"
        className="w-(--anchor-width) min-w-64 gap-0 p-0"
      >
        <InputGroup className="rounded-none rounded-t-lg border-0 border-b border-border px-1 has-[[data-slot=input-group-control]:focus-visible]:border-border has-[[data-slot=input-group-control]:focus-visible]:ring-0">
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            autoFocus
            placeholder={searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </InputGroup>
        <div className="relative">
          {canScrollUp && <ScrollHoverButton direction="up" listRef={listRef} />}
          <div
            ref={setListRef}
            onScroll={updateScrollState}
            className="no-scrollbar max-h-60 overflow-y-auto p-1"
          >
            {filtered.length === 0 ? (
              <p className="px-2 py-4 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </p>
            ) : (
              filtered.map((option) => {
                const checked = value.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggle(option.value)}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                  >
                    <span
                      className={cn(
                        "flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input",
                        checked && "border-primary bg-primary text-primary-foreground",
                      )}
                    >
                      {checked && <CheckIcon className="size-3.5" />}
                    </span>
                    {option.label}
                  </button>
                );
              })
            )}
          </div>
          {canScrollDown && (
            <ScrollHoverButton direction="down" listRef={listRef} />
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
