<script setup>
import { debounce } from "@/utils/debounce.js"
import EditorHeader from "@/views/daw/header/index.vue"
import Editor from "@/views/daw/editor-template/index.vue"
import {
  computed,
  onMounted,
  onUnmounted,
  ref,
  useTemplateRef,
  watchEffect,
} from "vue"
const HEADER_HEIGHT = 100
const FOOTER_HEIGHT = 50
const headerHeight = ref(HEADER_HEIGHT)
const footerHeight = ref(FOOTER_HEIGHT)
const MIN_DRAWER_EDITOR_HEIGHT = 300
const MAX_DRAWER_EDITOR_HEIGHT = 700
const INIT_DRAWER_EDITOR_HEIGHT = 400

const controller = new AbortController()
const exceptEditorHeight = computed(() => {
  return headerHeight.value + footerHeight.value
})

const mainEditorHeight = ref(window.innerHeight - exceptEditorHeight.value)
watchEffect(() => {
  mainEditorHeight.value = window.innerHeight - exceptEditorHeight.value
})
const minDrawerEditorHeight = ref(MIN_DRAWER_EDITOR_HEIGHT)
const maxDrawerEditorHeight = ref(MAX_DRAWER_EDITOR_HEIGHT)
const drawerEditorHeight = ref(INIT_DRAWER_EDITOR_HEIGHT)

function resizeHandler(event) {
  const maxEditorHeight =
    window.innerHeight - headerHeight.value - footerHeight.value
  mainEditorHeight.value = maxEditorHeight
  console.log(maxEditorHeight, MAX_DRAWER_EDITOR_HEIGHT)

  maxDrawerEditorHeight.value = Math.min(
    maxEditorHeight,
    MAX_DRAWER_EDITOR_HEIGHT,
  )
  minDrawerEditorHeight.value = Math.min(
    maxDrawerEditorHeight.value,
    minDrawerEditorHeight.value,
  )
}
const debouncedResizeHandler = debounce(resizeHandler, 200)
window.addEventListener("resize", debouncedResizeHandler, {
  signal: controller.signal,
})

const isOpenDrawerEditor = ref(false)
const drawerEditorContainerRef = useTemplateRef("drawerEditorContainerRef")
onMounted(() => {
  resizeHandler()
  const box = drawerEditorContainerRef.value

  // 鼠标触发区域的边缘宽度
  const edgeWidth = 10

  // 状态跟踪
  let isResizing = false
  let resizeDirection = ""
  let startX, startY, startWidth, startHeight

  // 根据鼠标位置设置光标样式
  box.addEventListener(
    "mousemove",
    (e) => {
      if (isResizing) return // 如果正在拖动，跳过

      const rect = box.getBoundingClientRect()
      const offsetX = e.clientX - rect.left
      const offsetY = e.clientY - rect.top

      if (offsetX < edgeWidth && offsetY < edgeWidth) {
        // 左上角
        box.style.cursor = "nwse-resize"
        resizeDirection = "nw"
      } else if (offsetX > rect.width - edgeWidth && offsetY < edgeWidth) {
        // 右上角
        box.style.cursor = "nesw-resize"
        resizeDirection = "ne"
      } else if (offsetX < edgeWidth && offsetY > rect.height - edgeWidth) {
        // 左下角
        box.style.cursor = "nesw-resize"
        resizeDirection = "sw"
      } else if (
        offsetX > rect.width - edgeWidth &&
        offsetY > rect.height - edgeWidth
      ) {
        // 右下角
        box.style.cursor = "nwse-resize"
        resizeDirection = "se"
      } else if (offsetX < edgeWidth) {
        // 左边
        box.style.cursor = "ew-resize"
        resizeDirection = "w"
      } else if (offsetX > rect.width - edgeWidth) {
        // 右边
        box.style.cursor = "ew-resize"
        resizeDirection = "e"
      } else if (offsetY < edgeWidth) {
        // 上边
        box.style.cursor = "ns-resize"
        resizeDirection = "n"
      } else if (offsetY > rect.height - edgeWidth) {
        // 下边
        box.style.cursor = "ns-resize"
        resizeDirection = "s"
      } else {
        // 默认
        box.style.cursor = "default"
        resizeDirection = ""
      }
    },
    { signal: controller.signal },
  )

  // 开始拖动
  box.addEventListener(
    "mousedown",
    (e) => {
      if (!resizeDirection) return

      isResizing = true
      startX = e.clientX
      startY = e.clientY
      startWidth = box.clientWidth
      startHeight = box.getBoundingClientRect().height

      document.body.style.cursor = box.style.cursor // 设置全局光标样式
    },
    { signal: controller.signal },
  )

  // 拖动调整尺寸
  document.addEventListener(
    "mousemove",
    (e) => {
      if (!isResizing) return

      const dx = e.clientX - startX
      const dy = e.clientY - startY

      // if (resizeDirection.includes("e")) {
      //   box.style.width = `${startWidth + dx}px`
      // }
      // if (resizeDirection.includes("s")) {
      //   box.style.height = `${startHeight + dy}px`
      // }
      // if (resizeDirection.includes("w")) {
      //   box.style.width = `${startWidth - dx}px`
      //   box.style.left = `${box.offsetLeft + dx}px`
      // }
      if (resizeDirection.includes("n")) {
        let height = startHeight - dy
        height = Math.max(
          Math.min(height, maxDrawerEditorHeight.value),
          minDrawerEditorHeight.value,
        )
        // box.style.height = `${height}px`
        drawerEditorHeight.value = height
        // box.style.top = `${box.offsetTop + dy}px`
      }
    },
    { signal: controller.signal },
  )

  // 停止拖动
  document.addEventListener(
    "mouseup",
    () => {
      isResizing = false
      resizeDirection = ""
      document.body.style.cursor = "default"
    },
    { signal: controller.signal },
  )
})
onUnmounted(() => {
  controller.abort()
})
</script>

<template>
  <div id="main">
    <header>
      <EditorHeader />
    </header>

    <main class="editor-main">
      <Editor :editor-view-height="mainEditorHeight" />
    </main>
    <footer class="footer">
      <div class="drawer-editor-container" ref="drawerEditorContainerRef">
        <button @click="isOpenDrawerEditor = !isOpenDrawerEditor">
          instrument
        </button>
        <Editor
          v-if="isOpenDrawerEditor"
          :editor-view-height="drawerEditorHeight"
        ></Editor>
      </div>
    </footer>
  </div>
</template>

<style scoped>
#main {
  --header-height: 100px;
  --footer-height: 50px;
  --content-height: calc(100vh - var(--header-height) - var(--footer-height));
}
.editor-main {
  position: relative;
  width: 100vw;
  height: v-bind(mainEditorHeight + "px");
  background-color: #9a6e3a;
}

.footer {
  position: relative;
  width: 100vw;
  height: v-bind(footerHeight + "px");
  background-color: lightpink;
}
.drawer-editor-container {
  position: absolute;
  height: fit-content;
  transform: translateY(-100%);
  z-index: 100;
}
</style>
