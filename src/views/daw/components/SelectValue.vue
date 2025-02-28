<script setup>
import { computed } from "vue"
const props = defineProps({
  options: {
    type: Array,
    default: () => ["1", "2", "3"],
  },
})
const selectedValue = defineModel("selectedValue", {
  type: [Number, String],
  default: "",
})
const selectedId = computed(() => {
  return selectedValue.value
})
function selectValue(event) {
  const newValue = event.target.textContent
  selectedValue.value =
    typeof selectedValue.value === "number" ? Number(newValue) : newValue
}
</script>

<template>
  <div class="enum-value-container" @click="selectValue">
    <span
      class="enum-value"
      :class="selectedId === value ? 'selected-value' : ''"
      v-for="value in options"
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
  color: #ffffff;
}
.enum-value:not(.selected-value):hover {
  background-color: rgba(0, 0, 0, 0.5);
  color: #ffffff;
}
.selected-value {
  background-color: #2f93f6;
}
</style>
