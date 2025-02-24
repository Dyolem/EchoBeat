<script setup>
import MixEditorButton from "@/views/daw/mix-editor-button/MixEditorButton.vue"
import MixEditorButtonGroup from "@/views/daw/mix-editor-button/MixEditorButtonGroup.vue"
</script>

<template>
  <MixEditorButtonGroup size="large">
    <MixEditorButton circle>
      <i>
        <echo-f7:metronome class="metronome-icon"></echo-f7:metronome>
      </i>
    </MixEditorButton>
    <MixEditorButton :padding="4">
      <i class="metronome-settings">
        <echo-ooui:collapse></echo-ooui:collapse> </i
    ></MixEditorButton>
    <MixEditorButton>
      <div class="bpm">
        <input id="bpm-number" type="number" value="1" min="40" max="240" />
        <span class="unit">bpm</span>
      </div>
    </MixEditorButton>
    <MixEditorButton circle>
      <div class="time-signature">
        <span class="beats-per-measure">4</span>
        <span>/</span>
        <span class="note-denominator">4</span>
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
</style>
