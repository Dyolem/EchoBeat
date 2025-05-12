import { EventEmitter } from "@/core/custom-event/EventEmitter.js"

const emitter = new EventEmitter()
const RENDER_WAVE_DIAGRAM_EVENT_ENUM = {
  renderWaveDiaGram: "renderWaveDiaGram",
  beforeRenderWaveDiaGram: "beforeRenderWaveDiaGram",
}

export function registerRenderWaveDiagramEvent(listener) {
  emitter.addListener(
    RENDER_WAVE_DIAGRAM_EVENT_ENUM.renderWaveDiaGram,
    listener,
  )
}
export function dispatchRenderWaveDiagramEvent(...args) {
  emitter.emit(RENDER_WAVE_DIAGRAM_EVENT_ENUM.renderWaveDiaGram, ...args)
}
export function removeAllRenderWaveDiagramEventListeners() {
  emitter.removeAllListeners(RENDER_WAVE_DIAGRAM_EVENT_ENUM.renderWaveDiaGram)
}
