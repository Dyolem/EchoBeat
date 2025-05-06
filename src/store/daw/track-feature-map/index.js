import { defineStore } from "pinia"
import { ref } from "vue"
import { registerDeleteAudioTrackEvent } from "@/core/custom-event/deleteAudioTrack.js"

export const useTrackFeatureMapStore = defineStore("trackFeatureMap", () => {
  /**
   * @typedef {string} AudioTrackId
   * @typedef {import('../type.js').WorkspaceMap} WorkspaceMap
   * @typedef {Object} TrackFeatureMap
   * @property {WorkspaceMap} workspaceMap
   * @type {import('vue').Ref<Map<AudioTrackId,TrackFeatureMap>>}
   */
  const trackFeatureMap = ref(new Map())

  /**
   * @param {AudioTrackId} audioTrackId
   * @param {import('../type.js').MidiWorkspace} midiWorkspace
   */
  function addTrackFeatureMap({ audioTrackId, midiWorkspace }) {
    trackFeatureMap.value.set(audioTrackId, {
      workspaceMap: midiWorkspace,
    })
  }
  function getSelectedTrackWorkspaceMap({ audioTrackId }) {
    return trackFeatureMap.value.get(audioTrackId).workspaceMap
  }

  function deleteDataRelativeToAudioTrack({ audioTrackId }) {
    trackFeatureMap.value.delete(audioTrackId)
  }
  registerDeleteAudioTrackEvent(deleteDataRelativeToAudioTrack)

  return {
    trackFeatureMap,
    addTrackFeatureMap,
    getSelectedTrackWorkspaceMap,
    deleteDataRelativeToAudioTrack,
  }
})
