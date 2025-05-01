import { initMetronome } from "@/core/audio/playMetronome.js"
import { useAudioStore } from "@/store/daw/audio/index.js"
import { useAudioGeneratorStore } from "@/store/daw/audio/audioGenerator.js"
import { initDataFromIndexeddb } from "@/core/history/index.js"
const audioGeneratorStore = useAudioGeneratorStore()
const { initAudioTrackSoundBuffer } = audioGeneratorStore
const audioStore = useAudioStore()
export async function initAudioResource(_audioContext) {
  const audioContext = _audioContext || audioStore.audioContext
  try {
    await initDataFromIndexeddb()
    return await Promise.all([
      initMetronome(audioContext),
      initAudioTrackSoundBuffer(audioContext),
    ])
  } catch (error) {
    throw error
  }
}
