<script setup>
import { computed, inject, onMounted, useTemplateRef, ref } from "vue"
import {
  AUDIO_TRACK_ENUM,
  BASE_GRID_HEIGHT,
  DARKEN_COLOR,
  FALLBACK_THEME_COLOR,
} from "@/constants/daw/index.js"
import { colorMix } from "@/utils/colorMix.js"
import { useBeatControllerStore } from "@/store/daw/beat-controller/index.js"
import { storeToRefs } from "pinia"
import MixTrackItemThumbnail from "@/views/daw/mix-track-editor/MixTrackItemThumbnail.vue"
import ContextMenu from "@/views/daw/components/context-menu/ContextMenu.vue"
import { generateMidTrack } from "@/core/audio/generateMidFile.js"
import { disPatchDeleteSubTrackEvent } from "@/core/custom-event/deleteSubTrack.js"
import { useMixTrackEditorStore } from "@/store/daw/mix-track-editor/index.js"
import { debounce } from "@/utils/debounce.js"
import { sanitizeInput } from "@/utils/sanitizeInput.js"
import { useWorkspaceStore } from "@/store/daw/workspace/index.js"
import WaveformDiagram from "@/views/daw/mix-track-editor/WaveformDiagram.vue"

const mixTrackEditorStore = useMixTrackEditorStore()
const { updateSubTrackItemInfo } = mixTrackEditorStore
const workspaceStore = useWorkspaceStore()
const { updateWorkspaceInfo } = workspaceStore
const beatControllerStore = useBeatControllerStore()
const { pixelsPerTick } = storeToRefs(beatControllerStore)
const editorId = inject("mainEditorId")

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  audioTrackId: {
    type: String,
    required: true,
  },
  workspaceId: {
    type: String,
    required: true,
  },
  audioTrackType: {
    type: String,
    default: "",
  },
  noteItemsMap: {
    type: Object,
    default: () => new Map(),
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
  return props.width * pixelsPerTick.value(editorId.value)
})
const headerHeight = ref(18)
const startPosition = computed(() => {
  return props.startPosition * pixelsPerTick.value(editorId.value)
})

const { selectedTrackItemId, updateSelectedTrackItemId } = inject(
  "selectedTrackItemId",
)
const trackItemContainerRef = useTemplateRef("trackItemContainerRef")
const subTrackRegionRef = useTemplateRef("subTrackRegionRef")
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

const menu = ref([
  {
    value: "rename",
    label: "Rename Region",
    clickHandler() {
      subTrackRegionRef.value.focus()
      subTrackRegionRef.value.select()
    },
  },
  {
    value: "export",
    label: "Export Region",
    children: [
      {
        value: "midi",
        label: "As MIDI",
        clickHandler() {
          generateMidTrack({
            audioTrackId: props.audioTrackId,
            workspaceId: props.workspaceId,
            trackInfo: {
              name: props.trackName,
            },
          })
        },
      },
    ],
  },
  {
    value: "delete",
    label: "Delete",
    clickHandler() {
      const audioTrackId = props.audioTrackId
      const workspaceId = props.workspaceId
      const subTrackItemId = props.id
      disPatchDeleteSubTrackEvent({ audioTrackId, workspaceId, subTrackItemId })
    },
  },
])

function modifySubTrackName(event) {
  const audioTrackId = props.audioTrackId
  const newName = sanitizeInput(event.target.value)
  updateSubTrackItemInfo({
    audioTrackId: audioTrackId,
    subTrackItemId: props.id,
    subTrackName: newName,
  })
  updateWorkspaceInfo({
    audioTrackId,
    workspaceId: props.workspaceId,
    workspaceName: newName,
  })
}
const debouncedModifySubTrackName = debounce(modifySubTrackName, 100)
</script>

<template>
  <ContextMenu :menu="menu">
    <div
      class="track-item-container"
      :class="selectedTrackItemId === id ? 'selected' : ''"
      ref="trackItemContainerRef"
      :data-track-item-id="id"
    >
      <div
        class="stretch-handle"
        :style="{
          left: 0,
        }"
      >
        <div class="copy"></div>
        <div class="stretch"></div>
      </div>
      <div class="track-item">
        <p class="track-name" @mousedown.stop="() => {}">
          <input
            ref="subTrackRegionRef"
            type="text"
            :value="trackName"
            class="sub-track-name"
            @input="debouncedModifySubTrackName"
          />
        </p>
        <div class="mix-content-thumbnail">
          <MixTrackItemThumbnail
            v-if="audioTrackType === AUDIO_TRACK_ENUM.VIRTUAL_INSTRUMENTS"
            :id="id"
            :width="width"
            :height="height - headerHeight"
            :note-items-map="noteItemsMap"
          ></MixTrackItemThumbnail>
          <WaveformDiagram
            v-else-if="audioTrackType === AUDIO_TRACK_ENUM.VOICE"
            :id="id"
          ></WaveformDiagram>
        </div>
      </div>
      <div
        class="stretch-handle"
        :style="{
          right: 0,
        }"
      >
        <div class="copy"></div>
        <div class="stretch"></div>
      </div>
    </div>
  </ContextMenu>
</template>

<style scoped>
.track-item-container {
  --track-item-start-position: v-bind(startPosition + "px");
  --main-color: v-bind(mainColor);
  --header-bg-color: v-bind(trackCopyStretchHandleBgColor);
  --main-bg-color: v-bind(mixContentThumbnailBgColor);
  --main-color-mix-value: v-bind(mainColor + "EE");
  --header-color-mix-value: var(--main-color);
  --header-height: v-bind(headerHeight + "px");
  --track-item-min-width: 0;
  --container-width: v-bind(width + "px");
  --container-height: v-bind(height + "px");
  --stretch-handle-width: 5px;
  position: absolute;
  display: flex;
  width: var(--container-width);
  height: var(--container-height);
  overflow: hidden;
  border-radius: 4px;
  transform: translateX(var(--track-item-start-position));
}
.stretch-handle {
  position: absolute;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 5px;
  height: 100%;
  z-index: 10;
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
  padding-left: var(--stretch-handle-width);
  color: #ffffff;
  font-size: 12px;
  font-weight: bold;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  background-color: var(--header-bg-color);
}
.sub-track-name {
  display: block;
  width: 100%;
  height: 100%;
  white-space: nowrap;
  text-overflow: ellipsis;
  background: transparent;
  font-size: 12px;
  font-weight: bold;
  color: #ffffff;
}
.sub-track-name:focus {
  background: #e3e9ed;
  color: #000000;
}

.mix-content-thumbnail {
  width: 100%;
  height: calc(var(--container-height) - var(--header-height));
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
