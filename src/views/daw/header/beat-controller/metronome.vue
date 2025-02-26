<script setup>
import MixEditorButton from "@/views/daw/mix-editor-button/MixEditorButton.vue"
import MixEditorButtonGroup from "@/views/daw/mix-editor-button/MixEditorButtonGroup.vue"
import { useBeatControllerStore } from "@/store/daw/beat-controller/index.js"
import {
  BEATS_PER_MEASURE_ENUM,
  MAX_BPM,
  MIN_BPM,
  NOTE_VALUE_DENOMINATOR_ENUM,
} from "@/constants/daw/index.js"
import SelectValue from "@/views/daw/header/beat-controller/SelectValue.vue"
const beatControllerStore = useBeatControllerStore()
function validateBpm(event) {
  const newBpm = event.target.value
  beatControllerStore.updateBpm(newBpm)
}
</script>

<template>
  <MixEditorButtonGroup size="large">
    <MixEditorButton circle>
      <i>
        <echo-f7:metronome class="metronome-icon"></echo-f7:metronome>
      </i>
    </MixEditorButton>
    <MixEditorButton>
      <i class="metronome-settings">
        <echo-ooui:collapse></echo-ooui:collapse> </i
    ></MixEditorButton>
    <MixEditorButton>
      <div class="bpm">
        <input
          id="bpm-number"
          type="number"
          :value="beatControllerStore.bpm"
          :min="MIN_BPM"
          :max="MAX_BPM"
          @blur="validateBpm"
        />
        <span class="unit">bpm</span>
      </div>
    </MixEditorButton>
    <MixEditorButton circle>
      <div class="time-signature">
        <el-popover
          trigger="hover"
          popper-class="custom-popper"
          :teleported="false"
          effect="dark"
        >
          <template #reference>
            <span class="beats-per-measure">{{
              beatControllerStore.beatsPerMeasure
            }}</span>
          </template>
          <SelectValue
            :options="BEATS_PER_MEASURE_ENUM"
            v-model:selected-value="beatControllerStore.beatsPerMeasure"
          ></SelectValue>
        </el-popover>
        <span>/</span>
        <el-popover
          trigger="hover"
          popper-class="custom-popper"
          :teleported="false"
          effect="dark"
        >
          <template #reference>
            <span class="note-denominator">{{
              beatControllerStore.noteValueDenominator
            }}</span>
          </template>
          <SelectValue
            :options="NOTE_VALUE_DENOMINATOR_ENUM"
            v-model:selected-value="beatControllerStore.noteValueDenominator"
          ></SelectValue>
        </el-popover>
      </div>
    </MixEditorButton>
  </MixEditorButtonGroup>
</template>

<style scoped>
.metronome,
.bpm,
.time-signature {
  height: 100%;
  display: flex;
  align-items: center;
  gap: 6px;
}
.metronome-icon {
  font-size: 20px;
}
.metronome-settings {
  transform: rotate(180deg);
}
.bpm {
  padding: 0 10px;
  gap: 4px;
}
.bpm span {
  font-size: 12px;
}
.bpm input {
  background: transparent;
  padding: 0;
  text-align: center;
  width: 30px;
  font-size: 16px;
  color: #ffffff;
}
/* 隐藏输入框的步进按钮 */
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type="number"] {
  -moz-appearance: textfield;
}
:deep(.custom-popper) {
  width: auto !important;
  min-width: 0;
  padding: 0;
}
.note-denominator,
.beats-per-measure {
  padding: 2px 8px;
}
</style>
