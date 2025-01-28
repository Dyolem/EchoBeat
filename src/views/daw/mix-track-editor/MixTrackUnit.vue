<script setup>
import { inject } from "vue"

const props = defineProps({
  id: {
    type: [Number, String],
    required: true,
  },

  trackWidth: {
    type: Number,
    default: 100,
  },
  trackHeight: {
    type: Number,
    default: 50,
  },
  mainColor: {
    type: String,
    default: "#1E90FF",
  },
})
const { selectedAudioTrackId, updateSelectedAudioTrackId } = inject(
  "selectedAudioTrackId",
  {},
)
</script>

<template>
  <div
    class="track-unit-grid"
    :class="selectedAudioTrackId === id ? 'track-unit-grid-selected' : ''"
    @click="() => updateSelectedAudioTrackId(id)"
  >
    <div
      class="mix-editor-track-container"
      :class="selectedAudioTrackId === id ? 'selected' : ''"
    >
      <div class="track-name"></div>
      <div class="mix-content-thumbnail">
        <slot name="mix-content-thumbnail"></slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mix-editor-track-container {
  width: v-bind(trackWidth + "px");
  height: v-bind(trackHeight + "px");
  background-color: v-bind(mainColor + "DD");
  border-radius: 4px;
}
.track-unit-grid {
  width: 100%;
  height: fit-content;
}
.track-unit-grid-selected {
  background-color: v-bind(mainColor + "22");
}
.selected {
  outline: 1px solid #ffffff;
}
</style>
