<script setup></script>

<template>
  <div class="global-menu-container">
    <el-menu
      default-active="2"
      class="el-menu-vertical-demo"
      :collapse="true"
      @open="handleOpen"
      @close="handleClose"
    >
      <el-sub-menu index="1">
        <template #title>
          <echo-material-symbols:menu-rounded
            class="menu-icon"
          ></echo-material-symbols:menu-rounded>
          <span>Navigator One</span>
        </template>
        <el-menu-item-group>
          <template #title><span>Group One</span></template>
          <el-menu-item index="1-1">item one</el-menu-item>
          <el-menu-item index="1-2">item two</el-menu-item>
        </el-menu-item-group>
        <el-menu-item-group title="Group Two">
          <el-menu-item index="1-3">item three</el-menu-item>
        </el-menu-item-group>
        <el-sub-menu index="1-4">
          <template #title><span>item four</span></template>
          <el-menu-item index="1-4-1">item one</el-menu-item>
        </el-sub-menu>
      </el-sub-menu>
    </el-menu>
  </div>
</template>

<style scoped>
.global-menu-container :deep(.el-menu--vertical) {
  --el-menu-item-height: 50px;
  --el-menu-bg-color: none;
  --el-menu-hover-text-color: none;
  --el-menu-hover-bg-color: none;
  border: none;
}
.menu-icon {
  color: #ffffff;
  font-size: 1.5rem;
}
</style>
