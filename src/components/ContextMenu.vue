<template>
  <div class="context-menu" ref="contextMenuRef">
    <slot>
      <h1>hello</h1>
    </slot>
    <Teleport to="body">
      <div
        class="menu-container beatified-scrollbar"
        ref="menuContainerRef"
        v-if="visible"
      >
        <slot name="context-menu"></slot>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { nextTick, onMounted, onUnmounted, ref, useTemplateRef } from "vue"
import { useMouse } from "@/composable/useMouse.js"
const { x: mouseX, y: mouseY } = useMouse("client")
const contextMenuRef = useTemplateRef("contextMenuRef")
const menuContainerRef = useTemplateRef("menuContainerRef")
const visible = ref(false)
const props = defineProps()
const controller = new AbortController()
function contextMenuHandler(event) {
  event.preventDefault()
  visible.value = true
  nextTick(() => {
    let left = mouseX.value
    let top = mouseY.value
    const menuContainerWidth =
      menuContainerRef.value.getBoundingClientRect().width
    const menuContainerHeight =
      menuContainerRef.value.getBoundingClientRect().height
    if (menuContainerWidth + left > window.innerWidth) {
      left = window.innerWidth - menuContainerWidth
    }
    if (menuContainerHeight + top > window.innerHeight) {
      top = window.innerHeight - menuContainerHeight
    }
    menuContainerRef.value.style.left = left + "px"
    menuContainerRef.value.style.top = top + "px"
    menuContainerRef.value.addEventListener(
      "click",
      (event) => {
        event.stopPropagation()
      },
      {
        signal: controller.signal,
      },
    )
  })
}

window.addEventListener(
  "click",
  (event) => {
    visible.value = false
  },
  {
    signal: controller.signal,
  },
)
onMounted(() => {
  console.log(contextMenuRef.value)
  contextMenuRef.value.addEventListener("contextmenu", contextMenuHandler, {
    signal: controller.signal,
  })
})
onUnmounted(() => {
  controller.abort()
})
</script>

<style scoped>
@import "src/styles/scrollbar.css";
.menu-container {
  position: absolute;
  max-width: 250px;
  max-height: 600px;
  overflow: scroll;
  z-index: 1000;
}
</style>
