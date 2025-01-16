<script setup>
import { computed, inject, onMounted, ref, useTemplateRef, watch } from "vue"
import { useNoteItemStore } from "@/store/daw/note-editor/noteItem.js"
import NoteItem from "@/views/daw/midi-editor/note-editor/NoteItem.vue"
import { useWorkspaceStore } from "@/store/daw/workspace/index.js"
import WorkspaceHandle from "@/views/daw/midi-editor/note-editor/WorkspaceHandle.vue"
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
  editableViewHeight: {
    type: Number,
  },
  workspaceHandleHeight: {
    type: Number,
    default: 20,
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
  workspaceBadgeName: {
    type: String,
    default: "Instrument",
  },
  getCursorPositionInNoteEditorRegion: {
    type: Function,
    required: true,
  },
})

const workspaceScrollContainerHeight = computed(() => {
  return props.editableViewHeight - props.workspaceHandleHeight
})
const noteEditorWorkspaceContainerRef = useTemplateRef(
  "noteEditorWorkspaceContainerRef",
)

const getNotePosition = (x, y) => {
  if (x === undefined || y === undefined) return
  return ref([x, y])
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

const { scrollMovement, updateScrollMovement } = inject("scrollMovement")
const noteEditorWorkspaceRef = useTemplateRef("noteEditorWorkspaceRef")
onMounted(() => {
  watch(
    scrollMovement,
    (newScrollMovement) => {
      noteEditorWorkspaceRef.value.scrollTop = newScrollMovement.scrollTop
    },
    { deep: true, immediate: true },
  )
})

function scrollHandler(event) {
  const scrollTop = event.target.scrollTop
  updateScrollMovement({ scrollTop })
}
function triggerCustomizedInsertEvent(event) {
  const eventType = event.type
  if (
    (noteItemStore.isSelectMode && eventType === "dblclick") ||
    (noteItemStore.isInsertMode && eventType === "mousedown")
  ) {
    const { x, y } = props.getCursorPositionInNoteEditorRegion(event)
    noteEditorWorkspaceRef.value.dispatchEvent(
      new CustomEvent("insert-note", {
        detail: {
          insertPosition: {
            x,
            y,
          },
        },
        bubbles: true,
      }),
    )
  }
}
</script>

<template>
  <div
    class="note-editor-workspace-container"
    ref="noteEditorWorkspaceContainerRef"
  >
    <div class="workspace-handle">
      <WorkspaceHandle
        :id="id"
        :zoom-ratio="zoomRatio"
        :noteEditorRegionRef="noteEditorRegionRef"
        :note-pad-width="editorCanvasWidth"
        :start-position="startPosition"
        :workspace-container-width="workspaceContainerWidth"
      ></WorkspaceHandle>
    </div>
    <div
      class="note-editor-workspace"
      ref="noteEditorWorkspaceRef"
      @scroll="scrollHandler"
      @mousedown="triggerCustomizedInsertEvent"
      @dblclick="triggerCustomizedInsertEvent"
    >
      <div class="workspace-scroll-zone">
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
            :workspace-id="id"
            :belonged-pitch-name="noteItem.pitchName"
            :note-width="noteItem.width"
            :note-height="noteHeight"
            :note-pad-width="editorCanvasWidth"
            :note-pad-height="editorCanvasHeight"
            :note-position="getNotePosition(noteItem.x, noteItem.y)"
            :workspace-start-position="startPosition"
            :noteEditorRegionRef="noteEditorRegionRef"
          ></note-item>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.note-editor-workspace-container {
  position: absolute;
  width: v-bind(workspaceContainerWidth + "px");
  height: v-bind(editableViewHeight + "px");
  pointer-events: none;
  transform: v-bind("`translateX(${startPosition}px)`");
  scrollbar-width: none;
}
.workspace-handle {
  width: v-bind(workspaceContainerWidth + "px");
  height: v-bind(workspaceHandleHeight + "px");
  background-color: #000000;
}
.note-editor-workspace {
  overflow: auto;
  scrollbar-width: none;
  width: 100%;
  height: v-bind(workspaceScrollContainerHeight + "px");
  background-color: rgba(97, 9, 138, 0.3);
  pointer-events: initial;
}
.workspace-scroll-zone {
  position: relative;
  width: 100%;
  height: v-bind(editorCanvasHeight + "px");
}
</style>
