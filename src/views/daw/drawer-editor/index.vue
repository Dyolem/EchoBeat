<script setup>
import { computed, onMounted, onUnmounted, provide, ref } from "vue"
import Editor from "@/views/daw/editor-template/index.vue"
import { debounce } from "@/utils/debounce.js"

const HEADER_HEIGHT = 100
const FOOTER_HEIGHT = 50
const headerHeight = ref(HEADER_HEIGHT)
const footerHeight = ref(FOOTER_HEIGHT)

const MIN_DRAWER_EDITOR_HEIGHT = 300
const MAX_DRAWER_EDITOR_HEIGHT = 700

const MIN_DRAWER_EDITOR_WIDTH = 300
const MAX_DRAWER_EDITOR_WIDTH = 700

const INIT_DRAWER_EDITOR_HEIGHT = 400
const INIT_DRAWER_EDITOR_WIDTH = 1600

const DRAWER_EDITOR_SIDE_BAR_WIDTH = 200
const INIT_DRAWER_EDITOR_SIDE_BAR_WIDTH = 300
const drawerEditorSideBarWidth = ref(DRAWER_EDITOR_SIDE_BAR_WIDTH)
const initDrawerEditorSideBarWidth = ref(INIT_DRAWER_EDITOR_SIDE_BAR_WIDTH)

const minDrawerEditorHeight = ref(MIN_DRAWER_EDITOR_HEIGHT)
const maxDrawerEditorHeight = ref(MAX_DRAWER_EDITOR_HEIGHT)

const minDrawerEditorWidth = ref(MIN_DRAWER_EDITOR_WIDTH)
const maxDrawerEditorWidth = ref(MAX_DRAWER_EDITOR_WIDTH)

const initDrawerEditorWidth = ref(INIT_DRAWER_EDITOR_WIDTH)
const initDrawerEditorHeight = ref(INIT_DRAWER_EDITOR_HEIGHT)

const props = defineProps({
  canvasContentHeightProp: {
    type: Number,
    default: undefined,
  },
  drawDrawerEditorGridHandler: {
    type: Function,
  },
})
provide("drawGrid", props.drawDrawerEditorGridHandler)

const drawerEditorViewHeight = computed({
  get: () => {
    return initDrawerEditorHeight.value
  },
  set: (val) => {
    initDrawerEditorHeight.value = val
  },
})
const drawerEditorViewWidth = computed({
  get: () => {
    return initDrawerEditorWidth.value
  },
  set: (val) => {
    initDrawerEditorWidth.value = val
  },
})

const widthRange = computed(() => {
  return [minDrawerEditorWidth.value, maxDrawerEditorWidth.value]
})
const heightRange = computed(() => {
  return [minDrawerEditorHeight.value, maxDrawerEditorHeight.value]
})
const controller = new AbortController()
function resizeHandler(event) {
  const assignableWidth = window.innerWidth - DRAWER_EDITOR_SIDE_BAR_WIDTH
  initDrawerEditorWidth.value =
    window.innerWidth - initDrawerEditorSideBarWidth.value
  maxDrawerEditorWidth.value = assignableWidth
  minDrawerEditorWidth.value = Math.min(
    assignableWidth,
    minDrawerEditorWidth.value,
  )
  updateEditorViewWidthHandler(initDrawerEditorWidth.value)

  const assignableHeight =
    window.innerHeight - footerHeight.value - headerHeight.value
  initDrawerEditorHeight.value = Math.min(
    assignableHeight,
    drawerEditorViewHeight.value,
  )
  maxDrawerEditorHeight.value = assignableHeight
  minDrawerEditorHeight.value = Math.min(
    assignableHeight,
    minDrawerEditorHeight.value,
  )
}
const debouncedResizeHandler = debounce(resizeHandler, 200)
window.addEventListener("resize", debouncedResizeHandler, {
  signal: controller.signal,
})
onMounted(() => {
  resizeHandler()
})
function updateEditorViewWidthHandler(newViewWidthVal) {
  drawerEditorSideBarWidth.value = window.innerWidth - newViewWidthVal
  console.log(drawerEditorSideBarWidth.value)
}

onUnmounted(() => {
  controller.abort()
})
</script>

<template>
  <div class="drawer-editor-container" ref="drawerEditorContainerRef">
    <div class="drawer-editor-side-bar">
      <slot
        name="editor-sidebar"
        :editorSidebarWidth="drawerEditorSideBarWidth"
        :editorSidebarHeight="drawerEditorViewHeight"
      ></slot>
    </div>
    <Editor
      v-model:editor-view-height="drawerEditorViewHeight"
      v-model:editor-view-width="drawerEditorViewWidth"
      @update:editor-view-width="updateEditorViewWidthHandler"
      :resizable="true"
      :resize-direction="['n', 's', 'w', 'e', 'nw']"
      :resizable-editor-height-range="heightRange"
      :resizable-editor-width-range="widthRange"
      :canvas-content-height-prop="canvasContentHeightProp"
      :modify-timeline-by-click="false"
    >
      <template
        #default-interactable-layer="{
          interactableLayerWidth,
          interactableLayerHeight,
          editableViewWidth,
          editableViewHeight,
          trackRulerHeight,
          zoomRatio,
        }"
      >
        <slot
          name="custom-editor-layer"
          :interactableLayerWidth="interactableLayerWidth"
          :interactableLayerHeight="interactableLayerHeight"
          :editableViewWidth="editableViewWidth"
          :editableViewHeight="editableViewHeight"
          :trackRulerHeight="trackRulerHeight"
          :zoomRatio="zoomRatio"
        >
        </slot>
      </template>
    </Editor>
  </div>
</template>

<style scoped>
.drawer-editor-container {
  display: flex;
  height: fit-content;
}
.drawer-editor-side-bar {
  width: v-bind(drawerEditorSideBarWidth + "px");
  background-color: gray;
}
</style>
