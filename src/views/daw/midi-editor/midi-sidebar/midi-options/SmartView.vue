<script setup>
import { inject, ref } from "vue"

const mainColor = inject("mainColor")
const isSmart = ref(false)
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
      <el-select
        v-model="value"
        placeholder="Select"
        size="small"
        style="width: 50px"
        effect="dark"
      >
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-select
        v-model="value"
        placeholder="Select"
        size="small"
        style="width: 100px"
        effect="dark"
      >
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
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
