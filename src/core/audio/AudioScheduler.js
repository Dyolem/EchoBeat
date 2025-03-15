export class AudioScheduler {
  /**
   * @param {AudioContext} audioContext
   */
  constructor(audioContext) {
    this.audioContext = audioContext
    this.detectors = new Map() // 存储节点与 Detector 的映射
  }

  async initialize() {
    // 加载 AudioWorklet 脚本
    const detectorURL = new URL("./audio-detector.js", import.meta.url).href
    await this.audioContext.audioWorklet.addModule(detectorURL)
  }

  // 调度音频节点，在播放开始时触发回调
  schedule(source, sourceId, callback) {
    const detectorNode = new AudioWorkletNode(
      this.audioContext,
      "audio-detector",
    )

    // 连接音频节点到检测器
    source.connect(detectorNode)

    // 监听检测器的开始事件
    detectorNode.port.onmessage = (e) => {
      if (e.data === "started") {
        callback() // 触发回调
      }
    }

    // 记录 Detector 节点
    this.detectors.set(sourceId, detectorNode)
    return detectorNode
  }

  // 清理 Detector 节点
  cleanup(sourceId) {
    const detectorNode = this.detectors.get(sourceId)
    if (detectorNode) {
      detectorNode.disconnect()
      this.detectors.delete(sourceId)
    }
  }
}
