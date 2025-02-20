// mouse.js
import { ref, onMounted, onUnmounted } from "vue"

export function useMouse({ type = "client", global = document }) {
  const x = ref(0)
  const y = ref(0)

  const mouseTypeMap = new Map([
    [
      "page",
      (event) => {
        x.value = event.pageX
        y.value = event.pageY
      },
    ],
    [
      "client",
      (event) => {
        x.value = event.clientX
        y.value = event.clientY
      },
    ],
  ])
  function update(event) {
    mouseTypeMap.get(type)?.(event)
  }

  onMounted(() => global.addEventListener("mousemove", update))
  onUnmounted(() => global.removeEventListener("mousemove", update))

  return { x, y }
}
