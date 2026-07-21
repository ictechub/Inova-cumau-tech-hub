import type * as React from "react";

import { Badge } from "@/components/ui/badge";

export function PagePlaceholder({
  icon: Icon,
  eyebrow,
  title,
  description,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-4 py-24 text-center sm:px-6">
      <Icon className="size-10 text-primary" aria-hidden />
      <div>
        <p className="text-xs font-bold tracking-widest text-rio-700 uppercase">
          {eyebrow}
        </p>
        <h1 className="mt-3 font-serif text-3xl font-medium sm:text-4xl">{title}</h1>
        <p className="mt-4 text-muted-foreground">{description}</p>
      </div>
      <Badge variant="secondary">Em construção</Badge>
    </section>
  );
}
