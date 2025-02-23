<script setup>
import { debounce } from "@/utils/debounce.js"
import EditorHeader from "@/views/daw/header/index.vue"
import MidiEditor from "@/views/daw/midi-editor/index.vue"
import MixTrackEditor from "@/views/daw/mix-track-editor/index.vue"
import AddTrackSidebar from "@/views/daw/add-track-sidebar/index.vue"

import {
  computed,
  onMounted,
  onUnmounted,
  provide,
  ref,
  useTemplateRef,
  watchEffect,
} from "vue"
import { MAIN_EDITOR_ID, SUBORDINATE_EDITOR_ID } from "@/constants/daw/index.js"
import { useZoomRatioStore } from "@/store/daw/zoomRatio.js"
import MixEditorButtonGroup from "@/views/daw/mix-editor-button/MixEditorButtonGroup.vue"
import MixEditorButton from "@/views/daw/mix-editor-button/MixEditorButton.vue"
const zoomRatioStore = useZoomRatioStore()

zoomRatioStore.initZoomRatioMap()
const HEADER_HEIGHT = 100
const FOOTER_HEIGHT = 50
const headerHeight = ref(HEADER_HEIGHT)
const footerHeight = ref(FOOTER_HEIGHT)

const editorSideBarWidth = ref(300)
const footerContainerRef = useTemplateRef("footerContainerRef")
// // 创建一个 ResizeObserver 实例
const resizeObserver = new ResizeObserver((entries) => {
  entries.forEach((entry) => {
    footerHeight.value = entry.contentRect.height
  })
})
onMounted(() => {
  // 开始观察
  if (footerContainerRef.value) resizeObserver.observe(footerContainerRef.value)
})
onUnmounted(() => {
  // 不再需要观察，调用 unobserve() 取消监听
  resizeObserver.unobserve(footerContainerRef.value)
})
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

const isOpenDrawerEditor = ref(false)

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
    <header>
      <EditorHeader />
    </header>
    <main class="main-editor-container">
      <MixTrackEditor
        :main-editor-id="MAIN_EDITOR_ID"
        :main-editor-view-width="mainEditorViewWidth"
        :main-editor-view-height="mainEditorViewHeight"
      ></MixTrackEditor>
    </main>
    <footer class="footer" ref="footerContainerRef">
      <MidiEditor
        :id="SUBORDINATE_EDITOR_ID"
        v-show="isOpenDrawerEditor"
      ></MidiEditor>
      <div class="footer-tool-bar">
        <div class="left-side-tool">
          <MixEditorButtonGroup>
            <MixEditorButton>
              <div class="tool-name">
                <echo-lucide:piano></echo-lucide:piano>
                <span>Instrument</span>
              </div>
            </MixEditorButton>
            <MixEditorButton>
              <div class="tool-name">
                <echo-solar:special-effects-linear></echo-solar:special-effects-linear>
                <span>Effects</span>
              </div>
            </MixEditorButton>
            <MixEditorButton @click="isOpenDrawerEditor = !isOpenDrawerEditor">
              <div class="tool-name">
                <echo-fluent:midi-24-regular></echo-fluent:midi-24-regular>
                <span>MIDI Editor</span>
              </div>
            </MixEditorButton>
          </MixEditorButtonGroup>
        </div>
        <div class="right-side-tool"></div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
#main {
  --default-header-height: v-bind(HEADER_HEIGHT + "px");
  --default-footer-height: v-bind(FOOTER_HEIGHT + "px");
  display: flex;
  flex-direction: column;
}
.footer {
  position: relative;
  display: flex;
  align-items: center;
  width: 100vw;
  min-height: var(--default-footer-height);
  background-color: lightpink;
}
.footer-tool-bar {
  height: fit-content;
  width: 100%;
  padding: 0 30px;
  display: flex;
  justify-content: space-between;
}
.left-side-tool,
.right-side-tool {
  height: 100%;
  display: flex;
  align-items: center;
}
.tool-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}
</style>
