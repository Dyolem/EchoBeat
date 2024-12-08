<script setup>
import DrawerEditor from "@/views/daw/drawer-editor/index.vue"
import MidiSidebar from "@/views/daw/midi-editor/midi-sidebar/index.vue"
import NoteEditor from "@/views/daw/midi-editor/note-editor/index.vue"
</script>

<template>
  <DrawerEditor>
    <template #editor-sidebar="{ editorSidebarWidth, editorSidebarHeight }">
      <div
        class="midi-editor-sidebar"
        :style="{ height: editorSidebarHeight + 'px' }"
      >
        <midi-sidebar></midi-sidebar>
      </div>
    </template>

    <template
      #custom-editor-layer="{ interactableLayerWidth, interactableLayerHeight }"
    >
      <NoteEditor
        :note-track-width="interactableLayerWidth"
        :note-track-height="interactableLayerHeight"
      ></NoteEditor>
      <!--      <div-->
      <!--        class="test"-->
      <!--        :style="{-->
      <!--          width: interactableLayerWidth + 'px',-->
      <!--          height: interactableLayerHeight + 'px',-->
      <!--          backgroundColor: 'antiquewhite',-->
      <!--        }"-->
      <!--      >-->
      <!--        {{ `${interactableLayerWidth}, ${interactableLayerHeight}` }}-->
      <!--      </div>-->
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
