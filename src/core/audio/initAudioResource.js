import { initMetronome } from "@/core/audio/playMetronome.js"
import { useAudioStore } from "@/store/daw/audio/index.js"
import { useAudioGeneratorStore } from "@/store/daw/audio/audioGenerator.js"
import { initYDoc } from "@/core/history/index.js"
import { initPlayer } from "@/core/audio/player.js"
import { initAudioBinaryDataDatabase } from "@/store/daw/audio-binary-data/index.js"
import { initWaveformDiagramOnMounted } from "@/core/audio/generateWaveformDiagram.js"
const audioGeneratorStore = useAudioGeneratorStore()
const { initAudioTrackSoundBuffer } = audioGeneratorStore
const audioStore = useAudioStore()
export async function initAudioResource(_audioContext) {
  const audioContext = _audioContext || audioStore.audioContext
  try {
    return await Promise.all([
      initYDoc(),
      initMetronome(audioContext),
      initPlayer(),
      initAudioBinaryDataDatabase(),
      initAudioTrackSoundBuffer(audioContext),
    ]).then(() => {
      return initWaveformDiagramOnMounted()
    })
  } catch (error) {
    console.log(error)
    throw error
  }
}
