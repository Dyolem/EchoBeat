import { defineStore } from "pinia"
import { NOTE_FREQUENCY_MAP } from "@/constants/daw/index.js"

export const useAudioGeneratorStore = defineStore("audioGenerator", () => {
  const AudioContext = window.AudioContext || window.webkitAudioContext
  const audioContext = new AudioContext()

  const noteFrequencyMap = NOTE_FREQUENCY_MAP

  function generateAudio(noteName) {
    const frequency = noteFrequencyMap.get(noteName)
    console.log(noteName, frequency)
    if (!frequency) return
    console.log(frequency)
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    // Connect oscillator -> gain -> destination
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    // Set the frequency and waveform type
    oscillator.frequency.value = frequency
    oscillator.type = "sine"

    // Control the envelope
    gainNode.gain.setValueAtTime(0, audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(1, audioContext.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + 1,
    )

    // Start and stop the oscillator
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 1)
  }
  return { generateAudio }
})
