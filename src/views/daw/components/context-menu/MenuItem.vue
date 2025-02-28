<script setup>
import { defineOptions } from "vue"

// 设置组件名称用于递归
defineOptions({
  name: "MenuItem",
})

defineProps({
  item: {
    type: Object,
    required: true,
  },
})
</script>

<!-- MenuItem.vue 子组件 -->
<template>
  <template v-if="item.children?.length">
    <el-sub-menu :index="item.value" :disabled="item.disable">
      <template #title>
        <el-icon v-if="item.icon">
          <component :is="item.icon" />
        </el-icon>
        <div>{{ item.label }}</div>
      </template>
      <MenuItem
        v-for="child in item.children"
        :key="child.index"
        :item="child"
      />
    </el-sub-menu>
  </template>
  <el-menu-item v-else :index="item.value" :disabled="item.disable">
    <el-icon v-if="item.icon">
      <component :is="item.icon" />
    </el-icon>
    <div>{{ item.label }}</div>
  </el-menu-item>
</template>
