<script setup>
import EditorHeader from "@/views/daw/header/index.vue"
import Editor from "@/views/daw/editor-template/index.vue"
import { computed, ref } from "vue"
const HEADER_HEIGHT = 100
const FOOTER_HEIGHT = 50
const headerHeight = ref(HEADER_HEIGHT)
const footerHeight = ref(FOOTER_HEIGHT)
const mainEditorHeight = computed(() => {
  console.log(window.innerHeight - headerHeight.value - footerHeight.value)
  return window.innerHeight - headerHeight.value - footerHeight.value
})
const isOpenDrawerEditor = ref(false)
</script>

<template>
  <div id="main">
    <header>
      <EditorHeader />
    </header>

    <main class="editor-main">
      <Editor :default-editor-view-height="mainEditorHeight" />
    </main>
    <footer class="footer">
      <div class="drawer-editor">
        <button @click="isOpenDrawerEditor = true">instrument</button>
        <Editor
          v-if="isOpenDrawerEditor"
          :default-editor-view-height="300"
        ></Editor>
      </div>
    </footer>
  </div>
</template>

<style scoped>
#main {
  --header-height: 100px;
  --footer-height: 50px;
  --content-height: calc(100vh - var(--header-height) - var(--footer-height));
}
.editor-main {
  position: relative;
  width: 100vw;
  height: v-bind(mainEditorHeight + "px");
  background-color: #9a6e3a;
}

.footer {
  position: relative;
  width: 100vw;
  height: v-bind(footerHeight + "px");
  background-color: lightpink;
}
.drawer-editor {
  position: absolute;
  transform: translateY(-90%);
  z-index: 100;
}
</style>
