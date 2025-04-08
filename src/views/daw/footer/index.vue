<script setup>
import {
  AUDIO_EDIT_TOOLS,
  INIT_FOOTER_HEIGHT,
  SUBORDINATE_EDITOR_ID,
  TOOLS_TYPE_ENUM,
} from "@/constants/daw/index.js"
import MixEditorButton from "@/views/daw/mix-editor-button/MixEditorButton.vue"
import MidiEditor from "@/views/daw/midi-editor/index.vue"
import MixEditorButtonGroup from "@/views/daw/mix-editor-button/MixEditorButtonGroup.vue"
import { onMounted, onBeforeUnmount, ref, useTemplateRef, computed } from "vue"
import { Icon } from "@iconify/vue"

const props = defineProps({
  toolsSet: {
    type: Array,
    default: () => AUDIO_EDIT_TOOLS,
  },
})
const footerHeight = defineModel("footerHeight", {
  type: Number,
  default: INIT_FOOTER_HEIGHT,
})

const footerContainerRef = useTemplateRef("footerContainerRef")
// // 创建一个 ResizeObserver 实例
const resizeObserver = new ResizeObserver((entries) => {
  entries.forEach((entry) => {
    footerHeight.value = entry.contentRect.height
  })
})
onMounted(() => {
  // 开始观察
  if (footerContainerRef.value) resizeObserver.observe(footerContainerRef.value)
})
onBeforeUnmount(() => {
  // 不再需要观察，调用 unobserve() 取消监听
  resizeObserver.unobserve(footerContainerRef.value)
})

const showToolsName = ref("")
const toolsComponent = {
  [TOOLS_TYPE_ENUM.Instrument]: null,
  [TOOLS_TYPE_ENUM.Effect]: null,
  [TOOLS_TYPE_ENUM.Midi]: MidiEditor,
}
const currentDrawerTool = computed(() => {
  return toolsComponent[showToolsName.value]
})
function toggleTools(toolType) {
  if (showToolsName.value === toolType) {
    showToolsName.value = ""
  } else {
    showToolsName.value = toolType
  }
}
</script>

<template>
  <footer class="footer" ref="footerContainerRef">
    <keep-alive>
      <component
        :is="currentDrawerTool"
        :id="SUBORDINATE_EDITOR_ID"
        :toggle-tools="toggleTools"
      ></component>
    </keep-alive>
    <div class="footer-tool-bar">
      <div class="left-side-tool">
        <MixEditorButtonGroup>
          <MixEditorButton
            v-for="(tool, index) in toolsSet"
            :key="tool.toolName"
            :circle="index === 0 || index === toolsSet.length - 1"
            @click="() => toggleTools(tool.toolName)"
          >
            <div class="tool-name">
              <Icon :icon="tool.iconName"></Icon>
              <span>{{ tool.label }}</span>
            </div>
          </MixEditorButton>
        </MixEditorButtonGroup>
      </div>
      <div class="right-side-tool"></div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  position: relative;
  width: 100vw;
  min-height: var(--default-footer-height);
  background-color: #0f1214;
}
.footer-tool-bar {
  min-height: var(--default-footer-height);
  height: fit-content;
  width: 100%;
  padding: 0 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.left-side-tool,
.right-side-tool {
  height: 100%;
  display: flex;
  align-items: center;
}
.tool-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}
</style>
