"use client";

import { useEffect, useState, useTransition } from "react";
import { IconChevronDown } from "@tabler/icons-react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { listMunicipiosByUf } from "@/lib/ibge-actions";

export function CityCombobox({
  id,
  uf,
  value,
  onValueChange,
  disabled,
}: {
  id?: string;
  uf: string;
  value: string;
  onValueChange: (city: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [cities, setCities] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (uf.trim().length !== 2) {
      setCities([]);
      return;
    }

    startTransition(async () => {
      const result = await listMunicipiosByUf(uf);
      setCities(result);
    });
  }, [uf]);

  const isDisabled = disabled || uf.trim().length !== 2;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        id={id}
        disabled={isDisabled}
        className={cn(
          "flex h-8 w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-left text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30 dark:hover:bg-input/50",
          !value && "text-placeholder-foreground",
        )}
      >
        <span className="line-clamp-1">
          {value || (uf.trim().length !== 2 ? "Selecione o estado antes" : "Selecione a cidade")}
        </span>
        <IconChevronDown className="size-4 shrink-0 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent className="w-(--anchor-width) p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar cidade..." />
          <CommandList>
            <CommandEmpty>
              {isPending ? "Carregando cidades..." : "Nenhuma cidade encontrada."}
            </CommandEmpty>
            <CommandGroup>
              {cities.map((city) => (
                <CommandItem
                  key={city}
                  value={city}
                  data-checked={value === city}
                  onSelect={() => {
                    onValueChange(city);
                    setOpen(false);
                  }}
                >
                  {city}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
