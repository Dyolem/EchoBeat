<script setup>
import ContextMenu from "@/views/daw/components/context-menu/ContextMenu.vue"
import { computed, inject, ref, useTemplateRef } from "vue"
import StereoPannerButton from "@/views/daw/add-track-sidebar/StereoPannerButton.vue"
import AudioTrackVolume from "@/views/daw/add-track-sidebar/AudioTrackVolume.vue"
import { generateMidTrack } from "@/core/audio/generateMidFile.js"
import { disPatchDeleteAudioTrackEvent } from "@/core/custom-event/deleteAudioTrack.js"
import { useMixTrackEditorStore } from "@/store/daw/mix-track-editor/index.js"
import { sanitizeInput } from "@/utils/sanitizeInput.js"
import { useAudioStore } from "@/store/daw/audio/index.js"
import { Icon } from "@iconify/vue"

const mixTrackEditorStore = useMixTrackEditorStore()
const { updateMixTrackInfo } = mixTrackEditorStore
const audioStore = useAudioStore()
const {
  specifySoloAudioTrack,
  muteSpecifiedAudioTrack,
  recoverMutedAudioTrack,
  cancelSoloAudioTrack,
} = audioStore
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
  audioTrackIcon: {
    type: String,
    default: "",
  },
  audioTrackType: {
    type: String,
    default: "",
  },
})
const { selectedAudioTrackId, updateSelectedAudioTrackId } = inject(
  "selectedAudioTrackId",
  {},
)

const { isMuted, isSolo, filterEffect } = inject("playableAudioTrack")

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

function muteHandler() {
  const audioTrackId = props.id
  if (isMuted.value(audioTrackId)) {
    recoverMutedAudioTrack({ audioTrackId })
  } else {
    muteSpecifiedAudioTrack({ audioTrackId })
  }
}

function soloHandler() {
  const audioTrackId = props.id
  if (isSolo.value(audioTrackId)) {
    cancelSoloAudioTrack()
  } else {
    specifySoloAudioTrack({ audioTrackId })
  }
}

const { isFolded, addFoldedAudioTrack, cancelSpecifiedFoldedAudioTrack } =
  inject("foldedAudioTrack")

function foldAudioTrack(audioTrackId) {
  if (isFolded.value(audioTrackId)) {
    cancelSpecifiedFoldedAudioTrack({ audioTrackId })
  } else {
    addFoldedAudioTrack({ audioTrackId })
  }
}
</script>

<template>
  <ContextMenu :menu="audioTrackControllerMenu">
    <template #default="{ activeTriggerContextMenu }">
      <div
        class="track-controller-pad"
        @click="() => updateSelectedAudioTrackId(id)"
        :style="{
          filter: filterEffect(id),
        }"
        :class="{
          selected: selectedAudioTrackId === id,
        }"
      >
        <div class="controller-nav">
          <div class="track-info">
            <Icon :icon="audioTrackIcon" class="track-type-icon"></Icon>

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
            <div @click="activeTriggerContextMenu">
              <echo-mi:options-vertical
                class="context-icon"
              ></echo-mi:options-vertical>
            </div>

            <div class="play-mode">
              <button class="mute gain-button" @click="muteHandler">M</button>
              <button
                class="solo gain-button"
                :class="isSolo(id) ? 'solo-ratio' : ''"
                @click="soloHandler"
              >
                S
              </button>
            </div>
            <div class="fold-exchange">
              <i
                class="collapse-track-icon"
                :class="{
                  'is-folded': isFolded(id),
                }"
                @click="foldAudioTrack(id)"
              >
                <echo-ooui:collapse></echo-ooui:collapse>
              </i>
            </div>
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
  --pad-height: v-bind(height + "px");
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 0 10px;
  position: relative;
  width: 100%;
  height: var(--pad-height);
  background-color: hsl(0, 0%, 8%);
  transition: all 0.1s ease-in-out;
}
.selected {
  box-shadow: v-bind("`inset -4px 0 0 0 ${mainColor}`");
  background-color: hsl(0, 0%, 12%);
}
.controller-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 4px 0;
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
  transition: all 0.1s ease-in-out;
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
.is-folded {
  transform: rotate(90deg);
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
  cursor: pointer;
  &:not(.solo-ratio):hover {
    background-color: hsl(0, 0%, 35%);
  }
}
.gain-button:not(.solo-ratio):hover {
  background-color: hsl(0, 0%, 35%);
  cursor: pointer;
}
.gain-controller {
  display: flex;
  align-items: center;
}
.solo-ratio {
  background-color: #ffaf13;
  color: #000000;
}
</style>
