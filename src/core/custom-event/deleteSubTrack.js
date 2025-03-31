import { EventEmitter } from "@/core/custom-event/EventEmitter.js"

const emitter = new EventEmitter()
const eventName = "delete-sub-track"

export function registerDeleteSubTrackEvent(listener) {
  emitter.addListener(
    eventName,
    ({ audioTrackId, workspaceId, subTrackItemId }) =>
      listener({ audioTrackId, workspaceId, subTrackItemId }),
  )
}
export function disPatchDeleteSubTrackEvent({
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

export function removeDeleteSubTrackEventListener() {
  emitter.removeAllListeners(eventName)
}
