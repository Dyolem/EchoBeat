<template>
  <!-- 默认展示导航栏 -->
  <div class="header-container">
    <header-nav></header-nav>
  </div>
  <div class="classification">
    <router-view></router-view>
  </div>
</template>

<script setup>
import headerNav from './header-nav.vue'



</script>

<style scoped>
.header-container {
  position: relative;
  display: flex;
  justify-content: center;
  z-index: 100;
}

.classification {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
