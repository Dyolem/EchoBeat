<script setup>
import { storeToRefs } from "pinia"
import { inject, computed } from "vue"
import MixEditorButton from "@/views/daw/mix-editor-button/MixEditorButton.vue"
import { VELOCITY_SCALE } from "@/constants/daw/index.js"
import { useNoteItemStore } from "@/store/daw/note-editor/noteItem.js"
import { useSelectionStore } from "@/store/daw/selection.js"
const noteItemsStore = useNoteItemStore()
const { updateNoteItemVelocity, getSelectedNoteAverageVelocity } =
  noteItemsStore
const selectionStore = useSelectionStore()
const { selectedNotesIdSet } = storeToRefs(selectionStore)

const [minVelocity, maxVelocity] = VELOCITY_SCALE
const averageVelocity = computed({
  get: () => {
    return getSelectedNoteAverageVelocity(selectedNotesIdSet.value)
  },
  set: (newAverageVelocity) => {
    updateNoteItemVelocity({
      velocity: newAverageVelocity,
      noteIdSet: selectedNotesIdSet.value,
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
</script>

<template>
  <div class="velocity-controller-pad">
    <div class="velocity-value">
      <div class="velocity-title">
        <span>Velocity</span>
        <span>{{ Math.round(averageVelocity) }}</span>
      </div>
      <MixEditorButton circle size="small" class="randomize-button"
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
