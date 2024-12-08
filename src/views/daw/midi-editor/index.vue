<script setup>
import DrawerEditor from "@/views/daw/drawer-editor/index.vue"
import MidiSidebar from "@/views/daw/midi-editor/midi-sidebar/index.vue"
import NoteEditor from "@/views/daw/midi-editor/note-editor/index.vue"
import { provide, ref } from "vue"

const BLACK_KEY_HEIGHT = 10
const WHITE_KEY_HEIGHT = 16
const WHITE_KEY_WIDTH = 60

const CHROMATIC_SCALE = ["C1", "C2", "C3", "C4", "C5", "C6", "C7"]
const OCTAVE_COUNT = CHROMATIC_SCALE.length
const pianoKeySize = ref({
  blackKeyHeight: BLACK_KEY_HEIGHT,
  whiteKeyHeight: WHITE_KEY_HEIGHT,
  whiteKeyWidth: WHITE_KEY_WIDTH,
})
provide("pianoKeySize", pianoKeySize)
const chromaticInfo = ref({
  octaveCount: OCTAVE_COUNT,
  chromaticScale: CHROMATIC_SCALE,
})
provide("chromaticInfo", chromaticInfo)
function enlargeKeySize() {
  pianoKeySize.value.whiteKeyHeight += 3
}
</script>

<template>
  <DrawerEditor>
    <template #editor-sidebar="{ editorSidebarWidth, editorSidebarHeight }">
      <div
        class="midi-editor-sidebar"
        :style="{ height: editorSidebarHeight + 'px' }"
      >
        <button @click="enlargeKeySize">enlargeKeySize</button>
        <midi-sidebar></midi-sidebar>
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
