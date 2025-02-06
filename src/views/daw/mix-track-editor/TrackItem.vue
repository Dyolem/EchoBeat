<script setup>
import { computed, inject, onMounted, useTemplateRef } from "vue"
import {
  BASE_GRID_HEIGHT,
  DARKEN_COLOR,
  FALLBACK_THEME_COLOR,
} from "@/constants/daw/index.js"
import { colorMix } from "@/utils/colorMix.js"

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  width: {
    type: Number,
    default: 100,
  },
  height: {
    type: Number,
    default: BASE_GRID_HEIGHT,
  },
  startPosition: {
    type: Number,
    default: 0,
  },
  mainColor: {
    type: String,
    default: FALLBACK_THEME_COLOR,
  },
  trackName: {
    type: String,
    default: "Instrument",
  },
  trackZoomRatio: {
    type: Number,
    default: 1,
  },
})
const { selectedTrackItemId, updateSelectedTrackItemId } = inject(
  "selectedTrackItemId",
)
const trackItemRef = useTemplateRef("trackItemRef")
onMounted(() => {
  updateSelectedTrackItemId(props.id)
  trackItemRef.value.addEventListener("mousedown", (event) => {
    event.currentTarget.style.cursor = "move"
  })
})
const trackCopyStretchHandleBgColor = computed(() => {
  return colorMix("srgb", props.mainColor, `${DARKEN_COLOR} 50%`)
})
const mixContentThumbnailBgColor = computed(() => {
  return colorMix("srgb", props.mainColor + "EE", `${DARKEN_COLOR} 20%`)
})
</script>

<template>
  <div
    class="track-item"
    ref="trackItemRef"
    :class="selectedTrackItemId === id ? 'selected' : ''"
    :data-track-item-id="id"
  >
    <div class="track-copy-stretch-handle">
      <span class="track-name">{{ trackName }}</span>
    </div>
    <div class="mix-content-thumbnail">
      <slot name="mix-content-thumbnail"></slot>
    </div>
  </div>
</template>

<style scoped>
.track-item {
  --track-itme-start-position: v-bind(startPosition + "px");
  position: absolute;
  display: flex;
  flex-direction: column;
  width: v-bind(width + "px");
  height: v-bind(height + "px");
  border-radius: 4px;
  transform: translateX(var(--track-itme-start-position));
}
.track-item:hover {
  cursor: grab;
}
.selected {
  outline: 1px solid #ffffff;
  z-index: 1;
}
.track-copy-stretch-handle {
  --track-copy-stretch-handle-background-color: v-bind(mainColor);
  display: flex;
  align-items: center;
  width: 100%;
  height: 18px;
  background-color: v-bind(trackCopyStretchHandleBgColor);
}
.track-name {
  color: #ffffff;
  font-size: 12px;
  font-weight: bold;
  padding: 0 4px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.mix-content-thumbnail {
  --mix-content-thumbnail-bg-color: v-bind(mainColor + "EE");
  width: 100%;
  flex-grow: 1;
  background-color: v-bind(mixContentThumbnailBgColor);
}
@supports (background-color: color-mix(in srgb, red, blue)) {
  .track-copy-stretch-handle {
    background-color: color-mix(
      in srgb,
      var(--track-copy-stretch-handle-background-color),
      var(--darken-mix-color) 50%
    );
  }
  .mix-content-thumbnail {
    background-color: color-mix(
      in srgb,
      var(--mix-content-thumbnail-bg-color),
      var(--darken-mix-color) 20%
    );
  }
}
</style>
