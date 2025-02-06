import { defineStore } from "pinia"
import { ref } from "vue"

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
   * @typedef {AudioTrackId} TrackFeatureMapId
   * @param trackFeatureMapId
   * @param {import('../type.js').MidiWorkspace} midiWorkspace
   * @param {any} instrument
   * @param {any} effects
   */
  function addTrackFeatureMap(
    trackFeatureMapId,
    { midiWorkspace, instrument, effects },
  ) {
    trackFeatureMap.value.set(trackFeatureMapId, {
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
  return {
    featureEnum,
    trackFeatureMap,
    addTrackFeatureMap,
    getSelectedTrackFeature,
    getSelectedTrackWorkspaceMap,
  }
})
