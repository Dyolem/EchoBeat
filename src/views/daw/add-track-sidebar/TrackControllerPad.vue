<script setup>
import ContextMenu from "@/views/daw/components/context-menu/ContextMenu.vue"
import { computed, inject } from "vue"

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
  if (props.serialNumbering >= 0 && props.serialNumbering < 10)
    return `0${props.serialNumbering}`
  else return props.serialNumbering
})
</script>

<template>
  <ContextMenu>
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
            <span class="track-name">{{ audioTrackName }}</span>
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
      </div>
    </template>
  </ContextMenu>
</template>

<style scoped>
.track-controller-pad {
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
  max-width: 120px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
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
</style>
