<script setup>
import {
  INIT_FOOTER_HEIGHT,
  SUBORDINATE_EDITOR_ID,
} from "@/constants/daw/index.js"
import MixEditorButton from "@/views/daw/mix-editor-button/MixEditorButton.vue"
import MidiEditor from "@/views/daw/midi-editor/index.vue"
import MixEditorButtonGroup from "@/views/daw/mix-editor-button/MixEditorButtonGroup.vue"
import { onMounted, onBeforeUnmount, ref, useTemplateRef } from "vue"

const footerHeight = defineModel("footerHeight", {
  type: Number,
  default: INIT_FOOTER_HEIGHT,
})
const isOpenDrawerEditor = ref(false)
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
</script>

<template>
  <footer class="footer" ref="footerContainerRef">
    <MidiEditor
      :id="SUBORDINATE_EDITOR_ID"
      v-show="isOpenDrawerEditor"
    ></MidiEditor>
    <div class="footer-tool-bar">
      <div class="left-side-tool">
        <MixEditorButtonGroup>
          <MixEditorButton circle>
            <div class="tool-name">
              <echo-lucide:piano></echo-lucide:piano>
              <span>Instrument</span>
            </div>
          </MixEditorButton>
          <MixEditorButton>
            <div class="tool-name">
              <echo-solar:special-effects-linear></echo-solar:special-effects-linear>
              <span>Effects</span>
            </div>
          </MixEditorButton>
          <MixEditorButton
            @click="isOpenDrawerEditor = !isOpenDrawerEditor"
            circle
          >
            <div class="tool-name">
              <echo-fluent:midi-24-regular></echo-fluent:midi-24-regular>
              <span>MIDI Editor</span>
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
  background-color: lightpink;
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
