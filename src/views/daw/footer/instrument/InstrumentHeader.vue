<script setup>
import { computed, inject } from "vue"
import MixEditorButton from "@/views/daw/mix-editor-button/MixEditorButton.vue"
import MixEditorButtonGroup from "@/views/daw/mix-editor-button/MixEditorButtonGroup.vue"
import {
  generateSoundOptions,
  getInstrumentInfoBySoundName,
} from "@/constants/daw/instruments.js"
import { useMixTrackEditorStore } from "@/store/daw/mix-track-editor/index.js"
import { useAudioGeneratorStore } from "@/store/daw/audio/audioGenerator.js"
import { useTrackRulerStore } from "@/store/daw/trackRuler/timeLine.js"
import { pause } from "@/core/audio/player.js"
import { useAudioStore } from "@/store/daw/audio/index.js"

const audioStore = useAudioStore()
const audioGeneratorStore = useAudioGeneratorStore()
const { addSoundBuffer } = audioGeneratorStore
const trackRulerStore = useTrackRulerStore()
const mixTrackEditorStore = useMixTrackEditorStore()
const { selectedAudioTrackId } = inject("selectedAudioTrackId")

const currentAudioTrackSound = computed({
  get: () => {
    const instrument = mixTrackEditorStore.mixTracksMap.get(
      selectedAudioTrackId.value,
    )?.instrument
    if (!instrument) return []
    return [instrument.customInstrumentType, instrument.sound]
  },
  set: (selectedArr) => {
    if (!selectedArr) return
    const audioTrack = mixTrackEditorStore.mixTracksMap.get(
      selectedAudioTrackId.value,
    )
    if (!audioTrack) return
    const instrument = audioTrack.instrument
    const [customInstrumentType, sound] = selectedArr
    const { name, family, number } = getInstrumentInfoBySoundName({
      soundName: sound,
    })
    if (number === -1) {
      audioTrack.channel = 9
    }
    instrument.customInstrumentType = customInstrumentType
    instrument.sound = sound
    instrument.family = family
    instrument.name = name
    instrument.number = number
  },
})
const audioTrackCategoryOptions = generateSoundOptions()

function changeAudioTrackSound(value) {
  if (trackRulerStore.isPlaying) {
    pause()
  }
  addSoundBuffer({ audioContext: audioStore.audioContext, soundName: value[1] })
  console.log(value)
}
const instrumentFamily = computed(() => {
  return mixTrackEditorStore.mixTracksMap.get(selectedAudioTrackId.value)
    ?.instrument.customInstrumentType
})
</script>

<template>
  <div class="header-tool-container">
    <div class="left-tool">
      <div class="instrument-category">{{ instrumentFamily }}</div>
      <MixEditorButton size="small" circle>
        <div class="category-cascader">
          <el-cascader
            v-model="currentAudioTrackSound"
            @change="changeAudioTrackSound"
            popper-class="custom-instrument-category-cascader"
            :options="audioTrackCategoryOptions"
            size="small"
          />
        </div>
      </MixEditorButton>
      <MixEditorButtonGroup size="small">
        <MixEditorButton circle>
          <echo-ep:arrow-left></echo-ep:arrow-left>
        </MixEditorButton>
        <MixEditorButton circle>
          <echo-ep:arrow-right></echo-ep:arrow-right
        ></MixEditorButton>
      </MixEditorButtonGroup>
    </div>
  </div>
</template>

<style scoped>
.header-tool-container {
  height: 50px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: nowrap;
  overflow: auto;
  user-select: none;
}
.left-tool {
  --height: 32px;
  display: flex;
  align-items: center;
  gap: 10px;
  height: var(--height);
  padding: 4px 24px;
  border-radius: calc(var(--height) / 2);
}
.current-instrument-sound {
  padding: 0 80px;
  font-weight: 600;
}
.instrument-category {
  font-size: 12px;
  font-weight: 600;
}
.category-cascader :deep(.el-cascader) {
  --el-fill-color-blank: none;
  --el-input-bg-color: none;
}
.category-cascader :deep(.el-input__wrapper) {
  box-shadow: none;
}
.category-cascader :deep(.el-input__inner::placeholder) {
  color: #ffffff;
  font-weight: 600;
}
.category-cascader :deep(.el-input__inner) {
  color: #ffffff;
  font-weight: 600;
}
.category-cascader :deep(.el-input) {
  --el-input-border-color: none;
  --el-input-text-color: #ffffff;
  --el-input-hover-border-color: none;
  --el-input-focus-border-color: none;
}
</style>
<style>
.custom-instrument-category-cascader .el-cascader-panel {
  --el-cascader-menu-text-color: #ffffff;
  --el-cascader-node-background-hover: #2c3238;
  --el-cascader-menu-border: #25292f;
  font-weight: 600;
}
.custom-instrument-category-cascader .el-popper__arrow {
  --el-cascader-menu-border: 1px solid #25292f;
}
</style>
