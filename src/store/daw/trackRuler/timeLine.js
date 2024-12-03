import { defineStore } from "pinia"
import { ref } from "vue"

export const useTrackRulerStore = defineStore("dawTrackRulerTimeLine", () => {
  const editorViewWidth = ref(0)
  const timeLineTranslateDistance = ref(0)
  const scrollLeft = ref(0)
  const timeLineInstanceMap = ref(
    new Map([
      ["1", { trackZoomRatio: 1, scrollLeft: 0, translateXDistance: 0 }],
      // ["2", { trackZoomRatio: 1, scrollLeft: 0, translateXDistance: 0 }],
    ]),
  )
  const _getUnnecessaryFields = (id, field) => {
    console.log(id)
    console.log("field" + field + timeLineInstanceMap.value.get(id))
    console.log("field" + field + timeLineInstanceMap.value.get(id)?.[field])
    return timeLineInstanceMap.value.get(id)?.[field]
  }
  function SynchronizeState(
    timeLineId,
    {
      trackZoomRatio = _getUnnecessaryFields(timeLineId, "trackZoomRatio"),
      scrollLeft = _getUnnecessaryFields(timeLineId, "scrollLeft"),
      translateXDistance = _getUnnecessaryFields(
        timeLineId,
        "translateXDistance",
      ),
    },
  ) {
    for (const [id, timeLineInstanceInfo] of timeLineInstanceMap.value) {
      if (id === timeLineId) {
        timeLineInstanceMap.value.set(id, {
          translateXDistance,
          trackZoomRatio,
          scrollLeft,
        })
      } else {
        timeLineInstanceMap.value.set(id, {
          translateXDistance:
            (translateXDistance / trackZoomRatio) *
            timeLineInstanceInfo.trackZoomRatio,
          trackZoomRatio: timeLineInstanceInfo.trackZoomRatio,
          scrollLeft:
            (scrollLeft + editorViewWidth.value) /
              (trackZoomRatio / timeLineInstanceInfo.trackZoomRatio) -
            editorViewWidth.value,
          //   (总长度)=scrollLeft +元素固定尺寸
          //  (另总长度)=新scrollLeft +元素固定尺寸
          //   (总长度)/另总长度 = trackZoomRatio/timeLineInstanceInfo.trackZoomRatio
          // (scrollLeft +元素固定尺寸)/(trackZoomRatio/timeLineInstanceInfo.trackZoomRatio) - 元素固定尺寸 = 新scrollLeft
        })
      }
    }
  }
  function timelineStateReset() {
    timeLineInstanceMap.value.forEach((value, key) => {
      timeLineInstanceMap.value.set(key, {
        trackZoomRatio: 1,
        scrollLeft: 0,
        translateXDistance: 0,
      })
    })
  }
  return {
    editorViewWidth,
    timeLineTranslateDistance,
    scrollLeft,
    timeLineInstanceMap,
    SynchronizeState,
    timelineStateReset,
  }
})
