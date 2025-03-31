import { EventEmitter } from "@/core/custom-event/EventEmitter.js"

const emitter = new EventEmitter()
const eventName = "delete-audio-track"
export function registerDeleteAudioTrackEvent(listener) {
  emitter.addListener(
    eventName,
    ({ audioTrackId, workspaceId, subTrackItemId }) =>
      listener({ audioTrackId, workspaceId, subTrackItemId }),
  )
}
export function disPatchDeleteAudioTrackEvent({
  audioTrackId,
  workspaceId,
  subTrackItemId,
}) {
  emitter.emit(eventName, {
    audioTrackId,
    workspaceId,
    subTrackItemId,
  })
}

export function removeDeleteAudioTrackEventListener() {
  emitter.removeAllListeners(eventName)
}
