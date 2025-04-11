<script setup>
import { storeToRefs } from "pinia"
import { computed, inject } from "vue"
import MixEditorButton from "@/views/daw/mix-editor-button/MixEditorButton.vue"
import { VELOCITY_SCALE } from "@/constants/daw/index.js"
import { useNoteItemStore } from "@/store/daw/note-editor/noteItem.js"
import { useSelectionStore } from "@/store/daw/selection.js"
import { generateNormalVelocity } from "@/core/audio/generateNormalVelocity.js"

const RANDOM_VELOCITY_SCALE = [65, 127]
const noteItemsStore = useNoteItemStore()
const { updateNoteItemVelocity, getSelectedNoteAverageVelocity } =
  noteItemsStore
const selectionStore = useSelectionStore()
const { selectedNotesIdMap } = storeToRefs(selectionStore)

const [minVelocity, maxVelocity] = VELOCITY_SCALE
const averageVelocity = computed({
  get: () => {
    return getSelectedNoteAverageVelocity(selectedNotesIdMap.value)
  },
  set: (newAverageVelocity) => {
    updateNoteItemVelocity({
      velocity: newAverageVelocity,
      noteIdSet: selectedNotesIdMap.value,
    })
  },
})
const mainColor = inject("mainColor")

const props = defineProps({
  disabled: {
    type: Boolean,
    default: true,
  },
})

function randomizeVelocity(randomScale) {
  averageVelocity.value = generateNormalVelocity(randomScale)
}
</script>

<template>
  <div class="velocity-controller-pad">
    <div class="velocity-value">
      <div class="velocity-title">
        <span>Velocity</span>
        <span>{{ Math.round(averageVelocity) }}</span>
      </div>
      <MixEditorButton
        circle
        size="small"
        class="randomize-button"
        @click="randomizeVelocity(RANDOM_VELOCITY_SCALE)"
        >Randomize</MixEditorButton
      >
    </div>
    <div class="velocity-progress-bar">
      <el-slider
        v-model="averageVelocity"
        size="large"
        :min="minVelocity"
        :max="maxVelocity"
        :disabled="disabled"
        :format-tooltip="(value) => Math.round(value)"
      />
    </div>
  </div>
</template>

<style scoped>
.velocity-value {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.velocity-title {
  display: flex;
  gap: 10px;
}
.velocity-controller-pad :deep(.el-slider) {
  --el-slider-main-bg-color: v-bind(mainColor);
  --el-slider-height: 2px;
  --el-slider-button-size: 12px;
  --el-slider-button-wrapper-offset: -16px;
}
.velocity-progress-bar {
  padding-right: 10px;
}
</style>
