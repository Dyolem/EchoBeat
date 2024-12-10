<script setup>
import DrawerEditor from "@/views/daw/drawer-editor/index.vue"
import MidiSidebar from "@/views/daw/midi-editor/midi-sidebar/index.vue"
import NoteEditor from "@/views/daw/midi-editor/note-editor/index.vue"
import { provide, ref } from "vue"

const props = defineProps({
  editorScrollTop: {
    type: Number,
  },
})
const emit = defineEmits(["update:editorScrollTop"])

const BLACK_KEY_HEIGHT = 10
const WHITE_KEY_HEIGHT = 16
const WHITE_KEY_WIDTH = 60

const CHROMATIC_SCALE_ENUM = ["C1", "C2", "C3", "C4", "C5", "C6", "C7"]
const OCTAVE_COUNT = CHROMATIC_SCALE_ENUM.length
const pianoKeySize = ref({
  blackKeyHeight: BLACK_KEY_HEIGHT,
  whiteKeyHeight: WHITE_KEY_HEIGHT,
  whiteKeyWidth: WHITE_KEY_WIDTH,
})
provide("pianoKeySize", pianoKeySize)
const chromaticInfo = ref({
  octaveCount: OCTAVE_COUNT,
  chromaticScale: CHROMATIC_SCALE_ENUM,
})
provide("chromaticInfo", chromaticInfo)
function enlargeKeySize() {
  pianoKeySize.value.whiteKeyHeight += 3
}
const scrollTop = ref({
  chromaticScaleScrollTop: 0,
  noteEditorScrollTop: 0,
})
function reallocation(computationalFunc) {
  computationalFunc(scrollTop)
}
provide("reallocationScrollTop", { scrollTop, reallocation })

const editorScrollTop = ref(0)
const chromaticScaleScrollTop = ref(0)
function updateEditorScrollTopHandler(editorScrollTop) {
  // emit("update:editorScrollTop", editorScrollTop)
  chromaticScaleScrollTop.value = editorScrollTop
}
function updateChromaticScaleScrollTopHandler(chromaticScaleScrollTop) {
  editorScrollTop.value = chromaticScaleScrollTop
  // emit("update:chromaticScaleScrollTop", chromaticScaleScrollTop)
}
const canvasContentHeight = ref(20)
function updateCanvasContentHeight(height) {
  canvasContentHeight.value = height
}
provide("canvasContentHeight", {
  canvasContentHeight,
  updateCanvasContentHeight,
})
function drawNotePadGrid(
  target,
  { canvasWidth, canvasHeight, gridWidth = 20, gridHeight = 90 },
) {
  if (!target) return
  const ctx = target.getContext("2d")
  target.width = canvasWidth
  target.height = canvasHeight + 1

  ctx.clearRect(0, 0, canvasWidth, canvasHeight)

  ctx.beginPath()

  //Draw vertical lines
  for (let x = 0; x < canvasWidth; x += gridWidth) {
    ctx.strokeStyle = "#ddd"
    ctx.moveTo(x, 0)
    ctx.lineTo(x, canvasHeight)
  }
  ctx.stroke()
}
</script>

<template>
  <DrawerEditor
    :canvas-content-height-prop="canvasContentHeight"
    :editor-scroll-top="editorScrollTop"
    :draw-drawer-editor-grid-handler="drawNotePadGrid"
    @update:editor-scroll-top="updateEditorScrollTopHandler"
  >
    <template #editor-sidebar="{ editorSidebarWidth, editorSidebarHeight }">
      <div
        class="midi-editor-sidebar"
        :style="{ height: editorSidebarHeight + 'px' }"
      >
        <button @click="enlargeKeySize">enlargeKeySize</button>
        <midi-sidebar
          :chromatic-scale-scroll-top="chromaticScaleScrollTop"
          @update:chromatic-scale-scroll-top="
            updateChromaticScaleScrollTopHandler
          "
        ></midi-sidebar>
      </div>
    </template>

    <template
      #custom-editor-layer="{ interactableLayerWidth, interactableLayerHeight }"
    >
      <NoteEditor
        :note-pad-width="interactableLayerWidth"
        :note-pad-height="interactableLayerHeight"
      ></NoteEditor>
    </template>
  </DrawerEditor>
</template>

<style scoped>
.midi-editor-sidebar {
  width: 100%;
  height: 100%;
  display: flex;
}
</style>
