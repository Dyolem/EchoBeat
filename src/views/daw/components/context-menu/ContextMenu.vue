<script setup>
import { ref, useTemplateRef, computed } from "vue"
import { ZIndex } from "@/constants/daw/index.js"
import Menu from "@/views/daw/components/context-menu/Menu.vue"
import { useContextMenu } from "@/composable/useContextMenu.js"
import { useViewPort } from "@/composable/useViewPort.js"
const contextMenuRef = useTemplateRef("contextMenuRef")
const contextMenuZIndex = ref(ZIndex.CONTEXT_MENU)

const { vw, vh } = useViewPort()
const { activeTriggerContextMenu, showMenu, x, y } =
  useContextMenu(contextMenuRef)
const props = defineProps({
  menu: {
    type: Array,
    default: () => [],
  },
})
const emit = defineEmits(["select"])

function handleClick(item) {
  emit("select", item)
}
const menuWidth = ref(0)
const menuHeight = ref(0)
function menuResizeHandler({ width, height }) {
  menuWidth.value = width
  menuHeight.value = height
}
const computedMenuPosition = computed(() => {
  const horizontalThreshold = vw.value - menuWidth.value
  const verticalThreshold = vh.value - menuHeight.value
  return {
    x: Math.min(x.value, horizontalThreshold),
    y: Math.min(y.value, verticalThreshold),
  }
})
</script>

<template>
  <div class="context-menu" ref="contextMenuRef">
    <slot :activeTriggerContextMenu="activeTriggerContextMenu"></slot>
    <Teleport to="body">
      <div
        v-size-ob="menuResizeHandler"
        class="menu-container beatified-scrollbar"
        v-if="showMenu"
        :style="{
          left: computedMenuPosition.x + 'px',
          top: computedMenuPosition.y + 'px',
        }"
      >
        <slot name="context-menu">
          <Menu :menu-data="menu" @select="handleClick"></Menu>
        </slot>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
@import "../../../../styles/scrollbar.css";
.menu-container {
  position: fixed;
  width: fit-content;
  height: fit-content;
  border-radius: 8px;
  max-height: 600px;
  overflow: hidden;
  z-index: v-bind(contextMenuZIndex);
}
.menu-item {
  padding: 2px 4px;
  background-color: hsl(20deg, 50%, 50%);
}
.menu-item:hover {
  background-color: hsl(20deg, 50%, 30%);
}
</style>
