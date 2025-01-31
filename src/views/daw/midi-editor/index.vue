<script setup>
import DrawerEditor from "@/views/daw/drawer-editor/index.vue"
import MidiSidebar from "@/views/daw/midi-editor/midi-sidebar/index.vue"
import NoteEditor from "@/views/daw/midi-editor/note-editor/index.vue"
import { computed, inject, provide, ref } from "vue"
import { useEditorGridParametersStore } from "@/store/daw/editor-parameters/index.js"
import { useMixTrackEditorStore } from "@/store/daw/mix-track-editor/index.js"
const editorGridParametersStore = useEditorGridParametersStore()
const mixTrackEditorStore = useMixTrackEditorStore()

const props = defineProps({
  editorScrollTop: {
    type: Number,
  },
})
const { selectedAudioTrackId } = inject("selectedAudioTrackId")
const mainColor = computed(() => {
  if (selectedAudioTrackId.value === undefined) return "#1E90FF"
  return mixTrackEditorStore.mixTrackUnitMap.get(selectedAudioTrackId.value)
    .mainColor
})
provide("mainColor", mainColor)
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
const workspacePlaceHolderHeight = ref(20)
provide("workspacePlaceHolderHeight", workspacePlaceHolderHeight)

const scrollMovement = ref({
  scrollTop: 0,
  scrollLeft: 0,
})
function updateScrollMovement({ scrollTop, scrollLeft }) {
  if (scrollTop !== undefined) {
    scrollMovement.value.scrollTop = scrollTop
  }
  if (scrollLeft !== undefined) {
    scrollMovement.value.scrollLeft = scrollLeft
  }
  chromaticScaleScrollTop.value = scrollTop
}
provide("scrollMovement", { scrollMovement, updateScrollMovement })

const chromaticScaleScrollTop = ref(0)
function updateChromaticScaleScrollTopHandler(chromaticScaleScrollTop) {
  scrollMovement.value.scrollTop = chromaticScaleScrollTop
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
  { canvasWidth, canvasHeight, gridWidth = 20, gridHeight = 90, minGridWidth },
) {
  if (!target) return
  const ctx = target.getContext("2d")
  target.width = canvasWidth
  target.height = canvasHeight + 1
  editorGridParametersStore.minGridHorizontalMovement = gridWidth

  ctx.clearRect(0, 0, canvasWidth, canvasHeight)

  ctx.beginPath()

  //Draw vertical lines
  const isAliquot = gridWidth % minGridWidth === 0

  for (let x = 0; x <= canvasWidth; x += gridWidth) {
    ctx.strokeStyle = "#ddd"
    ctx.moveTo(x, 0)
    ctx.lineTo(x, canvasHeight)
    if (isAliquot && gridWidth !== minGridWidth) {
      editorGridParametersStore.minGridHorizontalMovement = minGridWidth
      const integralMultiple = gridWidth / minGridWidth
      for (let i = 1; i < integralMultiple; i++) {
        const drawnX = x - i * minGridWidth
        ctx.moveTo(drawnX, 0)
        ctx.lineTo(drawnX, canvasHeight)
      }
    }
  }
  ctx.stroke()
}
</script>

<template>
  <DrawerEditor
    :canvas-content-height-prop="canvasContentHeight"
    :draw-drawer-editor-grid-handler="drawNotePadGrid"
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
      #custom-editor-layer="{
        interactableLayerWidth,
        interactableLayerHeight,
        editableViewWidth,
        editableViewHeight,
        trackRulerHeight,
        zoomRatio,
      }"
    >
      <NoteEditor
        :note-pad-width="interactableLayerWidth"
        :note-pad-height="interactableLayerHeight"
        :editable-view-width="editableViewWidth"
        :editable-view-height="editableViewHeight"
        :zoom-ratio="zoomRatio"
        :track-ruler-height="trackRulerHeight"
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
