<script setup>
import DrawerEditor from "@/views/daw/drawer-editor/index.vue"
import ChromaticScale from "@/views/daw/midi-editor/midi-sidebar/chromatic-scale/index.vue"
import MidiOptions from "@/views/daw/midi-editor/midi-sidebar/midi-options/index.vue"
</script>

<template>
  <DrawerEditor>
    <template #editor-sidebar="{ editorSidebarWidth, editorSidebarHeight }">
      <div
        class="midi-editor-sidebar"
        :style="{ height: editorSidebarHeight + 'px' }"
      >
        <MidiOptions></MidiOptions>
        <ChromaticScale></ChromaticScale>
      </div>
    </template>

    <template
      #custom-editor-layer="{ interactableLayerWidth, interactableLayerHeight }"
    >
      <div
        class="test"
        :style="{
          width: interactableLayerWidth + 'px',
          height: interactableLayerHeight + 'px',
          backgroundColor: 'antiquewhite',
        }"
      >
        {{ `${interactableLayerWidth}, ${interactableLayerHeight}` }}
      </div>
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
