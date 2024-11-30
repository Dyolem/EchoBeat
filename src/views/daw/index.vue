<script setup>
import EditorHeader from "@/views/daw/header/index.vue"
import Editor from "@/views/daw/editor-template/index.vue"
</script>

<template>
  <main id="main">
    <EditorHeader />
    <Editor />
  </main>
</template>

<style scoped>
#main {
  --header-height: 100px;
  --content-height: calc(100vh - var(--header-height));
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  background-color: #9a6e3a;
}
</style>
