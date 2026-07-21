export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 pt-16 pb-4 text-center sm:px-6">
      <p className="text-xs font-bold tracking-widest text-rio-700 uppercase">
        {eyebrow}
      </p>
      <h1 className="mt-3 font-serif text-3xl font-medium sm:text-4xl">{title}</h1>
      {description ? <p className="mt-4 text-muted-foreground">{description}</p> : null}
    </div>
  );
}
