<script setup>
import Editor from "@/views/daw/editor-template/index.vue"
import MixTrackUnitManagement from "@/views/daw/mix-track-editor/MixTrackUnitManagement.vue"
const props = defineProps({
  mainEditorId: {
    type: String,
    required: true,
  },
  mainEditorViewWidth: {
    type: Number,
    required: true,
  },
  mainEditorViewHeight: {
    type: Number,
    required: true,
  },
})
</script>

<template>
  <Editor
    :id="mainEditorId"
    :editor-view-height="mainEditorViewHeight"
    :editor-view-width="mainEditorViewWidth"
  >
    <template
      #default-interactable-layer="{
        interactableLayerWidth,
        interactableLayerHeight,
        zoomRatio,
      }"
    >
      <MixTrackUnitManagement
        :width="interactableLayerWidth"
        :height="interactableLayerHeight"
        :zoom-ratio="zoomRatio"
      ></MixTrackUnitManagement>
    </template>
  </Editor>
</template>

<style scoped></style>
