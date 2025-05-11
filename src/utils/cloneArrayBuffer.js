/**
 * 创建 ArrayBuffer 的副本
 * @param {ArrayBuffer} originalBuffer - 原始 ArrayBuffer
 * @returns {ArrayBuffer} - 新的 ArrayBuffer 副本
 */
export function cloneArrayBuffer(originalBuffer) {
  // 创建一个新的 ArrayBuffer 和视图
  const newBuffer = new ArrayBuffer(originalBuffer.byteLength)
  const view = new Uint8Array(newBuffer)
  // 复制数据
  view.set(new Uint8Array(originalBuffer))
  return newBuffer
}
