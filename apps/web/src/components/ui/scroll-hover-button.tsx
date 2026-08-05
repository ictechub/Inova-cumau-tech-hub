"use client"

import * as React from "react"
import { ChevronUpIcon, ChevronDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { getTargetScrollTop } from "@/hooks/use-scrollable-list"

export function ScrollHoverButton({
  direction,
  listRef,
  itemSelector = ":scope > *",
  className,
}: {
  direction: "up" | "down"
  listRef: React.RefObject<HTMLElement | null>
  itemSelector?: string
  className?: string
}) {
  const timeoutRef = React.useRef<number | null>(null)

  const stop = React.useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const start = React.useCallback(() => {
    if (timeoutRef.current !== null) return
    const loop = () => {
      const el = listRef.current
      if (!el) return
      const items = Array.from(el.querySelectorAll<HTMLElement>(itemSelector))
      const maxScrollTop = Math.max(0, el.scrollHeight - el.clientHeight)
      const target = getTargetScrollTop(
        items,
        direction === "up",
        el.scrollTop,
        el.clientHeight,
        maxScrollTop
      )
      el.scrollTop = target
      timeoutRef.current = window.setTimeout(loop, 40)
    }
    loop()
  }, [direction, listRef, itemSelector])

  React.useEffect(() => stop, [stop])

  const Icon = direction === "up" ? ChevronUpIcon : ChevronDownIcon

  return (
    <div
      aria-hidden
      onMouseEnter={start}
      onMouseMove={start}
      onMouseLeave={stop}
      className={cn(
        "absolute inset-x-0 z-10 flex h-5 cursor-default items-center justify-center bg-popover",
        direction === "up" ? "top-0 rounded-t-lg" : "bottom-0 rounded-b-lg",
        className
      )}
    >
      <Icon className="size-4 text-muted-foreground" />
    </div>
  )
}
