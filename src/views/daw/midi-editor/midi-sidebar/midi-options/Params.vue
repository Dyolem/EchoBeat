<script setup>
import { computed, ref } from "vue"
import MixEditorButton from "@/views/daw/mix-editor-button/MixEditorButton.vue"
import { NOTE_VALUE_OPTIONS } from "@/constants/daw/index.js"
const noteValueSet = ref(NOTE_VALUE_OPTIONS)
const noteValueOptions = computed(() => {
  return Object.keys(noteValueSet.value).map((noteValueLabel) => {
    return { label: noteValueLabel, value: NOTE_VALUE_OPTIONS[noteValueLabel] }
  })
})
const selectedNoteValue = ref("")
</script>

<template>
  <div class="params-controller">
    <MixEditorButton circle size="small" class="legato-button"
      >Legato</MixEditorButton
    >
    <MixEditorButton circle size="small" class="Humanize-button"
      >Humanize</MixEditorButton
    >
    <MixEditorButton circle size="small" class="note-value-button">
      <div class="note-value-selector">
        <el-select
          v-model="selectedNoteValue"
          placeholder="Select"
          size="small"
          style="width: 100px"
          effect="dark"
        >
          <el-option
            v-for="item in noteValueOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>
    </MixEditorButton>
    <MixEditorButton circle size="small" class="quantize-button"
      >Quantize</MixEditorButton
    >
  </div>
</template>

<style scoped>
.params-controller {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: space-between;
}
</style>
