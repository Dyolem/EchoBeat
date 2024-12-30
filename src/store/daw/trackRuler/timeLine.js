import { defineStore } from "pinia"
import { computed, ref, watchEffect } from "vue"

export const useTrackRulerStore = defineStore("dawTrackRulerTimeLine", () => {
  const BEATS_NUMBER = 95
  const INIT_BPM = 120
  const beatsNumber = ref(BEATS_NUMBER)
  const bpm = ref(INIT_BPM)
  const secondsPerBeat = computed(() => {
    return 60 / bpm.value
  })
  const totalTime = computed(() => {
    return secondsPerBeat.value * beatsNumber.value
  })

  const mainEditorId = ref("")
  const timeLineTranslateDistance = ref(0)
  const scrollLeft = ref(0)
  const timeLineInstanceMap = ref(
    new Map([
      [
        "1",
        {
          trackRulerViewWidth: 0,
          trackRulerWidth: 1,
          trackZoomRatio: 1,
          scrollLeft: 0,
          translateXDistance: 0,
        },
      ],
    ]),
  )
  watchEffect(() => {
    console.log(timeLineInstanceMap.value)
  })
  const timelineCurrentTime = ref(0)

  const _getUnnecessaryFields = (id, field) => {
    return timeLineInstanceMap.value.get(id)?.[field]
  }
  function SynchronizeState(
    timeLineId,
    {
      trackRulerViewWidth = _getUnnecessaryFields(
        timeLineId,
        "trackRulerViewWidth",
      ),
      trackZoomRatio = _getUnnecessaryFields(timeLineId, "trackZoomRatio"),
      scrollLeft = _getUnnecessaryFields(timeLineId, "scrollLeft"),
      translateXDistance = _getUnnecessaryFields(
        timeLineId,
        "translateXDistance",
      ),
    } = {},
  ) {
    for (const [id, timeLineInstanceInfo] of timeLineInstanceMap.value) {
      if (id === timeLineId) {
        timeLineInstanceMap.value.set(id, {
          trackRulerViewWidth: timeLineInstanceInfo.trackRulerViewWidth,
          trackRulerWidth: timeLineInstanceInfo.trackRulerWidth,
          translateXDistance,
          trackZoomRatio,
          scrollLeft,
        })
      } else {
        const passiveRenewalDistance =
          (translateXDistance / trackZoomRatio) *
          timeLineInstanceInfo.trackZoomRatio

        //主副编辑器的缩放倍率和编辑视口宽度如果均一致，则横向滚动距离一致，否则较大缩放倍率的编辑器执行翻页滚动
        const _scrollLeft =
          trackZoomRatio === timeLineInstanceInfo.trackZoomRatio &&
          trackRulerViewWidth === timeLineInstanceInfo.trackRulerViewWidth
            ? scrollLeft
            : Math.floor(
                passiveRenewalDistance /
                  timeLineInstanceInfo.trackRulerViewWidth,
              ) * timeLineInstanceInfo.trackRulerViewWidth

        timeLineInstanceMap.value.set(id, {
          trackRulerViewWidth: timeLineInstanceInfo.trackRulerViewWidth,
          trackRulerWidth: timeLineInstanceInfo.trackRulerWidth,
          translateXDistance: passiveRenewalDistance,
          trackZoomRatio: timeLineInstanceInfo.trackZoomRatio,
          scrollLeft: _scrollLeft,
          //(scrollLeft + trackRulerViewWidth) /
          //               (trackZoomRatio / timeLineInstanceInfo.trackZoomRatio) -
          //             timeLineInstanceInfo.trackRulerViewWidth
          //   (主动更新编辑器的时间线位移位置)=scrollLeft +主动更新编辑器的视口尺寸
          //  (被更新编辑器的时间线位移位置)=新scrollLeft +被更新编辑器的视口尺寸
          //   (主动更新编辑器的时间线位移位置)/被更新编辑器的时间线位移位置 = trackZoomRatio/timeLineInstanceInfo.trackZoomRatio
          // (scrollLeft +主动更新编辑器的视口尺寸)/(trackZoomRatio/timeLineInstanceInfo.trackZoomRatio) - 被更新编辑器的视口尺寸 = 新scrollLeft
        })
      }
    }
    const mainEditorTimelineInstance = timeLineInstanceMap.value.get(
      mainEditorId.value,
    )
    timelineCurrentTime.value =
      (mainEditorTimelineInstance.translateXDistance /
        mainEditorTimelineInstance.trackRulerWidth) *
      totalTime.value
  }
  function synchronizeStateWithCurrentTime(currentTime) {
    for (const [id, timeLineInstance] of timeLineInstanceMap.value) {
      const translateXDistance =
        (currentTime / totalTime.value) * timeLineInstance.trackRulerWidth
      timeLineInstance.translateXDistance = translateXDistance

      const xRelativeToEditorViewPort =
        translateXDistance - timeLineInstance.scrollLeft
      if (xRelativeToEditorViewPort > timeLineInstance.trackRulerViewWidth) {
        timeLineInstance.scrollLeft += timeLineInstance.trackRulerViewWidth
      }
    }
  }
  function timelineStateReset() {
    timeLineInstanceMap.value.forEach((value, key) => {
      timeLineInstanceMap.value.set(key, {
        trackRulerViewWidth: value.trackRulerViewWidth,
        trackRulerWidth: value.trackRulerWidth,
        trackZoomRatio: 1,
        scrollLeft: 0,
        translateXDistance: 0,
      })
    })
  }
  return {
    mainEditorId,
    totalTime,
    timelineCurrentTime,
    timeLineTranslateDistance,
    scrollLeft,
    timeLineInstanceMap,
    SynchronizeState,
    synchronizeStateWithCurrentTime,
    timelineStateReset,
  }
})
