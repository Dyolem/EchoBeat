<script setup>
import { inject, ref, computed } from "vue"
import { MUSICAL_SCALES, NOTES_TABLE } from "@/constants/daw/index.js"
import MixEditorButtonGroup from "@/views/daw/mix-editor-button/MixEditorButtonGroup.vue"
import MixEditorButton from "@/views/daw/mix-editor-button/MixEditorButton.vue"

const pitchSet = ref(NOTES_TABLE)
const scaleSet = ref(MUSICAL_SCALES)
const mainColor = inject("mainColor")
const isSmart = ref(false)
const pitchOptions = computed(() => {
  return pitchSet.value.map((pitchName) => {
    return { label: pitchName, value: pitchName }
  })
})
const musicalScalesOptions = computed(() => {
  return scaleSet.value.map((scaleName) => ({
    label: scaleName,
    value: scaleName,
  }))
})
const selectedPitchName = ref(pitchSet.value[0])
const selectedScaleName = ref(scaleSet.value[0])
</script>

<template>
  <div class="smart-view-controller">
    <div class="slider">
      <el-switch
        v-model="isSmart"
        size="small"
        :style="{
          '--el-switch-on-color': mainColor,
          '--el-switch-off-color': `${mainColor}77`,
        }"
      />
    </div>
    <div class="pitch-name-checkbox">
      <MixEditorButtonGroup size="small">
        <MixEditorButton circle>
          <el-select
            v-model="selectedPitchName"
            placeholder="Pitch Name"
            size="small"
            style="width: 50px"
            effect="dark"
          >
            <el-option
              v-for="item in pitchOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </MixEditorButton>
        <MixEditorButton circle>
          <el-select
            v-model="selectedScaleName"
            placeholder="Musical Scales"
            size="small"
            style="width: 150px"
            effect="dark"
          >
            <el-option
              v-for="item in musicalScalesOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </MixEditorButton>
      </MixEditorButtonGroup>
    </div>
  </div>
</template>

<style scoped>
.smart-view-controller {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
