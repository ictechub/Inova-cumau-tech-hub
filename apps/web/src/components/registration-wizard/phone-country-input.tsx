"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDownIcon, SearchIcon } from "lucide-react";
import * as Flags from "country-flag-icons/react/3x2";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { ScrollHoverButton } from "@/components/ui/scroll-hover-button";
import { useScrollableList } from "@/hooks/use-scrollable-list";
import { formatPhone } from "@/lib/masks";
import {
  PHONE_COUNTRIES,
  parsePhoneValue,
  type PhoneCountry,
} from "@/lib/phone-countries";

function CountryFlag({ iso2, className }: { iso2: string; className?: string }) {
  const Flag = Flags[iso2 as keyof typeof Flags];
  return <Flag className={className} />;
}

export function PhoneCountryInput({
  id,
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
}) {
  const { country, number } = parsePhoneValue(value);
  const groupRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { listRef, setListRef, canScrollUp, canScrollDown, updateScrollState } =
    useScrollableList();

  useEffect(() => {
    if (!open) return;
    const timeout = setTimeout(() => searchRef.current?.focus(), 0);
    return () => clearTimeout(timeout);
  }, [open]);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) setQuery("");
  }

  const filteredCountries = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PHONE_COUNTRIES;
    return PHONE_COUNTRIES.filter(
      (item) =>
        item.name.toLowerCase().includes(q) || item.dialCode.includes(q),
    );
  }, [query]);

  function handleCountrySelect(next: PhoneCountry) {
    onChange(`${next.dialCode} ${number}`.trim());
    setOpen(false);
  }

  function handleNumberChange(raw: string) {
    onChange(`${country.dialCode} ${formatPhone(raw)}`.trim());
  }

  return (
    <InputGroup ref={groupRef}>
      <InputGroupAddon>
        <DropdownMenu open={open} onOpenChange={handleOpenChange}>
          <DropdownMenuTrigger
            render={
              <InputGroupButton
                type="button"
                variant="ghost"
                aria-label={`País selecionado: ${country.name}`}
                className="gap-1"
              />
            }
          >
            <CountryFlag iso2={country.iso2} className="h-3 w-4 shrink-0 rounded-xs" />
            <span>{country.dialCode}</span>
            <ChevronDownIcon className="size-3 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            anchor={groupRef}
            data-slot="combobox-content"
            className="max-h-80 w-64 gap-0 p-0"
          >
            <InputGroup className="rounded-none rounded-t-lg border-0 border-b border-border px-1 has-[[data-slot=input-group-control]:focus-visible]:border-border has-[[data-slot=input-group-control]:focus-visible]:ring-0">
              <InputGroupAddon>
                <SearchIcon />
              </InputGroupAddon>
              <InputGroupInput
                ref={searchRef}
                placeholder="Buscar país ou código..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key !== "Escape") e.stopPropagation();
                }}
              />
            </InputGroup>
            <div className="relative">
              {canScrollUp && (
                <ScrollHoverButton direction="up" listRef={listRef} />
              )}
              <div
                ref={setListRef}
                onScroll={updateScrollState}
                className="no-scrollbar max-h-64 overflow-y-auto p-1"
                onFocus={() => searchRef.current?.focus()}
              >
                {filteredCountries.length === 0 ? (
                  <p className="px-2 py-4 text-center text-sm text-muted-foreground">
                    Nenhum país encontrado.
                  </p>
                ) : (
                  filteredCountries.map((item) => (
                    <DropdownMenuItem
                      key={item.iso2}
                      onClick={() => handleCountrySelect(item)}
                    >
                      <CountryFlag iso2={item.iso2} className="h-3 w-4 shrink-0 rounded-xs" />
                      <span className="flex-1 truncate">{item.name}</span>
                      <span className="text-muted-foreground">{item.dialCode}</span>
                    </DropdownMenuItem>
                  ))
                )}
              </div>
              {canScrollDown && (
                <ScrollHoverButton direction="down" listRef={listRef} />
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </InputGroupAddon>
      <InputGroupInput
        id={id}
        type="tel"
        inputMode="numeric"
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={number}
        onChange={(e) => handleNumberChange(e.target.value)}
      />
    </InputGroup>
  );
}
