<script setup>
import { inject, computed } from "vue"
import EditMode from "@/views/daw/midi-editor/midi-sidebar/midi-options/EditMode.vue"
import Velocity from "@/views/daw/midi-editor/midi-sidebar/midi-options/Velocity.vue"
import Params from "@/views/daw/midi-editor/midi-sidebar/midi-options/Params.vue"
import Transpose from "@/views/daw/midi-editor/midi-sidebar/midi-options/Transpose.vue"
import SmartView from "@/views/daw/midi-editor/midi-sidebar/midi-options/SmartView.vue"
import { useSelectionStore } from "@/store/daw/selection.js"
import { storeToRefs } from "pinia"

const selectionStore = useSelectionStore()
const { selectedNotesIdSet } = storeToRefs(selectionStore)

const props = defineProps({
  badgeName: {
    type: String,
    default: "Instrument",
  },
})
const mainColor = inject("mainColor")
const { selectedAudioTrackId } = inject("selectedAudioTrackId")
const { filterEffect } = inject("playableAudioTrack")
const smartViewHintContent = `<pre style="font-family: reset">Smart View only shows rows that
belong to the selected scale, or that
contain notes</pre>`

const midiNotesWorkableDisabledState = computed(() => {
  return selectedNotesIdSet.value.size === 0
})
</script>

<template>
  <div
    class="midi-option-container"
    :style="{
      filter: filterEffect(selectedAudioTrackId),
    }"
  >
    <div class="option-head">
      <div class="close-button">
        <echo-material-symbols:close-rounded></echo-material-symbols:close-rounded>
      </div>
      <div class="audio-track-type">
        <i class="track-type-icon">
          <echo-fluent:midi-24-regular
            class="icon-main-color"
          ></echo-fluent:midi-24-regular>
        </i>
        <span class="badge-name">{{ badgeName }}</span>
      </div>
    </div>
    <div class="option-main beatified-scrollbar">
      <EditMode class="feature-size"></EditMode>
      <div class="title">
        <div class="title-text">
          <echo-heroicons-outline:music-note
            class="icon-main-color"
          ></echo-heroicons-outline:music-note>
          <span>MIDI Notes</span>
        </div>
      </div>
      <Velocity
        class="feature-size"
        :disabled="midiNotesWorkableDisabledState"
      ></Velocity>
      <Params class="feature-size"></Params>
      <Transpose class="feature-size"></Transpose>
      <div class="title">
        <div class="title-text">
          <echo-material-symbols-light:smart-card-reader-outline
            class="icon-main-color"
          ></echo-material-symbols-light:smart-card-reader-outline>
          <span>Smart View</span>
        </div>
        <el-tooltip
          class="box-item"
          effect="dark"
          :content="smartViewHintContent"
          placement="top-start"
          :raw-content="true"
        >
          <echo-fluent:square-hint-sparkles-24-regular
            class="icon-main-color"
          ></echo-fluent:square-hint-sparkles-24-regular>
        </el-tooltip>
      </div>
      <SmartView></SmartView>
    </div>
  </div>
</template>

<style scoped>
.midi-option-container {
  --icon-main-color: v-bind(mainColor);
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #0f1214;
  color: #ffffff;
}
.icon-main-color {
  color: var(--icon-main-color);
}
.option-head {
  display: flex;
  width: 100%;
  height: 50px;
  border: 1px solid var(--drawer-editor-border-color);
}
.close-button {
  display: flex;
  align-items: center;
  width: 50px;
  height: 100%;
  justify-content: center;
  text-align: center;
  border-right: 1px solid var(--drawer-editor-border-color);
}
.audio-track-type {
  font-size: 14px;
  flex-grow: 1;
  display: flex;
  align-items: center;
  height: 100%;
}
.track-type-icon {
  display: flex;
  align-items: center;
  padding: 0 12px;
}
.badge-name {
  vertical-align: baseline;
}
.option-main {
  overflow: auto;
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  font-size: 12px;
}
.feature-size {
  width: 100%;
}
.title {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.title-text {
  display: flex;
  gap: 10px;
  align-items: center;
  font-size: 14px;
  font-weight: 600;
}
</style>
