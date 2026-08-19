"use client";

import { useState } from "react";

import { pt } from "chrono-node";
import { IconCalendar } from "@tabler/icons-react";
import { ptBR } from "react-day-picker/locale";

import { Calendar } from "@/components/ui/calendar";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

function parseDataIso(iso: string): Date | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return undefined;
  const [, ano, mes, dia] = match;
  return new Date(Number(ano), Number(mes) - 1, Number(dia));
}

function formatarDataIso(date: Date | undefined): string {
  if (!date) return "";
  const ano = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, "0");
  const dia = String(date.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function formatarDataExibicao(date: Date | undefined): string {
  if (!date) return "";
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

// Campo de data em linguagem natural, no estilo shadcn: o texto digitado é
// interpretado por chrono-node (locale pt) e convertido para a data ISO que
// o form envia via input hidden; o calendário faz a mesma conversão inversa.
export function TaskDatePicker({
  name,
  value,
  onChange,
  disabled,
  ariaInvalid,
  placeholder,
}: {
  name: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  ariaInvalid?: boolean;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const [texto, setTexto] = useState(() => formatarDataExibicao(parseDataIso(value)));
  const date = parseDataIso(value);

  return (
    <InputGroup>
      <input type="hidden" name={name} value={value} />
      <InputGroupInput
        value={texto}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={ariaInvalid}
        onChange={(event) => {
          const novoTexto = event.target.value;
          setTexto(novoTexto);
          if (!novoTexto.trim()) {
            onChange("");
            return;
          }
          const dataEncontrada = pt.casual.parseDate(novoTexto);
          if (dataEncontrada) onChange(formatarDataIso(dataEncontrada));
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
          }
        }}
      />
      <InputGroupAddon align="inline-end">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            render={
              <InputGroupButton
                type="button"
                variant="ghost"
                size="icon-xs"
                disabled={disabled}
                aria-label="Selecionar data"
              >
                <IconCalendar />
                <span className="sr-only">Selecionar data</span>
              </InputGroupButton>
            }
          />
          <PopoverContent className="w-auto overflow-hidden p-0" align="end" sideOffset={8}>
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              defaultMonth={date}
              locale={ptBR}
              onSelect={(novaData) => {
                onChange(formatarDataIso(novaData));
                setTexto(formatarDataExibicao(novaData));
                setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
      </InputGroupAddon>
    </InputGroup>
  );
}
