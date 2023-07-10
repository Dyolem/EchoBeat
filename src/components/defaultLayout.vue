<template>
    <!-- 默认展示导航栏 -->
    <div>
      <div class="mid-header mid">
        <header-nav></header-nav>
      </div>

      <router-view></router-view>
    </div>
  </template>

  <script setup>
  import headerNav from './header-nav.vue'



</script>

<style scoped>


</style>