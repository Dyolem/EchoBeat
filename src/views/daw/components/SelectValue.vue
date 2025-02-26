<script setup>
import { computed } from "vue"
const enumValue = defineModel("options", {
  type: Array,
  default: () => ["1", "2", "3"],
})
const selectedValue = defineModel("selectedValue", {
  type: Number,
  default: "",
})
const selectedId = computed(() => {
  return selectedValue.value
})
function selectValue(event) {
  selectedValue.value = Number(event.target.textContent)
}
</script>

<template>
  <div class="enum-value-container" @click="selectValue">
    <span
      class="enum-value"
      :class="selectedId === value ? 'selected-value' : ''"
      v-for="value in enumValue"
      :key="value"
      >{{ value }}</span
    >
  </div>
</template>

<style scoped>
.enum-value-container {
  display: flex;
  flex-direction: column;
  width: fit-content;
  height: fit-content;
}
.enum-value {
  padding: 6px 20px;
}
.enum-value:not(.selected-value):hover {
  background-color: rgba(0, 0, 0, 0.5);
  color: #ffffff;
}
.selected-value {
  background-color: #2f93f6;
}
</style>
