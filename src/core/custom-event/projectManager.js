import { EventEmitter } from "@/core/custom-event/EventEmitter.js"

const emitter = new EventEmitter()
const PROJECT_MANAGEMENT_EVENT_ENUM = {
  changeProject: "changeProject",
  beforeChangeProject: "beforeChangeProject",
  destroyProject: "destroyProject",
}
export function registerProjectChangedEvent(listener, isBefore = false) {
  if (!isBefore) {
    emitter.addListener(PROJECT_MANAGEMENT_EVENT_ENUM.changeProject, listener)
  } else {
    emitter.addListener(
      PROJECT_MANAGEMENT_EVENT_ENUM.beforeChangeProject,
      listener,
    )
  }
}

export async function dispatchProjectChangedEvent(isBefore) {
  if (!isBefore) {
    return emitter.emitAsync(PROJECT_MANAGEMENT_EVENT_ENUM.changeProject)
  } else {
    return emitter.emitAsync(PROJECT_MANAGEMENT_EVENT_ENUM.beforeChangeProject)
  }
}
export function removeAllProjectChangedEvent() {
  emitter.removeAllListeners(PROJECT_MANAGEMENT_EVENT_ENUM.changeProject)
}
export function registerDestroyProjectEvent(listener) {
  emitter.addListener(PROJECT_MANAGEMENT_EVENT_ENUM.destroyProject, listener, {
    once: true,
  })
}
export function dispatchDestroyProjectEvent() {
  emitter.emit(PROJECT_MANAGEMENT_EVENT_ENUM.destroyProject)
}
export function removeAllProjectEvent() {
  emitter.removeAllListeners(PROJECT_MANAGEMENT_EVENT_ENUM.changeProject)
  emitter.removeAllListeners(PROJECT_MANAGEMENT_EVENT_ENUM.beforeChangeProject)
  emitter.removeAllListeners(PROJECT_MANAGEMENT_EVENT_ENUM.destroyProject)
}
