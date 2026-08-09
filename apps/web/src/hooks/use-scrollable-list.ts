"use client"

import * as React from "react"

// Tolerância de subpixel usada pelo SelectScrollArrow nativo do Base UI:
// sem ela, scrollTop fracionário (comum com escala de tela do Windows em
// 125%/150%) faz o cálculo de alvo re-testar sempre a mesma borda e travar
// o auto-scroll no mesmo item.
const SCROLL_EDGE_TOLERANCE_PX = 1

function normalizeScrollOffset(value: number, max: number) {
  if (max <= 0) return 0
  const clamped = Math.min(Math.max(value, 0), max)
  const startDistance = clamped
  const endDistance = max - clamped
  const withinStartTolerance = startDistance <= SCROLL_EDGE_TOLERANCE_PX
  const withinEndTolerance = endDistance <= SCROLL_EDGE_TOLERANCE_PX
  if (withinStartTolerance && withinEndTolerance) {
    return startDistance <= endDistance ? 0 : max
  }
  if (withinStartTolerance) return 0
  if (withinEndTolerance) return max
  return clamped
}

// Espelha o algoritmo do SelectScrollArrow nativo do Base UI para dropdowns
// que não têm a primitiva de scroll arrows (Command, Popover custom): em vez
// de recalcular o alvo re-testando a mesma borda a cada tick (o que trava
// quando scrollTop fica preso num valor fracionário), avança sempre para o
// índice do item adjacente ao primeiro/último item visível, progresso
// garantido a cada chamada.
export function getTargetScrollTop(
  items: HTMLElement[],
  isUp: boolean,
  scrollTop: number,
  clientHeight: number,
  maxScrollTop: number
) {
  if (items.length === 0) {
    return isUp ? 0 : maxScrollTop
  }

  const normalizedScrollTop = normalizeScrollOffset(scrollTop, maxScrollTop)

  if (isUp) {
    let firstVisibleIndex = 0
    const visibleTop = normalizedScrollTop - SCROLL_EDGE_TOLERANCE_PX
    for (let i = 0; i < items.length; i += 1) {
      const item = items[i]
      if (item && item.offsetTop >= visibleTop) {
        firstVisibleIndex = i
        break
      }
    }
    const targetIndex = Math.max(0, firstVisibleIndex - 1)
    const targetItem = items[targetIndex]
    return targetIndex < firstVisibleIndex && targetItem
      ? normalizeScrollOffset(targetItem.offsetTop, maxScrollTop)
      : 0
  }

  let lastVisibleIndex = items.length - 1
  const visibleBottom = normalizedScrollTop + clientHeight + SCROLL_EDGE_TOLERANCE_PX
  for (let i = 0; i < items.length; i += 1) {
    const item = items[i]
    if (item && item.offsetTop + item.offsetHeight > visibleBottom) {
      lastVisibleIndex = Math.max(0, i - 1)
      break
    }
  }
  const targetIndex = Math.min(items.length - 1, lastVisibleIndex + 1)
  const targetItem = items[targetIndex]
  return targetIndex > lastVisibleIndex && targetItem
    ? normalizeScrollOffset(
        targetItem.offsetTop + targetItem.offsetHeight - clientHeight,
        maxScrollTop
      )
    : maxScrollTop
}

export function useScrollableList() {
  const listRef = React.useRef<HTMLElement | null>(null)
  // A lista normalmente vive dentro de um popover/dropdown portalado, montado
  // só quando aberto; um `useRef` puro não dispara re-render nem re-execução
  // de efeito quando `.current` passa de null pro elemento real, então o
  // estado de scroll ficava travado em "sem overflow" até o primeiro scroll
  // manual (que é o único outro lugar que chama updateScrollState). Espelhar
  // o nó em state via ref-callback é o que permite o efeito abaixo reagir ao
  // elemento aparecer, e não só ao componente dono montar.
  const [listNode, setListNode] = React.useState<HTMLElement | null>(null)

  const setListRef = React.useCallback((node: HTMLElement | null) => {
    listRef.current = node
    setListNode(node)
  }, [])

  const [canScrollUp, setCanScrollUp] = React.useState(false)
  const [canScrollDown, setCanScrollDown] = React.useState(false)

  const updateScrollState = React.useCallback(() => {
    const el = listRef.current
    if (!el) return
    setCanScrollUp(el.scrollTop > SCROLL_EDGE_TOLERANCE_PX)
    setCanScrollDown(
      el.scrollTop + el.clientHeight < el.scrollHeight - SCROLL_EDGE_TOLERANCE_PX
    )
  }, [])

  React.useEffect(() => {
    if (!listNode) {
      setCanScrollUp(false)
      setCanScrollDown(false)
      return
    }
    updateScrollState()
    const resizeObserver = new ResizeObserver(updateScrollState)
    resizeObserver.observe(listNode)
    const mutationObserver = new MutationObserver(updateScrollState)
    mutationObserver.observe(listNode, { childList: true, subtree: true })
    // A posição do popover (e a altura disponível que limita a lista) é
    // recalculada de forma assíncrona após a montagem, fora do alcance dos
    // observers acima; sem isso o estado de scroll pode congelar num valor
    // transitório da animação de abertura.
    const timeouts = [50, 150, 300, 600].map((delay) =>
      window.setTimeout(updateScrollState, delay)
    )
    return () => {
      resizeObserver.disconnect()
      mutationObserver.disconnect()
      timeouts.forEach((id) => window.clearTimeout(id))
    }
  }, [listNode, updateScrollState])

  return { listRef, setListRef, canScrollUp, canScrollDown, updateScrollState }
}
