import { EventEmitter } from "@/core/custom-event/EventEmitter.js"

const emitter = new EventEmitter()
const DELETE_AUDIO_TRACK_EVENT_PHASE_ENUM = {
  before: "before",
  after: "after",
}
const eventName = "delete-audio-track"
const deleteEventName = (phase) => `${phase}-${eventName}`

export function registerDeleteAudioTrackEvent(listener, isAfterPhase = true) {
  const phase = isAfterPhase
    ? DELETE_AUDIO_TRACK_EVENT_PHASE_ENUM.after
    : DELETE_AUDIO_TRACK_EVENT_PHASE_ENUM.before
  emitter.addListener(
    deleteEventName(phase),
    ({ audioTrackId, workspaceId, subTrackItemId }) =>
      listener({ audioTrackId, workspaceId, subTrackItemId }),
  )
}
export function disPatchDeleteAudioTrackEvent({
  audioTrackId,
  workspaceId,
  subTrackItemId,
}) {
  emitter.emit(deleteEventName(DELETE_AUDIO_TRACK_EVENT_PHASE_ENUM.before), {
    audioTrackId,
    workspaceId,
    subTrackItemId,
  })
  emitter.emit(deleteEventName(DELETE_AUDIO_TRACK_EVENT_PHASE_ENUM.after), {
    audioTrackId,
    workspaceId,
    subTrackItemId,
  })
}

export function removeDeleteAudioTrackEventListener() {
  for (const eventKey in DELETE_AUDIO_TRACK_EVENT_PHASE_ENUM) {
    emitter.removeAllListeners(deleteEventName(eventKey))
  }
}
