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
const width = computed(() => {
  return Number(props.width.toFixed(1))
})
const startPosition = computed(() => {
  return Number(props.startPosition.toFixed(1))
})
const { selectedTrackItemId, updateSelectedTrackItemId } = inject(
  "selectedTrackItemId",
)
const trackItemContainerRef = useTemplateRef("trackItemContainerRef")
onMounted(() => {
  updateSelectedTrackItemId(props.id)
  trackItemContainerRef.value.addEventListener("mousedown", (event) => {
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
    class="track-item-container"
    :class="selectedTrackItemId === id ? 'selected' : ''"
    ref="trackItemContainerRef"
    :data-track-item-id="id"
  >
    <div class="stretch-handle">
      <div class="copy"></div>
      <div class="stretch"></div>
    </div>
    <div class="track-item">
      <p class="track-name">{{ trackName }}</p>
      <div class="mix-content-thumbnail">
        <slot name="mix-content-thumbnail"></slot>
      </div>
    </div>
    <div class="stretch-handle">
      <div class="copy"></div>
      <div class="stretch"></div>
    </div>
  </div>
</template>

<style scoped>
.track-item-container {
  --track-item-start-position: v-bind(startPosition + "px");
  --main-color: v-bind(mainColor);
  --header-bg-color: v-bind(trackCopyStretchHandleBgColor);
  --main-bg-color: v-bind(mixContentThumbnailBgColor);
  --main-color-mix-value: v-bind(mainColor + "EE");
  --header-color-mix-value: var(--main-color);
  --header-height: 18px;
  --track-item-min-width: 0;
  position: absolute;
  display: flex;
  width: v-bind(width + "px");
  height: v-bind(height + "px");
  border-radius: 4px;
  transform: translateX(var(--track-item-start-position));
}
.stretch-handle {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 5px;
  height: 100%;
}
.copy {
  width: 100%;
  height: var(--header-height);
  background-color: var(--header-bg-color);
}
.copy:hover {
  cursor: ew-resize;
}
.stretch {
  width: 100%;
  flex-grow: 1;
  background-color: var(--main-bg-color);
}
.stretch:hover {
  cursor: col-resize;
}
.track-item {
  --mix-content-thumbnail-bg-color: v-bind(mainColor + "EE");
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: var(--track-item-min-width);
  flex: auto;
  background-color: v-bind(--main-bg-color);
}

.track-name {
  width: 100%;
  height: var(--header-height);
  color: #ffffff;
  font-size: 12px;
  font-weight: bold;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  background-color: var(--header-bg-color);
}
.mix-content-thumbnail {
  width: 100%;
  flex-grow: 1;
  background-color: var(--main-bg-color);
}
.track-item:hover {
  cursor: grab;
}
.selected {
  outline: 1px solid #ffffff;
  z-index: 1;
}

@supports (background-color: color-mix(in srgb, red, blue)) {
  .track-item-container {
    --header-bg-color: color-mix(
      in srgb,
      var(--header-color-mix-value),
      var(--darken-mix-color) 50%
    );
    --main-bg-color: color-mix(
      in srgb,
      var(--main-color-mix-value),
      var(--darken-mix-color) 20%
    );
  }
}
</style>
