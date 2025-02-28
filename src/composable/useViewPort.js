import { ref, onMounted, onBeforeUnmount } from "vue"
export function useViewPort() {
  const vw = ref(0)
  const vh = ref(0)
  const resizeObserver = new ResizeObserver((entries) => {
    const entry = entries[0]
    const borderBox = entry.borderBoxSize[0]
    vw.value = borderBox.inlineSize
    vh.value = borderBox.blockSize
  })
  onMounted(() => {
    resizeObserver.observe(document.documentElement)
  })
  onBeforeUnmount(() => {
    resizeObserver.unobserve(document.documentElement)
  })

  return { vw, vh }
}
