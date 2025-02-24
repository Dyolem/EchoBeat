<script setup>
import PlayController from "@/views/daw/header/play-controller/index.vue"
import Metronome from "@/views/daw/header/beat-controller/metronome.vue"
import Mode from "@/views/daw/header/beat-controller/mode.vue"
import HistoryController from "@/views/daw/header/history-edit-record/index.vue"
</script>

<template>
  <header>
    <div class="studio-header">
      <nav class="mix-editor-header-content"></nav>
      <nav class="mix-editor-toolbar">
        <div class="mix-editor-toolbar-left">
          <HistoryController></HistoryController>
          <Metronome></Metronome>
          <Mode></Mode>
        </div>
        <div class="mix-editor-toolbar-center">
          <PlayController></PlayController>
        </div>
        <div class="mix-editor-toolbar-right"></div>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.studio-header {
  width: 100vw;
  height: var(--default-header-height);
  display: flex;
  flex-direction: column;
  background-color: black;
}
.mix-editor-header-content {
  flex: 0.5;
  width: 100%;
  background-color: pink;
}
.mix-editor-toolbar {
  flex: 0.5;
  width: 100%;
  min-width: 768px;
  display: grid;
  align-items: center;
  grid-template-columns: 1fr auto minmax(auto, 1fr);
}
.mix-editor-toolbar-left,
.mix-editor-toolbar-center,
.mix-editor-toolbar-right {
  display: flex;
  align-items: center;
}
.mix-editor-toolbar-left {
  gap: 30px;
}
</style>
