import { initMetronome } from "@/core/audio/playMetronome.js"
import { useAudioStore } from "@/store/daw/audio/index.js"
import { useAudioGeneratorStore } from "@/store/daw/audio/audioGenerator.js"
const audioGeneratorStore = useAudioGeneratorStore()
const { preCreateBuffer } = audioGeneratorStore
const audioStore = useAudioStore()
export async function initAudioResource(_audioContext) {
  const audioContext = _audioContext || audioStore.audioContext
  try {
    return await Promise.all([
      initMetronome(audioContext),
      preCreateBuffer(audioContext),
    ])
  } catch (error) {
    throw error
  }
}
