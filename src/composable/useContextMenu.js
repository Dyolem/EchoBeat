import { onMounted, onUnmounted, ref } from "vue"

export function useContextMenu(containerRef) {
  const showMenu = ref(false)
  const x = ref(0)
  const y = ref(0)
  const controller = new AbortController()
  function handleContextMenu(event) {
    event.preventDefault()
    event.stopPropagation()
    x.value = event.clientX
    y.value = event.clientY
    showMenu.value = true
  }
  function closeMenu() {
    const timer = setTimeout(() => {
      showMenu.value = false
      clearTimeout(timer)
    }, 100)
  }
  onMounted(() => {
    const div = containerRef.value
    div.addEventListener("contextmenu", handleContextMenu, {
      signal: controller.signal,
    })
    window.addEventListener(
      "contextmenu",
      () => {
        showMenu.value = false
      },
      {
        signal: controller.signal,
        capture: true,
      },
    )
    window.addEventListener("click", closeMenu, {
      signal: controller.signal,
      capture: true,
    })
  })
  onUnmounted(() => {
    controller.abort()
  })
  return {
    x,
    y,
    showMenu,
  }
}
