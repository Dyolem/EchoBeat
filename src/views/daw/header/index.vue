<script setup>
import PlayController from "@/views/daw/header/play-controller/index.vue"
import Metronome from "@/views/daw/header/beat-controller/metronome.vue"
import Mode from "@/views/daw/header/beat-controller/mode.vue"
import HistoryController from "@/views/daw/header/history-edit-record/index.vue"
import GlobalMenu from "@/views/daw/header/GlobalMenu.vue"
import Logo from "@/views/daw/header/Logo.vue"
import ProjectTitle from "@/views/daw/header/ProjectTitle.vue"
import SaveProject from "@/views/daw/header/SaveProject.vue"
import GlobalGain from "@/views/daw/header/GlobalGain.vue"
import NewFeature from "@/views/daw/header/NewFeature.vue"
</script>

<template>
  <header>
    <div class="studio-header">
      <nav class="mix-editor-header-content">
        <div class="mix-editor-header-left">
          <GlobalMenu></GlobalMenu>
          <Logo></Logo>
        </div>
        <div class="mix-editor-header-center">
          <ProjectTitle></ProjectTitle>
        </div>
        <div class="mix-editor-header-right">
          <SaveProject></SaveProject>
        </div>
      </nav>
      <nav class="mix-editor-toolbar">
        <div class="mix-editor-toolbar-left">
          <HistoryController></HistoryController>
          <Metronome></Metronome>
          <Mode></Mode>
        </div>
        <div class="mix-editor-toolbar-center">
          <PlayController></PlayController>
        </div>
        <div class="mix-editor-toolbar-right">
          <GlobalGain></GlobalGain>
          <NewFeature></NewFeature>
        </div>
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
  padding-top: 10px;
  flex: 0.5;
  width: 100%;
  min-width: 768px;
  display: grid;
  align-items: center;
  grid-template-columns: 1fr auto minmax(auto, 1fr);
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
  padding-left: 10px;
  gap: 30px;
}

.mix-editor-toolbar-right {
  padding-right: 10px;
  justify-content: flex-end;
  gap: 12px;
}
.mix-editor-header-left,
.mix-editor-header-center,
.mix-editor-header-right {
  display: flex;
  align-items: center;
}
.mix-editor-header-right {
  justify-content: flex-end;
}
</style>
