import { defineStore } from "pinia"
import { ref } from "vue"
import { registerDeleteAudioTrackEvent } from "@/core/custom-event/deleteAudioTrack.js"

export const useTrackFeatureMapStore = defineStore("trackFeatureMap", () => {
  /**
   * @typedef {string} AudioTrackId
   * @typedef {import('../type.js').WorkspaceMap} WorkspaceMap
   * @typedef {Object} TrackFeatureMap
   * @property {WorkspaceMap} midiWorkspace
   * @property {any} instrument
   * @property {any} effects
   * @type {import('vue').Ref<Map<AudioTrackId,WorkspaceMap>>}
   */
  const trackFeatureMap = ref(new Map())
  const featureEnum = ref({
    MIDI_WORKSPACE: "midiWorkspace",
    INSTRUMENT: "instrument",
    EFFECTS: "effect",
  })

  /**
   * @param {AudioTrackId} audioTrackId
   * @param {import('../type.js').MidiWorkspace} midiWorkspace
   * @param {any} instrument
   * @param {any} effects
   */
  function addTrackFeatureMap(
    audioTrackId,
    { midiWorkspace, instrument, effects },
  ) {
    trackFeatureMap.value.set(audioTrackId, {
      [featureEnum.value.MIDI_WORKSPACE]: midiWorkspace,
      [featureEnum.value.INSTRUMENT]: instrument,
      [featureEnum.value.EFFECTS]: effects,
    })
  }
  function getSelectedTrackFeature({ selectedAudioTrackId, featureType }) {
    return trackFeatureMap.value.get(selectedAudioTrackId)?.[featureType]
  }
  function getSelectedTrackWorkspaceMap({ selectedAudioTrackId, featureType }) {
    return getSelectedTrackFeature({ selectedAudioTrackId, featureType })
      ?.workspaceMap
  }

  function deleteDataRelativeToAudioTrack({ audioTrackId }) {
    trackFeatureMap.value.delete(audioTrackId)
  }
  registerDeleteAudioTrackEvent(deleteDataRelativeToAudioTrack)

  return {
    featureEnum,
    trackFeatureMap,
    addTrackFeatureMap,
    getSelectedTrackFeature,
    getSelectedTrackWorkspaceMap,
    deleteDataRelativeToAudioTrack,
  }
})
