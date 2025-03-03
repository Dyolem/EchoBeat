import { defineStore } from "pinia"
import { computed, ref } from "vue"
import { useZoomRatioStore } from "@/store/daw/zoomRatio.js"
import { useMixTrackEditorStore } from "@/store/daw/mix-track-editor/index.js"
import {
  BASE_GRID_HEIGHT,
  BASE_GRID_WIDTH,
  EDITABLE_TOTAL_TIME,
  GRID_OPTIONS,
  INIT_BEATS_PER_MEASURE,
  INIT_BPM,
  INIT_NOTE_VALUE_DENOMINATOR,
  MAX_BPM,
  MAX_GRID_WIDTH,
  MIN_BPM,
  MIN_GRID_WIDTH,
  PIXELS_PER_QUARTER,
  PPQ,
  SERIAL_NUMBER_FONT_SIZE,
} from "@/constants/daw/index.js"
import { clamp } from "@/utils/clamp.js"
import { calculateAlignedGridBeats } from "@/core/grid-size/calculateAlignedGridBeats.js"

export const useBeatControllerStore = defineStore("beatController", () => {
  const zoomRatioStore = useZoomRatioStore()
  const mixTrackEditorStore = useMixTrackEditorStore()
  const ppqn = ref(PPQ) //一个四分音符的tick数
  const bpm = ref(INIT_BPM) //bpm
  const baseGridWidth = BASE_GRID_WIDTH //起始状态的基础网格宽度
  const minGridWidth = ref(MIN_GRID_WIDTH) //网格最小宽度
  const maxGridWidth = ref(MAX_GRID_WIDTH) //网格最大宽度
  const editableTotalTime = ref(EDITABLE_TOTAL_TIME) //可编辑总时长，单位秒，时长可被增加

  const beatsPerMeasure = ref(INIT_BEATS_PER_MEASURE) //节拍分式分子
  const noteValueDenominator = ref(INIT_NOTE_VALUE_DENOMINATOR) //音符分式分母
  const gridType = ref(GRID_OPTIONS["1/4"])

  const timeSignature = computed(() => {
    return beatsPerMeasure.value / noteValueDenominator.value
  }) //节拍分式值
  const noteFraction = computed(() => {
    return 1 / noteValueDenominator.value
  }) //音符分式值
  const timePerBeat = computed(() => {
    return 60 / bpm.value
  }) //根据bpm计算每拍多少秒

  const absoluteTimePerTick = computed(() => {
    return timePerBeat.value / ppqn.value
  })
  const pixelsPerQuarter = ref(PIXELS_PER_QUARTER)
  const pixelsPerTick = computed(() => {
    return (editorId) =>
      (pixelsPerQuarter.value / ppqn.value) *
      zoomRatioStore.getSpecifiedEditorZoomRatio(editorId)
  }) //一个tick对应的像素宽度（含缩放倍率）
  const currentNoteDenominatorTicks = computed(() => {
    return (4 / noteValueDenominator.value) * ppqn.value
  })

  const beats = computed(() => {
    return editableTotalTime.value / timePerBeat.value
  }) //总计节拍数量
  const totalMeasures = computed(() => {
    return beats.value / beatsPerMeasure.value
  }) //总共小节数
  const totalTicks = computed(() => {
    return editableTotalTime.value / absoluteTimePerTick.value
  })
  const ticksPerBeat = computed(() => {
    return totalTicks.value / beats.value
  })

  const baseRulerGridWidth = computed(() => {
    return (editorId) => {
      return pixelsPerTick.value(editorId) * currentNoteDenominatorTicks.value
    }
  })
  const baseEditorGridWidth = computed(() => {
    return (editorId) =>
      pixelsPerTick.value(editorId) *
      ticksPerBeat.value *
      calculateAlignedGridBeats({
        timeSigN: beatsPerMeasure.value,
        timeSigM: noteValueDenominator.value,
        gridOption: gridType.value,
      })
  })

  const noteGridWidth = computed(() => {
    return (editorId) => {
      return (
        calculateAlignedGridBeats({
          timeSigN: beatsPerMeasure.value,
          timeSigM: noteValueDenominator.value,
          gridOption: gridType.value,
        }) *
        currentNoteDenominatorTicks.value *
        pixelsPerTick.value(editorId)
      )
    }
  })
  const gridWidthWithZoomRatio = computed(() => {
    return (editorId) =>
      baseGridWidth * zoomRatioStore.getSpecifiedEditorZoomRatio(editorId)
  }) //随缩放被倍率变化的网格宽度，并不是最终格子的显示宽度
  const totalLength = computed(() => {
    return (editorId) =>
      beats.value * ticksPerBeat.value * pixelsPerTick.value(editorId)
  })

  //每一个小节的宽度
  const widthPerMeasure = computed(() => {
    return (editorId) => totalLength.value(editorId) / totalMeasures.value
  })
  const widthPerBeat = computed(() => {
    return (editorId) => widthPerMeasure.value(editorId) / beatsPerMeasure.value
  })

  const barsCount = computed(() => {
    return (editorId) => {
      return (
        totalMeasures.value /
        Math.ceil(serialNumberSizeWidth.value / widthPerMeasure.value(editorId))
      )
    }
  })
  const barWidth = computed(() => {
    return (editorId) => totalLength.value(editorId) / barsCount.value(editorId)
  })
  const serialNumberSizeWidth = computed(() => {
    return SERIAL_NUMBER_FONT_SIZE * (totalMeasures.value.toString().length + 2)
  })
  const isDisplayBeatLine = computed(() => {
    return (editorId) =>
      widthPerBeat.value(editorId) > serialNumberSizeWidth.value
  })
  const n = computed(() => {
    return (editorId) => {
      const gridWidth = gridWidthWithZoomRatio.value(editorId)
      if (gridWidth > minGridWidth.value) {
        return Math.floor(gridWidth / maxGridWidth.value)
      } else if (gridWidth <= minGridWidth.value) {
        return -Math.floor(minGridWidth.value / gridWidth)
      }
    }
  })
  const splitPow = computed(() => {
    return (beatWidth) => {
      const p = Math.floor(
        Math.log2(beatWidth / (beatsPerMeasure.value * minGridWidth.value)),
      )
      return p
    }
  })
  const gridLayerUnitsCount = computed(() => {
    return (beatWidth) => beatsPerMeasure.value * 2 ** splitPow.value(beatWidth)
  })
  const gridLayerWidth = computed(() => {
    return (beatWidth) => {
      return beatWidth / gridLayerUnitsCount.value(beatWidth)
    }
  })
  const factualDisplayedGridWidth = computed(() => {
    return (editorId) => noteGridWidth.value(editorId)
  })
  const dynamicPerBarRulerWidth = computed(() => {
    return (editorId) =>
      baseRulerGridWidth.value(editorId) * beatsPerMeasure.value
  })
  const dynamicPerBarGridWidth = computed(() => {
    return (editorId) =>
      baseEditorGridWidth.value(editorId) * beatsPerMeasure.value
  })
  const highlightWidth = computed(() => {
    return (editorId) => {
      if (isDisplayBeatLine.value(editorId)) {
        return (barWidth.value(editorId) / beatsPerMeasure.value) * 2
      } else {
        return barWidth.value(editorId) * 2
      }
    }
  })
  const dynamicSvgHeight = computed(() => {
    return mixTrackEditorStore.mixTracksMap.size * BASE_GRID_HEIGHT
  })
  function updateBpm(newBpm) {
    bpm.value = clamp(newBpm, [MIN_BPM, MAX_BPM])
  }
  function updateGridType(newType) {
    if (!Object.keys(GRID_OPTIONS).includes(newType)) return
    gridType.value = newType
  }
  return {
    bpm,
    editableTotalTime,
    baseGridWidth,
    minGridWidth,
    maxGridWidth,
    totalMeasures,
    gridType,
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
    highlightWidth,
    dynamicSvgHeight,
    baseRulerGridWidth,
    baseEditorGridWidth,
    dynamicPerBarRulerWidth,
    dynamicPerBarGridWidth,
    gridLayerWidth,
    gridLayerUnitsCount,
    splitPow,
    barsCount,
    barWidth,
    noteGridWidth,
    isDisplayBeatLine,
    updateBpm,
    updateGridType,
  }
})
