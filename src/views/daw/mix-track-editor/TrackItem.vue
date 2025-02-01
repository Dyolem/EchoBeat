<script setup>
import { inject, onMounted } from "vue"
import { FALLBACK_THEME_COLOR } from "@/constants/daw/index.js"

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  width: {
    type: Number,
    default: 100,
  },
  trackItemStartPosition: {
    type: Number,
    default: 0,
  },
  mainColor: {
    type: String,
    default: FALLBACK_THEME_COLOR,
  },
})
const { selectedTrackItemId, updateSelectedTrackItemId } = inject(
  "selectedTrackItemId",
)
onMounted(() => {
  updateSelectedTrackItemId(props.id)
})
</script>

<template>
  <div
    class="track-item"
    :class="selectedTrackItemId === id ? 'selected' : ''"
    :data-track-item-id="id"
  >
    <div class="mix-content-thumbnail-container">
      <div class="track-name"></div>
      <div class="mix-content-thumbnail">
        <slot name="mix-content-thumbnail"></slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.track-item {
  position: absolute;
  width: v-bind(width + "px");
  height: 100%;
  background-color: v-bind(mainColor + "EE");
  border-radius: 4px;
  transform: v-bind("`translateX(${trackItemStartPosition}px)`");
}
.mix-content-thumbnail-container {
  width: 100%;
  height: 100%;
}
.selected {
  outline: 1px solid #ffffff;
  z-index: 1;
}
</style>
