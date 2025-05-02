<script setup>
import {
  computed,
  onMounted,
  onUnmounted,
  ref,
  useTemplateRef,
  provide,
  toRef,
} from "vue"
import { storeToRefs } from "pinia"
import Editor from "@/views/daw/editor-template/index.vue"
import { debounce } from "@/utils/debounce.js"
import {
  EDITOR_MODE_ENUM,
  INIT_FOOTER_HEIGHT,
  INIT_HEADER_HEIGHT,
} from "@/constants/daw/index.js"
import { useZoomRatioStore } from "@/store/daw/zoomRatio.js"

const headerHeight = ref(INIT_HEADER_HEIGHT)
const footerHeight = ref(INIT_FOOTER_HEIGHT)

const MIN_DRAWER_EDITOR_HEIGHT = 300
const MAX_DRAWER_EDITOR_HEIGHT = 700

const MIN_DRAWER_EDITOR_WIDTH = 300
const MAX_DRAWER_EDITOR_WIDTH = 700

const INIT_DRAWER_EDITOR_HEIGHT = 400
const INIT_DRAWER_EDITOR_WIDTH = 1600

const DRAWER_EDITOR_SIDE_BAR_WIDTH = 200
const INIT_DRAWER_EDITOR_SIDE_BAR_WIDTH = 380
const drawerEditorSideBarWidth = ref(DRAWER_EDITOR_SIDE_BAR_WIDTH)
const initDrawerEditorSideBarWidth = ref(INIT_DRAWER_EDITOR_SIDE_BAR_WIDTH)

const minDrawerEditorHeight = ref(MIN_DRAWER_EDITOR_HEIGHT)
const maxDrawerEditorHeight = ref(MAX_DRAWER_EDITOR_HEIGHT)

const minDrawerEditorWidth = ref(MIN_DRAWER_EDITOR_WIDTH)
const maxDrawerEditorWidth = ref(MAX_DRAWER_EDITOR_WIDTH)

const initDrawerEditorWidth = ref(INIT_DRAWER_EDITOR_WIDTH)
const initDrawerEditorHeight = ref(INIT_DRAWER_EDITOR_HEIGHT)

const drawerEditorContainerRef = useTemplateRef("drawerEditorContainerRef")
const zoomRatioStore = useZoomRatioStore()
const { updateEditMode } = zoomRatioStore
const { editorMode } = storeToRefs(zoomRatioStore)
const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  visible: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(["update:visible"])
function changeDrawerVisibility(visible) {
  if (typeof visible !== "boolean") return
  emit("update:visible", visible)
}
provide("drawerVisibility", {
  visible: toRef(props, "visible"),
  changeDrawerVisibility,
})

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

const keyBoardController = new AbortController()
onMounted(() => {
  drawerEditorContainerRef.value.addEventListener(
    "keydown",
    (e) => {
      const initEditMode = editorMode.value
      if (e.key === "Control") {
        if (initEditMode === EDITOR_MODE_ENUM.SELECT)
          updateEditMode(EDITOR_MODE_ENUM.INSERT)
      }
      const keyupController = new AbortController()
      drawerEditorContainerRef.value.addEventListener(
        "keyup",
        (e) => {
          if (e.key === "Control") {
            if (initEditMode === EDITOR_MODE_ENUM.SELECT) {
              updateEditMode(initEditMode)
            }
            keyupController.abort()
          }
        },
        { signal: keyupController.signal },
      )
    },
    { signal: keyBoardController.signal },
  )

  resizeHandler()
})
function updateEditorViewWidthHandler(newViewWidthVal) {
  drawerEditorSideBarWidth.value = window.innerWidth - newViewWidthVal
}

onUnmounted(() => {
  controller.abort()
  keyBoardController.abort()
})
</script>

<template>
  <div
    v-show="visible"
    class="drawer-editor-container"
    ref="drawerEditorContainerRef"
    tabindex="-1"
  >
    <div class="drawer-editor-side-bar">
      <slot
        name="editor-sidebar"
        :editorSidebarWidth="drawerEditorSideBarWidth"
        :editorSidebarHeight="drawerEditorViewHeight"
      ></slot>
    </div>
    <Editor
      :id="id"
      v-model:editor-view-height="drawerEditorViewHeight"
      v-model:editor-view-width="drawerEditorViewWidth"
      @update:editor-view-width="updateEditorViewWidthHandler"
      :resizable="true"
      :resize-direction="['n', 's']"
      :resizable-editor-height-range="heightRange"
      :resizable-editor-width-range="widthRange"
      :modify-timeline-by-click="false"
      :throttle-scroll="true"
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
  --drawer-editor-border-color: #25292f;
  display: flex;
  height: fit-content;
}
.drawer-editor-side-bar {
  width: v-bind(drawerEditorSideBarWidth + "px");
}
</style>
