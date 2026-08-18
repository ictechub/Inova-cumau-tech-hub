"use client";

import { useEffect, useRef, useState } from "react";

import { IconColorPicker, IconPlus, IconX } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Grade de cores predefinidas, mesmo conjunto usado pelo Google Docs no
// seletor de "Cor do texto"/"Cor de destaque": uma linha de cinzas, uma linha
// de cores saturadas e seis linhas de variação de matiz (clara para escura)
// nas mesmas dez colunas.
const COLOR_GRID: string[][] = [
  ["#000000", "#434343", "#666666", "#999999", "#b7b7b7", "#cccccc", "#d9d9d9", "#efefef", "#f3f3f3", "#ffffff"],
  ["#980000", "#ff0000", "#ff9900", "#ffff00", "#00ff00", "#00ffff", "#4a86e8", "#0000ff", "#9900ff", "#ff00ff"],
  ["#e6b8af", "#f4cccc", "#fce5cd", "#fff2cc", "#d9ead3", "#d0e0e3", "#c9daf8", "#cfe2f3", "#d9d2e9", "#ead1dc"],
  ["#dd7e6b", "#ea9999", "#f9cb9c", "#ffe599", "#b6d7a8", "#a2c4c9", "#a4c2f4", "#9fc5e8", "#b4a7d6", "#d5a6bd"],
  ["#cc4125", "#e06666", "#f6b26b", "#ffd966", "#93c47d", "#76a5af", "#6d9eeb", "#6fa8dc", "#8e7cc3", "#c27ba0"],
  ["#a61c00", "#cc0000", "#e69138", "#f1c232", "#6aa84f", "#45818e", "#3c78d8", "#3d85c6", "#674ea7", "#a64d79"],
  ["#85200c", "#990000", "#b45f06", "#bf9000", "#38761d", "#134f5c", "#1155cc", "#0b5394", "#351c75", "#741b47"],
  ["#5b0f00", "#660000", "#783f04", "#7f6000", "#274e13", "#0c343d", "#1c4587", "#073763", "#20124d", "#4c1130"],
];

const MAX_CUSTOM_COLORS = 10;

function storageKeyFor(kind: "text" | "highlight") {
  return `inova-cumau-editor-cores-personalizadas-${kind}`;
}

function loadCustomColors(kind: "text" | "highlight"): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKeyFor(kind));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((color) => typeof color === "string") : [];
  } catch {
    return [];
  }
}

function saveCustomColors(kind: "text" | "highlight", colors: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKeyFor(kind), JSON.stringify(colors));
}

function sameColor(a: string | null, b: string) {
  return !!a && a.toLowerCase() === b.toLowerCase();
}

export function ColorPickerButton({
  kind,
  icon,
  label,
  value,
  onChange,
  onClear,
  clearLabel,
  disabled,
}: {
  kind: "text" | "highlight";
  icon: React.ReactNode;
  label: string;
  value: string | null;
  onChange: (color: string) => void;
  onClear: () => void;
  clearLabel: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [customColors, setCustomColors] = useState<string[]>(() => loadCustomColors(kind));
  const nativeInputRef = useRef<HTMLInputElement>(null);
  const eyedropperSupported = typeof window !== "undefined" && "EyeDropper" in window;

  // O seletor nativo de cor do navegador só deve confirmar a cor quando o
  // usuário fecha o seletor, não a cada arraste dentro dele. O `onChange` do
  // React mapeia para o evento nativo `input` (dispara continuamente durante
  // o arraste), então o listener é registrado direto no evento nativo
  // `change` (dispara só na confirmação) para não aplicar/fechar o popover
  // antes da hora.
  useEffect(() => {
    const inputEl = nativeInputRef.current;
    if (!inputEl) return;
    function handleChange(event: Event) {
      addCustomColor((event.target as HTMLInputElement).value);
    }
    inputEl.addEventListener("change", handleChange);
    return () => inputEl.removeEventListener("change", handleChange);
  });

  function addCustomColor(color: string) {
    setCustomColors((previous) => {
      const next = [color, ...previous.filter((existing) => !sameColor(existing, color))].slice(
        0,
        MAX_CUSTOM_COLORS,
      );
      saveCustomColors(kind, next);
      return next;
    });
    onChange(color);
    setOpen(false);
  }

  async function useEyedropper() {
    if (!eyedropperSupported) return;
    try {
      const EyeDropperCtor = (window as unknown as { EyeDropper: new () => { open: () => Promise<{ sRGBHex: string }> } }).EyeDropper;
      const eyeDropper = new EyeDropperCtor();
      const result = await eyeDropper.open();
      if (result?.sRGBHex) addCustomColor(result.sRGBHex);
    } catch {
      // Usuário cancelou a seleção com o conta-gotas, nada a fazer.
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger
          render={
            <PopoverTrigger
              disabled={disabled}
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  aria-label={label}
                  className={value ? "bg-secondary text-secondary-foreground" : undefined}
                />
              }
            />
          }
        >
          <span className="flex flex-col items-center gap-0.5">
            {icon}
            <span
              aria-hidden
              className={cn("h-[3px] w-4 rounded-full", !value && "bg-muted-foreground/30")}
              style={value ? { backgroundColor: value } : undefined}
            />
          </span>
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
      <PopoverContent className="w-auto" align="start">
        <div className="flex flex-col gap-2">
          <button
            type="button"
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
            onClick={() => {
              onClear();
              setOpen(false);
            }}
          >
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-border">
              <IconX className="size-3 text-muted-foreground" />
            </span>
            {clearLabel}
          </button>
          <div className="grid grid-cols-10 gap-1">
            {COLOR_GRID.flat().map((color) => (
              <button
                key={color}
                type="button"
                title={color}
                aria-label={color}
                className={cn(
                  "size-5 rounded-full border border-black/10 transition-transform hover:scale-110",
                  sameColor(value, color) && "ring-2 ring-primary ring-offset-1 ring-offset-popover",
                )}
                style={{ backgroundColor: color }}
                onClick={() => {
                  onChange(color);
                  setOpen(false);
                }}
              />
            ))}
          </div>
          <div className="flex flex-col gap-1.5 border-t border-border pt-2">
            <span className="text-xs font-medium text-muted-foreground">Cores personalizadas</span>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                aria-label="Adicionar cor personalizada"
                className="flex size-5 shrink-0 items-center justify-center rounded-full border border-dashed border-muted-foreground text-muted-foreground hover:border-foreground hover:text-foreground"
                onClick={() => nativeInputRef.current?.click()}
              >
                <IconPlus className="size-3" />
              </button>
              {eyedropperSupported ? (
                <button
                  type="button"
                  aria-label="Selecionar cor da tela com conta-gotas"
                  className="flex size-5 shrink-0 items-center justify-center rounded-full border border-muted-foreground text-muted-foreground hover:border-foreground hover:text-foreground"
                  onClick={useEyedropper}
                >
                  <IconColorPicker className="size-3" />
                </button>
              ) : null}
              <input ref={nativeInputRef} type="color" className="sr-only" />
              {customColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  title={color}
                  aria-label={color}
                  className={cn(
                    "size-5 shrink-0 rounded-full border border-black/10 transition-transform hover:scale-110",
                    sameColor(value, color) && "ring-2 ring-primary ring-offset-1 ring-offset-popover",
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    onChange(color);
                    setOpen(false);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
