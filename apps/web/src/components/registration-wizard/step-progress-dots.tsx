import { cn } from "@/lib/utils";

export function StepProgressDots({
  total,
  currentIndex,
}: {
  total: number;
  currentIndex: number;
}) {
  return (
    <div className="flex items-center justify-center gap-1.5" role="presentation">
      {Array.from({ length: total }).map((_, index) => (
        <span
          key={index}
          className={cn(
            "h-1.5 rounded-full transition-all",
            index === currentIndex
              ? "w-5 bg-primary"
              : "w-1.5 bg-border",
          )}
        />
      ))}
    </div>
  );
}
