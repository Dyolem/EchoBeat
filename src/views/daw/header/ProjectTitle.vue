<script setup>
import MixEditorButton from "@/views/daw/mix-editor-button/MixEditorButton.vue"
import { useProjectStore } from "@/store/daw/project-details/index.js"
import { storeToRefs } from "pinia"

const projectStore = useProjectStore()
const { updateProjectDetails } = projectStore
const { projectDetailsInfo } = storeToRefs(projectStore)
function modifyProjectName(event) {
  const newName = event.target.value
  updateProjectDetails({ projectName: newName })
}
</script>

<template>
  <MixEditorButton circle>
    <div class="input-box">
      <input
        type="text"
        :value="projectDetailsInfo.projectName"
        @change="modifyProjectName"
        placeholder="New Project"
      />
    </div>
  </MixEditorButton>
</template>

<style scoped>
.input-box {
  position: relative;
}
.input-box:hover::after {
  position: absolute;
  top: 2px;
  right: 0;
  content: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxZW0iIGhlaWdodD0iMWVtIiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxnIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIyIj48cGF0aCBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGQ9Ik00LjMzMyAxNi4wNDhMMTYuNTcgMy44MWEyLjU2IDIuNTYgMCAwIDEgMy42MiAzLjYxOUw3Ljk1MSAxOS42NjdhMiAyIDAgMCAxLTEuMDIyLjU0N0wzIDIxbC43ODYtMy45M2EyIDIgMCAwIDEgLjU0Ny0xLjAyMiIvPjxwYXRoIGQ9Im0xNC41IDYuNWwzIDMiLz48L2c+PC9zdmc+);
}
input[type="text"] {
  background: transparent;
  border: 0;
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  transition: background 0.3s ease-in-out;
  width: 250px;
  margin: 0 50px;
}
</style>
