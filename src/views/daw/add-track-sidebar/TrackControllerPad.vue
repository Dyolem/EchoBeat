<script setup>
import ContextMenu from "@/views/daw/components/context-menu/ContextMenu.vue"
import { computed, inject, ref, useTemplateRef } from "vue"
import StereoPannerButton from "@/views/daw/add-track-sidebar/StereoPannerButton.vue"
import AudioTrackVolume from "@/views/daw/add-track-sidebar/AudioTrackVolume.vue"
import { generateMidTrack } from "@/core/audio/generateMidFile.js"
import { disPatchDeleteAudioTrackEvent } from "@/core/custom-event/deleteAudioTrack.js"
import { useMixTrackEditorStore } from "@/store/daw/mix-track-editor/index.js"
import { sanitizeInput } from "@/utils/sanitizeInput.js"

const mixTrackEditorStore = useMixTrackEditorStore()
const { updateMixTrackInfo } = mixTrackEditorStore
const audioTrackNameRef = useTemplateRef("audioTrackNameRef")
const props = defineProps({
  id: {
    type: [String, Number],
    required: true,
  },
  serialNumbering: {
    type: Number,
    required: true,
  },
  audioTrackName: {
    type: String,
    default: "",
  },
  mainColor: {
    type: String,
    default: "#1E90FF",
  },
  height: {
    type: Number,
    default: 90,
  },
})
const { selectedAudioTrackId, updateSelectedAudioTrackId } = inject(
  "selectedAudioTrackId",
  {},
)
const serialNumbering = computed(() => {
  const serialNumbering = props.serialNumbering + 1
  if (serialNumbering >= 0 && serialNumbering < 10) return `0${serialNumbering}`
  else return serialNumbering
})

const emit = defineEmits(["update:move"])

const audioTrackControllerMenu = ref([
  {
    value: "rename",
    label: "Rename",
    clickHandler() {
      audioTrackNameRef.value.focus()
      audioTrackNameRef.value.select()
    },
  },
  {
    value: "move-option",
    label: "",
    group: [
      {
        value: "move up",
        label: "Move Up",
        clickHandler() {
          emit("update:move", {
            direction: -1,
            audioTrackId: props.id,
            order: props.serialNumbering,
          })
        },
      },
      {
        value: "move down",
        label: "Move Down",
        clickHandler() {
          emit("update:move", {
            direction: 1,
            audioTrackId: props.id,
            order: props.serialNumbering,
          })
        },
      },
    ],
  },
  {
    value: "midi",
    label: "As MIDI",
    clickHandler() {
      generateMidTrack({
        audioTrackId: props.id,
        trackInfo: {
          name: props.audioTrackName,
        },
      })
    },
  },
  {
    value: "delete",
    label: "Delete",
    clickHandler() {
      const audioTrackId = props.id
      disPatchDeleteAudioTrackEvent({ audioTrackId })
    },
  },
])

function modifyAudioTrackName(event) {
  updateMixTrackInfo({
    audioTrackId: props.id,
    trackName: sanitizeInput(event.target.value),
  })
}
</script>

<template>
  <ContextMenu :menu="audioTrackControllerMenu">
    <template #default>
      <div
        class="track-controller-pad"
        @click="() => updateSelectedAudioTrackId(id)"
        :class="selectedAudioTrackId === id ? 'selected' : ''"
      >
        <div class="controller-nav">
          <div class="track-info">
            <echo-fluent:midi-24-regular
              class="track-type-icon"
            ></echo-fluent:midi-24-regular>

            <span class="track-number">{{ serialNumbering }}</span>

            <span class="track-name">
              <input
                ref="audioTrackNameRef"
                type="text"
                :value="audioTrackName"
                @change="modifyAudioTrackName"
                class="track-name-input"
            /></span>
          </div>
          <div class="control-features">
            <echo-mi:options-vertical
              class="context-icon"
            ></echo-mi:options-vertical>

            <div class="play-mode">
              <button class="mute gain-button">M</button>
              <button class="solo gain-button">S</button>
            </div>
            <i class="collapse-track-icon">
              <echo-ooui:collapse></echo-ooui:collapse>
            </i>
          </div>
        </div>
        <div class="gain-controller">
          <AudioTrackVolume
            :main-color="mainColor"
            :audio-track-id="id"
          ></AudioTrackVolume>
          <StereoPannerButton :audio-track-id="id"></StereoPannerButton>
        </div>
      </div>
    </template>
  </ContextMenu>
</template>

<style scoped>
.track-controller-pad {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 0 4px;
  position: relative;
  width: 100%;
  height: v-bind(height + "px");
  background-color: hsl(0, 0%, 8%);
}
.selected {
  box-shadow: v-bind("`inset -4px 0 0 0 ${mainColor}`");
  background-color: hsl(0, 0%, 12%);
}
.controller-nav {
  display: flex;
  justify-content: space-between;
  width: 100%;
  height: 30px;
}
.track-name {
  width: fit-content;
}
.track-name-input {
  max-width: 120px;
  display: block;
  background: transparent;
  color: #ffffff;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.track-info {
  display: flex;
  height: 100%;
  align-items: center;
  font-size: 14px;
  color: #ffffff;
  gap: 5px;
  user-select: none;
}
.track-type-icon {
  font-size: 16px;
  color: v-bind(mainColor);
}
.control-features {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 100%;
  color: #ffffff;
}
.context-icon {
  width: 16px;
  height: 16px;
  border-radius: 50%;
}
.context-icon:hover {
  cursor: pointer;
}
.collapse-track-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 20px;
  height: 20px;
  transform: rotate(180deg);
  font-size: 12px;
  border-radius: 50%;
  background-color: hsl(0, 0%, 25%);
  &:hover {
    cursor: pointer;
  }
}
.collapse-track-icon:hover {
  cursor: pointer;
}
.play-mode {
  display: flex;
  justify-content: space-between;
  padding: 2px 2px;
  gap: 8px;
  background-color: hsl(0, 0%, 25%);
  border-radius: 10px;
}
.gain-button {
  border: none;
  width: 24px;
  height: 20px;
  border-radius: 8px;
  color: inherit;
  background-color: inherit;
  &:hover {
    background-color: hsl(0, 0%, 35%);
    cursor: pointer;
  }
}
.gain-button:hover {
  background-color: hsl(0, 0%, 35%);
  cursor: pointer;
}
.gain-controller {
  display: flex;
  align-items: center;
}
</style>
