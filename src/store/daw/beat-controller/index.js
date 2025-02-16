import { defineStore } from "pinia"
import { computed, ref } from "vue"
import { useZoomRatioStore } from "@/store/daw/zoomRatio.js"
import { useMixTrackEditorStore } from "@/store/daw/mix-track-editor/index.js"
import {
  BASE_GRID_HEIGHT,
  BASE_GRID_WIDTH,
  EDITABLE_TOTAL_TIME,
  INIT_BEATS_PER_MEASURE,
  INIT_BPM,
  INIT_NOTE_VALUE_DENOMINATOR,
  MAX_GRID_WIDTH,
  MIN_GRID_WIDTH,
} from "@/constants/daw/index.js"

export const useBeatControllerStore = defineStore("beatController", () => {
  const zoomRatioStore = useZoomRatioStore()
  const mixTrackEditorStore = useMixTrackEditorStore()
  const bpm = ref(INIT_BPM) //bpm
  const baseGridWidth = BASE_GRID_WIDTH //起始状态的基础网格宽度
  const minGridWidth = MIN_GRID_WIDTH //网格最小宽度
  const maxGridWidth = ref(MAX_GRID_WIDTH) //网格最大宽度
  const editableTotalTime = ref(EDITABLE_TOTAL_TIME) //可编辑总时长，单位秒，时长可被增加

  const beatsPerMeasure = ref(INIT_BEATS_PER_MEASURE) //节拍分式分子
  const noteValueDenominator = ref(INIT_NOTE_VALUE_DENOMINATOR) //音符分式分母

  const timeSignature = computed(() => {
    return beatsPerMeasure.value / noteValueDenominator.value
  }) //节拍分式值
  const noteFraction = computed(() => {
    return 1 / noteValueDenominator.value
  }) //音符分式值

  const timePerBeat = computed(() => {
    return 60 / bpm.value
  }) //根据bpm计算每拍多少秒

  const beats = computed(() => {
    return editableTotalTime.value / timePerBeat.value
  }) //总计节拍数量
  const totalMeasures = computed(() => {
    return beats.value / beatsPerMeasure.value
  }) //总共小节数

  const gridWidthWithZoomRatio = computed(() => {
    return (editorId) =>
      baseGridWidth * zoomRatioStore.getSpecifiedEditorZoomRatio(editorId)
  }) //随缩放被倍率变化的网格宽度，并不是最终格子的显示宽度
  const totalLength = computed(() => {
    return (editorId) => beats.value * gridWidthWithZoomRatio.value(editorId)
  })
  const widthPerMeasure = computed(() => {
    return (editorId) => totalLength.value(editorId) / totalMeasures.value
  })
  const widthPerBeat = computed(() => {
    return (editorId) => widthPerMeasure.value(editorId) / beatsPerMeasure.value
  })

  const n = computed(() => {
    return (editorId) => {
      const gridWidth = gridWidthWithZoomRatio.value(editorId)
      if (gridWidth > minGridWidth) {
        return Math.floor(gridWidth / maxGridWidth.value)
      } else if (gridWidth <= minGridWidth) {
        return -Math.floor(minGridWidth / gridWidth)
      }
    }
  })
  const factualDisplayedGridWidth = computed(() => {
    return (editorId) =>
      gridWidthWithZoomRatio.value(editorId) / 2 ** n.value(editorId)
  })
  const dynamicBarsCount = computed(() => {
    return (editorId) => totalMeasures.value * 2 ** n.value(editorId)
  })
  const dynamicPerBarWidth = computed(() => {
    return (editorId) =>
      totalLength.value(editorId) / dynamicBarsCount.value(editorId)
  })
  const highlightWidth = computed(() => {
    return (editorId) => 2 * dynamicPerBarWidth.value(editorId)
  })
  const dynamicSvgHeight = computed(() => {
    return mixTrackEditorStore.mixTracksMap.size * BASE_GRID_HEIGHT
  })
  return {
    bpm,
    editableTotalTime,
    baseGridWidth,
    minGridWidth,
    maxGridWidth,
    totalMeasures,
    beatsPerMeasure,
    noteValueDenominator,
    timeSignature,
    noteFraction,
    timePerBeat,
    totalLength,
    gridWidthWithZoomRatio,
    widthPerMeasure,
    widthPerBeat,
    factualDisplayedGridWidth,
    dynamicPerBarWidth,
    dynamicBarsCount,
    highlightWidth,
    dynamicSvgHeight,
  }
})
