import { defineStore } from "pinia"
import { ref } from "vue"

export const useTrackFeatureMapStore = defineStore("trackFeatureMap", () => {
  const trackFeatureMap = ref(
    new Map([["1", { midiWorkspace: [], instrument: [], effects: [] }]]),
  )
  const featureEnum = ref({
    MIDI_WORKSPACE: "midiWorkspace",
    INSTRUMENT: "instrument",
    EFFECTS: "effect",
  })
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
  return {
    featureEnum,
    trackFeatureMap,
    addTrackFeatureMap,
    getSelectedTrackFeature,
  }
})
