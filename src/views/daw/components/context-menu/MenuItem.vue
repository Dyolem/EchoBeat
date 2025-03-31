<script setup>
import { defineOptions } from "vue"
import { Icon } from "@iconify/vue"

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
        <div class="title">
          <Icon
            v-if="item.icon"
            :icon="item.icon.name"
            :style="item.icon.style ?? {}"
            class="icon"
          ></Icon>
          <span>{{ item.label }}</span>
        </div>
      </template>
      <MenuItem
        v-for="child in item.children"
        :key="child.index"
        :item="child"
      />
    </el-sub-menu>
  </template>
  <template v-else-if="item.group">
    <el-menu-item-group
      :index="item.value"
      :disabled="item.disable"
      :class="!!item.label ? '' : 'custom-group'"
    >
      <template #title>
        <div class="title" v-if="!!item.label">
          <Icon
            v-if="item.icon"
            :icon="item.icon.name"
            :style="item.icon.style ?? {}"
            class="icon"
          ></Icon>
          <span>{{ item.label }}</span>
        </div>
      </template>
      <MenuItem v-for="group in item.group" :key="group.index" :item="group" />
    </el-menu-item-group>
  </template>
  <el-menu-item
    v-else
    :index="item.value"
    :disabled="item.disable"
    @click="(menuInstance) => item.clickHandler?.(menuInstance)"
  >
    <div class="title">
      <Icon
        v-if="item.icon"
        :icon="item.icon.name"
        :style="item.icon.style ?? {}"
        class="icon"
      ></Icon>
      <span>{{ item.label }}</span>
    </div>
  </el-menu-item>
</template>
<style scoped>
.title {
  font-size: 14px;
  font-weight: 500;
  display: flex;
  gap: 14px;
  align-items: center;
  color: #ffffff;
}
.icon {
  font-size: 18px;
  font-weight: 500;
  color: #ffffff;
}
.custom-group :deep(.el-menu-item-group__title) {
  padding-block: 0;
}
</style>
