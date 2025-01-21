<script setup>
const props = defineProps({
  id: {
    type: [Number, String],
    required: true,
  },

  trackWidth: {
    type: Number,
    default: 100,
  },
  trackHeight: {
    type: Number,
    default: 50,
  },
  mainColor: {
    type: String,
    default: "purple",
  },
})
const selectedId = defineModel("selectedId", {
  type: [Number, String],
  required: true,
})
</script>

<template>
  <div
    class="mix-editor-track-container"
    @click="selectedId = id"
    :class="selectedId === id ? 'selected' : ''"
  >
    <div class="track-name"></div>
    <div class="mix-content-thumbnail">
      <slot name="mix-content-thumbnail"></slot>
    </div>
  </div>
</template>

<style scoped>
.mix-editor-track-container {
  width: v-bind(trackWidth + "px");
  height: v-bind(trackHeight + "px");
  background-color: pink;
  border-radius: 4px;
}
.selected {
  outline: 1px solid #ffffff;
}
</style>
