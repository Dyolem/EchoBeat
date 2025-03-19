<script setup>
import { ref } from "vue"
const stereoPointerRotationDeg = ref(0)
</script>

<template>
  <div class="stereo-panner-button-container">
    <div class="stereo-panner-button">
      <div class="scale-mark">
        <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
          <path
            d="M33.79 27.03h.68L36.61 30h1.05l-2.2-3.01c1.02-.18 1.74-.89 1.74-1.97 0-1.29-.93-2.02-2.25-2.02H32.9v7h.89v-2.97Zm0-3.21h1.15c.8 0 1.36.42 1.36 1.2 0 .77-.56 1.22-1.36 1.22h-1.15v-2.42ZM2.21 23v7h3.6v-.83H3.1V23h-.9.01ZM35 18.5a.5.5 0 1 0-1 0 .5.5 0 0 0 1 0ZM33 10.5a.5.5 0 1 0-1 0 .5.5 0 0 0 1 0ZM28 5.5a.5.5 0 1 0-1 0 .5.5 0 0 0 1 0ZM20 3.5a.5.5 0 1 0-1 0 .5.5 0 0 0 1 0ZM12 5.5a.5.5 0 1 0-1 0 .5.5 0 0 0 1 0ZM6 10.5a.5.5 0 1 0-1 0 .5.5 0 0 0 1 0ZM4 18.5a.5.5 0 1 0-1 0 .5.5 0 0 0 1 0Z"
            fill="currentColor"
          ></path>
        </svg>
      </div>
      <div class="pointer"></div>
    </div>
  </div>
</template>

<style scoped>
.stereo-panner-button-container {
  padding: 0 16px 0 30px;
}
.stereo-panner-button {
  --stereo-panner-button-width: 24px;
  --stereo-panner-button-height: 24px;
  --pointer-rotation-deg: v-bind(stereoPointerRotationDeg + "deg");
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: var(--stereo-panner-button-width);
  height: var(--stereo-panner-button-height);
  background-color: #ffffff;
  border-radius: 50%;
  color: #ffffff;
  font-size: 10px;
  will-change: transform;
}
.stereo-panner-button:hover {
  cursor: ns-resize;
}
.pointer {
  width: 2px;
  height: 10px;
  background-color: #0f1214;
  translate: 0 -50%;
  rotate: var(--pointer-rotation-deg);
  transform-origin: center bottom;
}
.scale-mark {
  position: absolute;
}
</style>
