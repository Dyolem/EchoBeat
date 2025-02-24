<script setup>
import { debounce } from "@/utils/debounce.js"
import EditorHeader from "@/views/daw/header/index.vue"
import MixTrackEditor from "@/views/daw/mix-track-editor/index.vue"
import EditorFooter from "@/views/daw/footer/index.vue"

import {
  computed,
  onMounted,
  onUnmounted,
  provide,
  ref,
  watchEffect,
} from "vue"
import {
  INIT_FOOTER_HEIGHT,
  INIT_HEADER_HEIGHT,
  MAIN_EDITOR_ID,
} from "@/constants/daw/index.js"
import { useZoomRatioStore } from "@/store/daw/zoomRatio.js"

const zoomRatioStore = useZoomRatioStore()

zoomRatioStore.initZoomRatioMap()

const headerHeight = ref(INIT_HEADER_HEIGHT)
const footerHeight = ref(INIT_FOOTER_HEIGHT)

const editorSideBarWidth = ref(300)

const controller = new AbortController()
const exceptEditorHeight = computed(() => {
  return headerHeight.value + footerHeight.value
})

const mainEditorViewWidth = ref(window.innerWidth - editorSideBarWidth.value)
const mainEditorViewHeight = ref(window.innerHeight - exceptEditorHeight.value)
watchEffect(() => {
  mainEditorViewHeight.value = window.innerHeight - exceptEditorHeight.value
})

function resizeHandler(event) {
  mainEditorViewWidth.value = window.innerWidth - editorSideBarWidth.value
  mainEditorViewHeight.value = window.innerHeight - exceptEditorHeight.value
}
const debouncedResizeHandler = debounce(resizeHandler, 200)
window.addEventListener("resize", debouncedResizeHandler, {
  signal: controller.signal,
})

onMounted(() => {
  resizeHandler()
})
onUnmounted(() => {
  controller.abort()
})

const selectedAudioTrackId = ref("")
function updateSelectedAudioTrackId(newId) {
  if (!newId) return
  selectedAudioTrackId.value = newId
}
provide("selectedAudioTrackId", {
  selectedAudioTrackId,
  updateSelectedAudioTrackId,
})

const selectedTrackItemId = ref("")
function updateSelectedTrackItemId(newId) {
  selectedTrackItemId.value = newId
}
provide("selectedTrackItemId", {
  selectedTrackItemId,
  updateSelectedTrackItemId,
})
</script>

<template>
  <div id="main">
    <EditorHeader />

    <MixTrackEditor
      :main-editor-id="MAIN_EDITOR_ID"
      :main-editor-view-width="mainEditorViewWidth"
      :main-editor-view-height="mainEditorViewHeight"
    ></MixTrackEditor>
    <EditorFooter v-model:footer-height="footerHeight"></EditorFooter>
  </div>
</template>

<style scoped>
#main {
  --default-header-height: v-bind(INIT_HEADER_HEIGHT + "px");
  --default-footer-height: v-bind(INIT_FOOTER_HEIGHT + "px");
  display: flex;
  flex-direction: column;
}
</style>
