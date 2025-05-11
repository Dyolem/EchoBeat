import { onUnmounted } from "vue"
import { Dexie } from "dexie"
import { useAudioStore } from "@/store/daw/audio/index.js"
import { cloneArrayBuffer } from "@/utils/cloneArrayBuffer.js"

// Dexie 数据库实例
let audioDb = null
// 解码后的音频缓冲区映射
const audioDecodedBufferMap = new Map()

/**
 * 初始化音频二进制数据库
 * @returns {Promise<void>}
 */
export async function initAudioBinaryDataDatabase() {
  useAudioDatabaseCleanup()
  // 如果数据库已经初始化，则直接返回
  if (audioDb) return

  audioDb = new Dexie("AudioBinaryData")
  audioDb.version(1).stores({
    audioData: "id, audioBlob, dateAdded",
  })

  console.log("音频二进制数据库初始化完成")

  // 预加载已有的音频到内存缓存中
  await preloadExistingAudio()
}

/**
 * 预加载数据库中已有的音频到缓存
 * @returns {Promise<void>}
 */
async function preloadExistingAudio() {
  const audioStore = useAudioStore()
  try {
    const allAudio = await audioDb.audioData.toArray()
    for (const item of allAudio) {
      try {
        // 创建 ArrayBuffer 的副本以避免分离问题
        const arrayBufferCopy = await cloneArrayBuffer(item.audioBlob)
        const decodedBuffer =
          await audioStore.audioContext.decodeAudioData(arrayBufferCopy)
        audioDecodedBufferMap.set(item.id, decodedBuffer)
      } catch (err) {
        console.warn(`预加载音频 ${item.id} 失败:`, err)
      }
    }
    console.log(`预加载了 ${audioDecodedBufferMap.size} 个音频到内存缓存`)
  } catch (err) {
    console.error("预加载音频失败:", err)
  }
}

/**
 * 上传并存储新音频
 * @param {Object} params - 音频参数
 * @param {string} params.id - 音频ID
 * @param {ArrayBuffer} params.audioBlob - 音频二进制数据
 * @returns {Promise<boolean>} - 是否成功
 */
export async function handleAudioUpload({ id, audioBlob }) {
  if (!audioDb) await initAudioBinaryDataDatabase()

  try {
    const audioStore = useAudioStore()

    // 创建原始数据的副本用于存储
    const audioArrayBufferClone = cloneArrayBuffer(audioBlob)

    // 存储到 IndexedDB
    await audioDb.audioData.put({
      id,
      audioBlob: audioArrayBufferClone,
      dateAdded: new Date(),
    })

    // 创建另一个副本用于解码
    const decodeArrayBufferClone = cloneArrayBuffer(audioBlob)

    // 解码并缓存
    const audioDecodedBuffer = await audioStore.audioContext.decodeAudioData(
      decodeArrayBufferClone,
    )
    audioDecodedBufferMap.set(id, audioDecodedBuffer)

    console.log(`音频 ${id} 已存储并解码`)
    return true
  } catch (error) {
    console.error(`存储音频 ${id} 失败:`, error)
    return false
  }
}

/**
 * @typedef {Object} AudioData
 * @property {ArrayBuffer} audioBlob - The audio data as an ArrayBuffer
 * @property {string} id - The unique identifier of the audio
 * @property {string} dateAdded - The date the audio was added
 * Retrieves audio data by ID
 * @param {string} id - The unique identifier for the audio data
 * @returns {Promise<AudioData>} Promise that resolves to audio data object
 */
export async function getOriginAudioBufferFromDatabase(id) {
  if (!audioDb) await initAudioBinaryDataDatabase()
  return audioDb.audioData.get(id)
}

/**
 * 获取音频用于播放
 * @param {string} audioId - 音频ID
 * @returns {Promise<Object|null>} - 包含解码后音频的对象或null
 */
export async function getAudioForPlayback(audioId) {
  if (!audioDb) await initAudioBinaryDataDatabase()

  try {
    // 首先尝试从内存缓存获取
    let audioDecodedBuffer = audioDecodedBufferMap.get(audioId)

    if (!audioDecodedBuffer) {
      // 如果缓存中没有，从数据库获取并解码
      const audioData = await audioDb.audioData.get(audioId)
      if (!audioData) return null

      const audioStore = useAudioStore()
      // 克隆数据以避免分离问题
      const arrayBufferCopy = cloneArrayBuffer(audioData.audioBlob)
      audioDecodedBuffer =
        await audioStore.audioContext.decodeAudioData(arrayBufferCopy)

      // 添加到缓存
      audioDecodedBufferMap.set(audioId, audioDecodedBuffer)
    }

    return { audioDecodedBuffer }
  } catch (error) {
    console.error(`获取音频 ${audioId} 失败:`, error)
    return null
  }
}

/**
 * 删除音频
 * @param {string} audioId - 要删除的音频ID
 * @returns {Promise<boolean>} - 是否删除成功
 */
export async function deleteAudio(audioId) {
  if (!audioDb) await initAudioBinaryDataDatabase()

  try {
    // 从数据库删除
    await audioDb.audioData.delete(audioId)
    // 从缓存删除
    audioDecodedBufferMap.delete(audioId)
    console.log(`音频 ${audioId} 已删除`)
    return true
  } catch (error) {
    console.error(`删除音频 ${audioId} 失败:`, error)
    return false
  }
}

/**
 * 获取所有音频的元数据列表(不包含二进制数据)
 * @returns {Promise<Array>} - 音频元数据数组
 */
export async function listAllAudio() {
  if (!audioDb) await initAudioBinaryDataDatabase()

  try {
    // 只返回基本信息，不包含大型二进制数据
    const allAudio = await audioDb.audioData.toArray()
    return allAudio.map((item) => ({
      id: item.id,
      dateAdded: item.dateAdded,
      // 可以添加其他需要的元数据，但不包括 audioBlob
    }))
  } catch (error) {
    console.error("获取音频列表失败:", error)
    return []
  }
}

/**
 * 清理数据库和缓存
 * @returns {Promise<void>}
 */
export async function clearAudioDatabase() {
  if (!audioDb) return

  try {
    // 清空数据库
    await audioDb.audioData.clear()
    // 清空缓存
    audioDecodedBufferMap.clear()
    console.log("音频数据库和缓存已清空")
  } catch (error) {
    console.error("清空音频数据库失败:", error)
  }
}

/**
 * 销毁数据库连接
 * @returns {Promise<void>}
 */
export async function destroyAudioDatabase() {
  if (!audioDb) return

  try {
    audioDecodedBufferMap.clear()
    await audioDb.close()
    audioDb = null
    console.log("音频数据库连接已关闭")
  } catch (error) {
    console.error("关闭音频数据库失败:", error)
  }
}

// 组件卸载时清理资源
export function useAudioDatabaseCleanup() {
  onUnmounted(async () => {
    await destroyAudioDatabase()
  })
}
