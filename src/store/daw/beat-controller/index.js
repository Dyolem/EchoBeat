import { defineStore } from "pinia"
import { computed, ref } from "vue"
import { useZoomRatioStore } from "@/store/daw/zoomRatio.js"
import { useMixTrackEditorStore } from "@/store/daw/mix-track-editor/index.js"
import {
  BASE_GRID_HEIGHT,
  BASE_GRID_WIDTH,
  EDITABlE_TOTAL_BEATS,
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
  const bpm = ref(INIT_BPM) // 每分钟的四分音符个数

  const pixelsPerQuarter = ref(PIXELS_PER_QUARTER)
  const pixelsPerTick = computed(() => {
    return (editorId) => {
      return (
        (pixelsPerQuarter.value / ppqn.value) *
        zoomRatioStore.getSpecifiedEditorZoomRatio(editorId)
      )
    }
  }) //一个tick对应的像素宽度，与PPQN值无关（含缩放倍率）
  const baseGridWidth = BASE_GRID_WIDTH //起始状态的基础网格宽度
  const minGridWidth = ref(MIN_GRID_WIDTH) //网格最小宽度
  const editableTotalBeats = ref(EDITABlE_TOTAL_BEATS) //可编辑的总拍子数，以拍子为基准是因为bpm会影响一个拍子的时长，以总时长为基准不够灵活
  const beatsPerMeasure = ref(INIT_BEATS_PER_MEASURE) //节拍分式分子
  const noteValueDenominator = ref(INIT_NOTE_VALUE_DENOMINATOR) //音符分式分母
  const gridType = ref(GRID_OPTIONS["1/4"])

  const timeSignature = computed(() => {
    return beatsPerMeasure.value / noteValueDenominator.value
  }) //节拍分式值
  const noteFraction = computed(() => {
    return 1 / noteValueDenominator.value
  }) //音符分式值
  const timePerQuarter = computed(() => {
    return 60 / bpm.value
  })
  const timePerBeat = computed(() => {
    return timePerQuarter.value * (4 / noteValueDenominator.value)
  }) //根据bpm计算每拍多少秒

  const currentNoteDenominatorTicks = computed(() => {
    return (4 / noteValueDenominator.value) * ppqn.value
  })

  const beats = computed(() => {
    return editableTotalBeats.value
  }) //总计节拍数量

  const editableTotalTime = computed(() => {
    return beats.value * timePerBeat.value
  }) //可编辑总时长，单位秒

  const totalMeasures = computed(() => {
    return beats.value / beatsPerMeasure.value
  }) //总共小节数

  const ticksPerBeat = computed(() => {
    return ppqn.value * (4 / noteValueDenominator.value)
  })

  const totalTicks = computed(() => {
    return ticksPerBeat.value * beats.value
  })
  const absoluteTimePerTick = computed(() => {
    return timePerQuarter.value / ppqn.value
  })

  const totalLength = computed(() => {
    return (editorId) => {
      return beats.value * ticksPerBeat.value
    }
  })

  const noteGridWidth = computed(() => {
    return (editorId) => {
      return (
        calculateAlignedGridBeats({
          timeSigN: beatsPerMeasure.value,
          timeSigM: noteValueDenominator.value,
          gridOption: gridType.value,
        }) * currentNoteDenominatorTicks.value
      )
    }
  })
  const gridWidthWithZoomRatio = computed(() => {
    return (editorId) =>
      baseGridWidth * zoomRatioStore.getSpecifiedEditorZoomRatio(editorId)
  }) //随缩放被倍率变化的网格宽度，并不是最终格子的显示宽度

  const widthPerBeat = computed(() => {
    return (editorId) => {
      return ticksPerBeat.value
    }
  })

  //每一个小节的宽度
  const widthPerMeasure = computed(() => {
    return (editorId) => widthPerBeat.value(editorId) * beatsPerMeasure.value
  })

  const barsCount = computed(() => {
    return (editorId) => {
      return (
        totalMeasures.value /
        Math.ceil(
          serialNumberSizeWidth.value(editorId) /
            widthPerMeasure.value(editorId),
        )
      )
    }
  })
  const barWidth = computed(() => {
    return (editorId) => {
      return totalLength.value(editorId) / barsCount.value(editorId)
    }
  })
  const serialNumberSizeWidth = computed(() => {
    return (editorId) =>
      (SERIAL_NUMBER_FONT_SIZE * (totalMeasures.value.toString().length + 2)) /
      pixelsPerTick.value(editorId)
  })
  const isDisplayBeatLine = computed(() => {
    return (editorId) =>
      widthPerBeat.value(editorId) > serialNumberSizeWidth.value(editorId)
  })

  const splitPow = computed(() => {
    return (editorId) => {
      const p = Math.floor(
        Math.log2(
          widthPerBeat.value(editorId) /
            (beatsPerMeasure.value *
              (minGridWidth.value / pixelsPerTick.value(editorId))),
        ),
      )
      return p
    }
  })
  const gridLayerUnitsCount = computed(() => {
    return (editorId) => beatsPerMeasure.value * 2 ** splitPow.value(editorId)
  })
  const gridLayerWidth = computed(() => {
    return (editorId) => {
      return widthPerBeat.value(editorId) / gridLayerUnitsCount.value(editorId)
    }
  })
  const factualDisplayedGridWidth = computed(() => {
    return (editorId) => noteGridWidth.value(editorId)
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

  function updateGridType(newType) {
    if (!Object.keys(GRID_OPTIONS).includes(newType)) return
    gridType.value = newType
  }
  function updateChoreAudioParams({
    bpm: _bpm,
    ppqn: _ppqn,
    timeSignature: _timeSignature,
    editableTotalTime: _editableTotalTime,
  }) {
    const updatedValue = {
      bpm: [bpm.value, bpm.value],
      ppqn: [ppqn.value, ppqn.value],
      timeSignature: [timeSignature.value, timeSignature.value],
      editableTotalTime: [editableTotalTime.value, editableTotalTime.value],
    }
    if (_bpm !== undefined) {
      const oldBpm = bpm.value
      const newBpm = clamp(_bpm, [MIN_BPM, MAX_BPM])
      bpm.value = newBpm
      updatedValue.bpm[1] = oldBpm
      updatedValue.bpm[0] = newBpm
    }
    if (_ppqn !== undefined) {
      ppqn.value = _ppqn
      updatedValue.ppqn[1] = updatedValue.ppqn[0]
      updatedValue.ppqn[0] = _ppqn
    }
    if (_timeSignature !== undefined) {
      const [time_sig_n, time_sig_m] = _timeSignature.split("/")
      const new_time_sig_n = Number(time_sig_n)
      const new_time_sig_m = Number(time_sig_m)
      beatsPerMeasure.value = new_time_sig_n
      noteValueDenominator.value = new_time_sig_m
      updatedValue.timeSignature[1] = updatedValue.timeSignature[0]
      updatedValue.timeSignature[0] = new_time_sig_n / new_time_sig_m
    }

    if (
      _editableTotalTime !== undefined &&
      _editableTotalTime > editableTotalTime.value
    ) {
      const newEditableBeats = Math.ceil(_editableTotalTime / timePerBeat.value)
      if (newEditableBeats > editableTotalBeats.value) {
        const newBarCount =
          Math.ceil(newEditableBeats / beatsPerMeasure.value) + 60
        editableTotalBeats.value = newBarCount * beatsPerMeasure.value
        updatedValue.editableTotalTime[1] = updatedValue.editableTotalTime[0]
        updatedValue.editableTotalTime[0] =
          editableTotalBeats * timePerBeat.value
      }
    }
    return updatedValue
  }
  return {
    bpm,
    editableTotalTime,
    baseGridWidth,
    minGridWidth,
    pixelsPerTick,
    absoluteTimePerTick,
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
    gridLayerWidth,
    gridLayerUnitsCount,
    splitPow,
    barsCount,
    barWidth,
    noteGridWidth,
    isDisplayBeatLine,
    updateGridType,
    updateChoreAudioParams,
  }
})
