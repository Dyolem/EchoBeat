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
  watchEffect,
} from "vue"
import { useTrackRulerStore } from "@/store/daw/trackRuler/timeLine.js"
import { useMixTrackEditorStore } from "@/store/daw/mix-track-editor/index.js"

const trackRulerStore = useTrackRulerStore()
const mixTrackEditorStore = useMixTrackEditorStore()
const HEADER_HEIGHT = 100
const FOOTER_HEIGHT = 50
const headerHeight = ref(HEADER_HEIGHT)
const footerHeight = ref(FOOTER_HEIGHT)

const editorSideBarWidth = ref(300)

const controller = new AbortController()
const exceptEditorHeight = computed(() => {
  return headerHeight.value + footerHeight.value
})

const mainEditorId = ref("main-editor")
trackRulerStore.mainEditorId = mainEditorId.value

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
    <main>
      <MixTrackEditor
        :main-editor-id="mainEditorId"
        :main-editor-view-width="mainEditorViewWidth"
        :main-editor-view-height="mainEditorViewHeight"
      ></MixTrackEditor>
    </main>
    <footer class="footer">
      <button @click="isOpenDrawerEditor = !isOpenDrawerEditor">
        instrument
      </button>
      <teleport to="body">
        <Transition name="drawer">
          <MidiEditor
            class="drawer-box"
            v-show="isOpenDrawerEditor"
          ></MidiEditor>
          <!--          <DrawerEditor-->
          <!--            class="drawer-box"-->
          <!--            v-show="isOpenDrawerEditor"-->
          <!--          ></DrawerEditor>-->
        </Transition>
      </teleport>
    </footer>
  </div>
</template>

<style scoped>
#main {
  --header-height: 100px;
  --footer-height: 50px;
  --content-height: calc(100vh - var(--header-height) - var(--footer-height));
}

.drawer-box {
  position: absolute;
  bottom: v-bind(footerHeight + "px");
  z-index: 100;
}
.footer {
  position: relative;
  width: 100vw;
  height: v-bind(footerHeight + "px");
  background-color: lightpink;
}
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.5s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}
</style>
