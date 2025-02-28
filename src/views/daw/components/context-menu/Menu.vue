<script setup>
import MenuItem from "./MenuItem.vue"

const props = defineProps({
  menuData: {
    type: Array,
    required: true,
    default: () => [],
  },
  activeIndex: {
    type: String,
    default: "",
  },
  mode: {
    type: String,
    default: "vertical",
  },
})
const emit = defineEmits(["select"])
const handleSelect = (index) => {
  emit("select", index)
  // 路由跳转逻辑
}
</script>

<!-- 父组件 -->
<template>
  <div class="custom-menu-container">
    <el-menu
      text-color="#fff"
      background-color="#191b1e"
      :mode="mode"
      @select="handleSelect"
      collapse
      class="el-menu-vertical-demo"
    >
      <MenuItem v-for="item in menuData" :key="item.label" :item="item" />
    </el-menu>
  </div>
</template>

<style scoped>
.custom-menu-container {
  border-radius: 6px;
}
.custom-menu-container :deep(.el-menu-vertical-demo) {
  border-right: none;
  width: fit-content;
}
:global(.el-menu--popup) {
  min-width: 0;
}
:global(.el-popper.is-light) {
  border: none;
  background: none;
}
:global(.el-menu-item:hover) {
  background: #3f4143;
}
:global(.el-menu) {
  overflow: hidden;
  padding: 0;
  border-radius: 6px;
}
</style>
