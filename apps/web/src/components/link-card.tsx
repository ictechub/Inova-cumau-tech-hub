import Link from "next/link";
import type * as React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function LinkCard({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
}) {
  return (
    <Link href={href}>
      <Card className="h-full bg-transparent ring-0 transition-colors">
        <CardHeader>
          <Icon className="size-6 text-primary" aria-hidden />
          <CardTitle className="mt-2">{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">{description}</CardContent>
      </Card>
    </Link>
  );
}
