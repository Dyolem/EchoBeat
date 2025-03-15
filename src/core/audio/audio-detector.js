// audio-detector.js
class AudioDetector extends AudioWorkletProcessor {
  constructor() {
    super()
    this.triggered = false
  }

  process(inputs, outputs) {
    const input = inputs[0]
    const output = outputs[0]

    // 1. 检测音频开始
    if (input && input.length > 0 && !this.triggered) {
      const channelData = input[0]
      for (let i = 0; i < channelData.length; i++) {
        if (channelData[i] !== 0) {
          this.triggered = true
          this.port.postMessage("started")
          break
        }
      }
    }

    // 2. 将输入信号复制到输出
    if (input && output) {
      for (let channel = 0; channel < input.length; channel++) {
        output[channel].set(input[channel]) // 复制输入到输出
      }
    }

    return true
  }
}

registerProcessor("audio-detector", AudioDetector)
