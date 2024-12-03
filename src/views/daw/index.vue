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
const INIT_DRAWER_EDITOR_WIDTH = 1600
const editorSideBarWidth = ref(300)
const drawerEditorSideBarWidth = ref(300)

const controller = new AbortController()
const exceptEditorHeight = computed(() => {
  return headerHeight.value + footerHeight.value
})

const mainEditorViewWidth = ref(window.innerWidth - editorSideBarWidth.value)
const mainEditorViewHeight = ref(window.innerHeight - exceptEditorHeight.value)
watchEffect(() => {
  mainEditorViewHeight.value = window.innerHeight - exceptEditorHeight.value
})

const minDrawerEditorHeight = ref(MIN_DRAWER_EDITOR_HEIGHT)
const maxDrawerEditorHeight = ref(MAX_DRAWER_EDITOR_HEIGHT)
const drawerEditorViewHeight = ref(INIT_DRAWER_EDITOR_HEIGHT)
const drawerEditorViewWidth = ref(INIT_DRAWER_EDITOR_WIDTH)

function resizeHandler(event) {
  const maxEditorHeight =
    window.innerHeight - headerHeight.value - footerHeight.value
  mainEditorViewHeight.value = maxEditorHeight
  maxDrawerEditorHeight.value = Math.min(
    maxEditorHeight,
    MAX_DRAWER_EDITOR_HEIGHT,
  )
  minDrawerEditorHeight.value = Math.min(
    maxDrawerEditorHeight.value,
    minDrawerEditorHeight.value,
  )

  const maxEditorWidth = window.innerWidth - editorSideBarWidth.value

  mainEditorViewWidth.value = window.innerWidth - editorSideBarWidth.value
  drawerEditorViewWidth.value =
    window.innerWidth - drawerEditorSideBarWidth.value
  console.log(drawerEditorViewWidth.value)
}
const debouncedResizeHandler = debounce(resizeHandler, 200)
window.addEventListener("resize", debouncedResizeHandler, {
  signal: controller.signal,
})

const isOpenDrawerEditor = ref(false)
const drawerEditorContainerRef = useTemplateRef("drawerEditorContainerRef")
function updateEditorViewWidthHandler(newViewWidthVal) {
  drawerEditorSideBarWidth.value = window.innerWidth - newViewWidthVal
  console.log(drawerEditorSideBarWidth.value)
}
onMounted(() => {
  resizeHandler()
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
      <div class="editor-side-bar"></div>
      <Editor
        :editor-view-height="mainEditorViewHeight"
        :editor-view-width="mainEditorViewWidth"
      />
    </main>
    <footer class="footer">
      <button @click="isOpenDrawerEditor = !isOpenDrawerEditor">
        instrument
      </button>
      <div class="drawer-editor-container" ref="drawerEditorContainerRef">
        <div class="drawer-editor-side-bar"></div>
        <Editor
          v-if="isOpenDrawerEditor"
          v-model:editor-view-height="drawerEditorViewHeight"
          v-model:editor-view-width="drawerEditorViewWidth"
          @update:editor-view-width="updateEditorViewWidthHandler"
          :resizable="true"
          :resize-direction="['n', 's', 'w']"
          :resizable-editor-height-range="[100, 500]"
          :resizable-editor-width-range="[300, 1000]"
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
  display: flex;
  height: v-bind(mainEditorHeight + "px");
  background-color: #9a6e3a;
}
.editor-side-bar {
  flex-grow: 1;
  flex-basis: 100px;
  flex-shrink: 0;
  height: 100%;
  background-color: gray;
}
.drawer-editor-side-bar {
  min-width: 100px;
  width: v-bind(drawerEditorSideBarWidth + "px");
  background-color: gray;
}
.footer {
  position: relative;
  width: 100vw;
  height: v-bind(footerHeight + "px");
  background-color: lightpink;
}
.drawer-editor-container {
  position: absolute;
  display: flex;
  height: fit-content;
  transform: translateY(-100%);
  z-index: 100;
}
</style>
