<script setup>
import Editor from "@/views/daw/editor-template/index.vue"
import MixTrackUnitManagement from "@/views/daw/mix-track-editor/MixTrackUnitManagement.vue"
import { provide, ref } from "vue"
import AddTrackSidebar from "@/views/daw/add-track-sidebar/index.vue"
import { SCROLLBAR_WIDTH } from "@/constants/daw/index.js"
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
const addTrackSidebarScrollTop = ref(0)
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
  addTrackSidebarScrollTop.value = scrollTop
}
provide("scrollMovement", { scrollMovement, updateScrollMovement })
function updateMainEditorSidebarScrollTop(newMainEditorSidebarScrollTop) {
  scrollMovement.value.scrollTop = newMainEditorSidebarScrollTop
}
</script>

<template>
  <div class="editor-main">
    <div class="editor-side-bar">
      <AddTrackSidebar
        :main-editor-sidebar-scroll-top="addTrackSidebarScrollTop"
        @update:main-editor-sidebar-scroll-top="
          updateMainEditorSidebarScrollTop
        "
      ></AddTrackSidebar>
    </div>
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
  </div>
</template>

<style scoped>
.editor-main {
  position: relative;
  width: 100vw;
  display: flex;
  height: v-bind(mainEditorViewHeight + "px");
  background-color: #9a6e3a;
}
.editor-side-bar {
  flex-grow: 1;
  flex-basis: 100px;
  flex-shrink: 0;
  height: v-bind("`calc(100% - ${SCROLLBAR_WIDTH}px)`");
  background-color: gray;
  margin-right: 10px;
}
</style>
