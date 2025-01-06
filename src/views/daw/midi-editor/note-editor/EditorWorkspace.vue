<script setup>
import { computed, inject, ref, useTemplateRef } from "vue"
import { useNoteItemStore } from "@/store/daw/note-editor/noteItem.js"
import NoteItem from "@/views/daw/midi-editor/note-editor/NoteItem.vue"
import { useWorkspaceStore } from "@/store/daw/workspace/index.js"
const noteItemStore = useNoteItemStore()
const workspaceStore = useWorkspaceStore()

const props = defineProps({
  id: {
    type: [Number, String],
    required: true,
  },
  editorCanvasHeight: {
    type: Number,
  },
  editorCanvasWidth: {
    type: Number,
  },
  zoomRatio: {
    type: Number,
    default: 1,
  },
  noteEditorRegionRef: {
    type: Object,
    required: true,
  },
  workspaceContainerWidth: {
    type: Number,
  },
  startPosition: {
    type: Number,
    default: 0,
  },
  noteItemsMap: {
    type: Object,
  },
})
console.log(props.noteItemsMap)
const noteEditorWorkspaceContainerRef = useTemplateRef(
  "noteEditorWorkspaceContainerRef",
)

const noteMainSelectedId = ref("")
const getNotePosition = (x, y) => {
  if (x === undefined || y === undefined) return
  return ref([x - workspaceStore.workspaceStartPosition, y])
}
const chromaticInfo = inject("chromaticInfo")
const pianoKeySize = inject("pianoKeySize")
const whiteKeyHeight = computed(() => {
  return pianoKeySize.value.whiteKeyHeight
})
const OCTAVE_KEY_COUNT = 12
const OCTAVE_WHITE_KEY_COUNT = 7
const noteHeight = computed(() => {
  return Number(
    (
      (whiteKeyHeight.value *
        chromaticInfo.value.octaveCount *
        OCTAVE_WHITE_KEY_COUNT) /
      (OCTAVE_KEY_COUNT * chromaticInfo.value.octaveCount)
    ).toFixed(3),
  )
})
const workspaceTranslateX = defineModel("workspaceTranslateX", {
  type: Number,
  default: 0,
})
</script>

<template>
  <div
    class="note-editor-workspace-container"
    ref="noteEditorWorkspaceContainerRef"
  >
    <div class="note-editor-workspace">
      <template
        class="note-editor-track"
        v-for="[pitchName, noteTrack] in noteItemsMap"
        :style="{ transform: `translateY(${noteTrack.positionY}px)` }"
        :id="pitchName"
      >
        <note-item
          v-for="noteItem in noteTrack.noteItems"
          :key="noteItem.id"
          :id="noteItem.id"
          :belonged-pitch-name="noteItem.pitchName"
          :note-width="noteItem.width"
          :note-height="noteHeight"
          :note-pad-width="editorCanvasWidth"
          :note-pad-height="editorCanvasHeight"
          :note-position="getNotePosition(noteItem.x, noteItem.y)"
          v-model:note-main-selected-id="noteMainSelectedId"
          :noteEditorRegionRef="noteEditorRegionRef"
        ></note-item>
      </template>
    </div>
  </div>
</template>

<style scoped>
.note-editor-workspace-container {
  position: absolute;
  display: flex;
  flex-direction: column;
  width: v-bind(workspaceContainerWidth + "px");
  height: v-bind(editorCanvasHeight + "px");
  pointer-events: none;
  transform: v-bind("`translateX(${startPosition}px)`");
}
.note-editor-workspace {
  width: 100%;
  flex-grow: 1;
  background-color: rgba(97, 9, 138, 0.3);
  pointer-events: initial;
}
</style>
