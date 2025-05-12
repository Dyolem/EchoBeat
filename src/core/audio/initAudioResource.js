import { initMetronome } from "@/core/audio/playMetronome.js"
import { useAudioStore } from "@/store/daw/audio/index.js"
import { useAudioGeneratorStore } from "@/store/daw/audio/audioGenerator.js"
import { initYDoc } from "@/core/history/index.js"
import { initPlayer } from "@/core/audio/player.js"
import { initAudioBinaryDataDatabase } from "@/store/daw/audio-binary-data/index.js"
import { initWaveformDiagramOnMounted } from "@/core/audio/generateWaveformDiagram.js"
import {
  registerDestroyProjectEvent,
  registerProjectChangedEvent,
} from "@/core/custom-event/projectManager.js"
import { useBeatControllerStore } from "@/store/daw/beat-controller/index.js"
import { useMixTrackEditorStore } from "@/store/daw/mix-track-editor/index.js"
const mixTrackEditorStore = useMixTrackEditorStore()

const audioGeneratorStore = useAudioGeneratorStore()
const { resetSoundAudioBuffer } = audioGeneratorStore

const beatControllerStore = useBeatControllerStore()
const { initAudioTrackSoundBuffer } = audioGeneratorStore

const audioStore = useAudioStore()
const { initAudioTrackRelativeNode, resetAudioState } = audioStore
export async function initAudioResource(_audioContext) {
  const audioContext = _audioContext || audioStore.audioContext
  try {
    registerProjectChangedEvent(beatControllerStore.resetChoreAudioParams, true)
    registerProjectChangedEvent(
      async () => await initAudioTrackSoundBuffer(audioContext),
    )
    registerProjectChangedEvent(async () => {
      await initAudioTrackRelativeNode(
        new Set([...mixTrackEditorStore.mixTracksMap.keys()]),
      )
    })
    registerProjectChangedEvent(resetAudioState, true)
    registerDestroyProjectEvent(resetSoundAudioBuffer)
    return await Promise.all([
      initYDoc(),
      initMetronome(audioContext),
      initPlayer(),
      initAudioBinaryDataDatabase(),
    ]).then(() => {
      return initWaveformDiagramOnMounted()
    })
  } catch (error) {
    console.log(error)
    throw error
  }
}
