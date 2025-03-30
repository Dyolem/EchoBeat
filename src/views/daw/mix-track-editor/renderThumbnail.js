import { EventEmitter } from "@/core/custom-event/EventEmitter.js"
import { isRef, toRaw, isReactive } from "vue"
import {
  CHROMATIC_SCALE_ENUM,
  MAIN_EDITOR_ID,
  NOTES_TABLE,
  noteToMidi,
} from "@/constants/daw/index.js"
import { useBeatControllerStore } from "@/store/daw/beat-controller/index.js"
import { storeToRefs } from "pinia"

const beatControllerStore = useBeatControllerStore()
const { pixelsPerTick } = storeToRefs(beatControllerStore)
const emitter = new EventEmitter()

const totalKeysCount = CHROMATIC_SCALE_ENUM.length * NOTES_TABLE.length
const maxMidiSerial = noteToMidi(
  `${NOTES_TABLE[NOTES_TABLE.length - 1]}${CHROMATIC_SCALE_ENUM.length - 1}`,
)

let lastRenderInfo = {
  thumbnailInfoArr: [],
  color: "#ffffff",
}
function renderThumbnail(canvas, thumbnailInfoArr, color = "#ffffff") {
  if (!canvas || !thumbnailInfoArr) return
  lastRenderInfo.thumbnailInfoArr = thumbnailInfoArr
  lastRenderInfo.color = color
  const rectHeight = Math.round((canvas.height / totalKeysCount) * 3)

  const ctx = canvas.getContext("2d")
  ctx.fillStyle = color
  // 每次绘制前清除整个画布
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const _thumbnailInfoArr =
    isRef(thumbnailInfoArr) || isReactive(thumbnailInfoArr)
      ? toRaw(thumbnailInfoArr)
      : thumbnailInfoArr
  _thumbnailInfoArr.forEach((thumbnailInfo) => {
    const { pitchName, relativeX, width } = thumbnailInfo
    const midiSerial = noteToMidi(pitchName)
    const y =
      (1 - (midiSerial - (maxMidiSerial - totalKeysCount)) / totalKeysCount) *
      canvas.height

    const x = relativeX * pixelsPerTick.value(MAIN_EDITOR_ID)
    const rectWidth = width * pixelsPerTick.value(MAIN_EDITOR_ID)
    ctx.fillRect(x, y, rectWidth, rectHeight)
  })
}
export function registerRenderThumbnailEvent({ id, canvas, color }) {
  if (!isRef(canvas))
    throw new TypeError(`Expect a "Ref" data,but ${typeof canvas}`)
  const renderController = new AbortController()
  const prefix = "render-thumbnail"
  const customEventName = `${id}-${prefix}`
  emitter.addListener(
    customEventName,
    (thumbnailInfoArr) =>
      renderThumbnail(canvas.value, thumbnailInfoArr, color),
    { signal: renderController.signal },
  )
  return {
    controller: renderController,
    customEmit: (thumbnailInfoArr) =>
      emitter.emit(customEventName, thumbnailInfoArr),
  }
}

const prefix = "resize-canvas"
export function registerUpdateCanvasSizeEvent({ id, canvas }) {
  const resizeController = new AbortController()
  const customEventName = `${id}-${prefix}`
  emitter.addListener(
    customEventName,
    ({ width, height }) => {
      if (!canvas) return
      const _canvas = canvas.value
      if (width !== undefined) _canvas.width = width
      if (height !== undefined) _canvas.height = height
    },
    { signal: resizeController.signal },
  )
  return resizeController
}
export function resizeMixTrackItemThumbnailCanvas({ id, width, height }) {
  const customEventName = `${id}-${prefix}`
  emitter.emit(customEventName, { width, height })
  const canvasTarget = document.body.querySelector(`#${id}`)
  renderThumbnail(
    canvasTarget,
    lastRenderInfo.thumbnailInfoArr,
    lastRenderInfo.color,
  )
}
