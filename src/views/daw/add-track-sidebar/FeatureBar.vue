<script setup></script>

<template>
  <div class="feature-bar">
    <button class="add-track-button" title="Add Track (Shift + T)">
      <echo-tabler:plus class="add-icon"></echo-tabler:plus>
      Add Track
    </button>
  </div>
</template>

<style scoped>
.feature-bar {
  display: flex;
  align-items: center;
  width: 100%;
  height: 50px;
  background-color: pink;
}
.add-track-button {
  --button-height: 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 120px;
  height: var(--button-height);
  padding: 0 10px;
  border-radius: calc(var(--button-height) / 2);
  border: none;
  background-color: #191b1e;
  color: #ffffff;
}
.add-track-button:hover {
  background-color: #202428;
  cursor: pointer;
}
.add-icon {
  color: #fff;
  font-size: 16px;
}
</style>
