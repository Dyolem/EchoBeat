<script setup>
import {
  useTemplateRef,
  onMounted,
  onUnmounted,
  toRefs,
  inject,
  computed,
  watchEffect,
} from "vue"
import {
  registerRenderThumbnailEvent,
  registerUpdateCanvasSizeEvent,
} from "@/views/daw/mix-track-editor/renderThumbnail.js"
import { colorMix } from "@/utils/colorMix.js"
import { LIGHTEN_COLOR } from "@/constants/daw/index.js"

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  noteItemsMap: {
    type: Object,
    default: () => new Map(),
  },
  width: {
    type: Number,
    default: 0,
  },
  height: {
    type: Number,
    default: 0,
  },
})
const mixTrackMainColor = inject("mixTrackMainColor")
const fillColor = computed(() => {
  return colorMix("srgb", mixTrackMainColor.value, `${LIGHTEN_COLOR} 10%`)
})
const { width, height } = toRefs(props)
const thumbnailInfoArr = computed(() => {
  const infoArr = []
  props.noteItemsMap.forEach((noteItem) => {
    const { pitchName, relativeX, width } = noteItem
    infoArr.push({ pitchName, relativeX, width })
  })
  return infoArr
})
const thumbnailCanvasRef = useTemplateRef("thumbnailCanvasRef")
const { controller: renderController, customEmit: renderThumbnail } =
  registerRenderThumbnailEvent({
    id: props.id,
    canvas: thumbnailCanvasRef,
    color: fillColor.value,
  })
const resizeCanvasController = registerUpdateCanvasSizeEvent({
  id: props.id,
  canvas: thumbnailCanvasRef,
})

onMounted(() => {
  if (!thumbnailCanvasRef.value) return
  thumbnailCanvasRef.value.width = width.value
  thumbnailCanvasRef.value.height = height.value
})
watchEffect(() => {
  if (!thumbnailCanvasRef.value) return
  renderThumbnail(thumbnailInfoArr.value)
})

onUnmounted(() => {
  renderController.abort()
  resizeCanvasController.abort()
})
</script>

<template>
  <canvas :id="id" ref="thumbnailCanvasRef"></canvas>
</template>

<style scoped></style>
