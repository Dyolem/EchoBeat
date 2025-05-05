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
      // 明确移除消息监听器
      detectorNode.port.onmessage = null

      // 关闭端口通信
      try {
        detectorNode.port.close()
      } catch (e) {
        // 忽略可能的错误，有些浏览器可能不支持close方法
        console.warn("Could not close detector port:", e)
      }

      // 断开节点连接
      detectorNode.disconnect()

      // 从Map中删除引用
      this.detectors.delete(sourceId)
    }
  }
}
