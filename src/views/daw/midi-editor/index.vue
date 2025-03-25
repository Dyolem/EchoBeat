<script setup>
import DrawerEditor from "@/views/daw/drawer-editor/index.vue"
import MidiSidebar from "@/views/daw/midi-editor/midi-sidebar/index.vue"
import NoteEditor from "@/views/daw/midi-editor/note-editor/index.vue"
import { computed, inject, provide, ref, toRef } from "vue"
import { useMixTrackEditorStore } from "@/store/daw/mix-track-editor/index.js"
import { FALLBACK_THEME_COLOR } from "@/constants/daw/index.js"
const mixTrackEditorStore = useMixTrackEditorStore()

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  editorScrollTop: {
    type: Number,
  },
})

provide(
  "subordinateEditorId",
  toRef(() => props.id),
)
const { selectedAudioTrackId } = inject("selectedAudioTrackId")

const noteMainSelectedId = ref("")
function updateNoteMainSelectedId(newVal) {
  noteMainSelectedId.value = newVal
}
provide("noteMainSelectedId", { noteMainSelectedId, updateNoteMainSelectedId })

const workspaceSelectedId = ref("")
function updateWorkspaceSelectedId(newVal) {
  workspaceSelectedId.value = newVal
}
provide("workspaceSelectedId", {
  workspaceSelectedId,
  updateWorkspaceSelectedId,
})

const mainColor = computed(() => {
  return (
    mixTrackEditorStore.mixTracksMap.get(selectedAudioTrackId.value)
      ?.mainColor ?? FALLBACK_THEME_COLOR
  )
})
const workspaceBadgeName = computed(() => {
  return mixTrackEditorStore.mixTracksMap.get(selectedAudioTrackId.value)
    ?.audioTrackName
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
const canvasContentHeight = ref(0)
function updateCanvasContentHeight(height) {
  canvasContentHeight.value = height
}
provide("canvasContentHeight", {
  canvasContentHeight,
  updateCanvasContentHeight,
})
provide("bgSvgHeight", canvasContentHeight)
</script>

<template>
  <DrawerEditor :id="id">
    <template #editor-sidebar="{ editorSidebarWidth, editorSidebarHeight }">
      <div
        class="midi-editor-sidebar"
        :style="{ height: editorSidebarHeight + 'px' }"
      >
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
        :id="id"
        :note-pad-width="interactableLayerWidth"
        :note-pad-height="interactableLayerHeight"
        :editable-view-width="editableViewWidth"
        :editable-view-height="editableViewHeight"
        :workspace-badge-name="workspaceBadgeName"
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
