<script setup></script>

<template>
  <div class="logo">
    <echo-emojione-monotone:musical-score
      class="logo-icon"
    ></echo-emojione-monotone:musical-score>
    <span class="logo-text">EchoBeat</span>
  </div>
</template>

<style scoped>
.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #ffffff;
}
.logo-icon {
  font-size: 1.6rem;
}
.logo-text {
  font-weight: 600;
}
</style>
