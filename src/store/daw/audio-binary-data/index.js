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
 * @param {string} [currentProjectId='default'] - 当前项目ID
 * @returns {Promise<void>}
 */
export async function initAudioBinaryDataDatabase(
  currentProjectId = "default",
) {
  useAudioDatabaseCleanup()
  // 如果数据库已经初始化，则直接返回
  if (audioDb) return

  audioDb = new Dexie("AudioBinaryData")
  // 直接创建新版本，包含projectId字段
  audioDb.version(1).stores({
    audioData: "id, projectId, audioBlob, dateAdded",
  })

  console.log("音频二进制数据库初始化完成")

  // 预加载当前项目的音频到内存缓存中
  await preloadExistingAudio(currentProjectId)
}

/**
 * 预加载数据库中已有的音频到缓存
 * @param {string} projectId - 要加载的项目ID
 * @returns {Promise<void>}
 */
async function preloadExistingAudio(projectId) {
  const audioStore = useAudioStore()
  try {
    // 只加载指定项目的音频
    const projectAudio = await audioDb.audioData
      .where("projectId")
      .equals(projectId)
      .toArray()

    // 先清除现有缓存
    audioDecodedBufferMap.clear()

    for (const item of projectAudio) {
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
    console.log(
      `预加载了项目 ${projectId} 的 ${audioDecodedBufferMap.size} 个音频到内存缓存`,
    )
  } catch (err) {
    console.error(`预加载项目 ${projectId} 音频失败:`, err)
  }
}

/**
 * 上传并存储新音频
 * @param {Object} params - 音频参数
 * @param {string} params.id - 音频ID
 * @param {ArrayBuffer} params.audioBlob - 音频二进制数据
 * @param {string} params.projectId - 项目ID，默认为'default'
 * @param {boolean} params.cacheInMemory - 是否缓存到内存，默认为true
 * @returns {Promise<boolean>} - 是否成功
 */
export async function handleAudioUpload({
  id,
  audioBlob,
  projectId = "default",
  cacheInMemory = true,
}) {
  if (!audioDb) await initAudioBinaryDataDatabase(projectId)

  try {
    const audioStore = useAudioStore()

    // 创建原始数据的副本用于存储
    const audioArrayBufferClone = cloneArrayBuffer(audioBlob)

    // 存储到 IndexedDB，包含项目ID
    await audioDb.audioData.put({
      id,
      projectId,
      audioBlob: audioArrayBufferClone,
      dateAdded: new Date(),
    })

    // 如果需要加载到内存缓存
    if (cacheInMemory) {
      // 创建另一个副本用于解码
      const decodeArrayBufferClone = cloneArrayBuffer(audioBlob)

      // 解码并缓存
      const audioDecodedBuffer = await audioStore.audioContext.decodeAudioData(
        decodeArrayBufferClone,
      )
      audioDecodedBufferMap.set(id, audioDecodedBuffer)
    }

    console.log(
      `音频 ${id} 已存储${cacheInMemory ? "并解码" : ""}，属于项目 ${projectId}`,
    )
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
 * @property {string} projectId - The project this audio belongs to
 * @property {string} dateAdded - The date the audio was added
 * Retrieves audio data by ID
 * @param {string} id - The unique identifier for the audio data
 * @param {string} [projectId] - 可选的项目ID，用于验证音频是否属于该项目
 * @returns {Promise<AudioData>} Promise that resolves to audio data object
 */
export async function getOriginAudioBufferFromDatabase(id, projectId) {
  if (!audioDb) await initAudioBinaryDataDatabase()

  const audioData = await audioDb.audioData.get(id)

  // 如果指定了项目ID，验证音频是否属于该项目
  if (projectId && audioData && audioData.projectId !== projectId) {
    console.warn(`音频 ${id} 不属于项目 ${projectId}`)
    return null
  }

  return audioData
}

/**
 * 获取音频用于播放
 * @param {string} audioId - 音频ID
 * @param {boolean} [addToCache=true] - 是否添加到内存缓存
 * @returns {Promise<Object|null>} - 包含解码后音频的对象或null
 */
export async function getAudioForPlayback(audioId, addToCache = true) {
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

      // 如果需要，添加到缓存
      if (addToCache) {
        audioDecodedBufferMap.set(audioId, audioDecodedBuffer)
      }
    }

    return {
      audioDecodedBuffer,
      projectId: (await audioDb.audioData.get(audioId))?.projectId,
    }
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
 * @param {string} [projectId] - 可选的项目ID过滤
 * @returns {Promise<Array>} - 音频元数据数组
 */
export async function listAllAudio(projectId) {
  if (!audioDb) await initAudioBinaryDataDatabase()

  try {
    let allAudio

    if (projectId) {
      // 如果提供了项目ID，只返回该项目的音频
      allAudio = await audioDb.audioData
        .where("projectId")
        .equals(projectId)
        .toArray()
    } else {
      // 否则返回所有音频
      allAudio = await audioDb.audioData.toArray()
    }

    return allAudio.map((item) => ({
      id: item.id,
      projectId: item.projectId,
      dateAdded: item.dateAdded,
      // 可以添加其他需要的元数据，但不包括 audioBlob
    }))
  } catch (error) {
    console.error("获取音频列表失败:", error)
    return []
  }
}

/**
 * 更新音频所属的项目
 * @param {string} audioId - 音频ID
 * @param {string} newProjectId - 新的项目ID
 * @returns {Promise<boolean>} - 是否更新成功
 */
export async function updateAudioProject(audioId, newProjectId) {
  if (!audioDb) await initAudioBinaryDataDatabase()

  try {
    const audio = await audioDb.audioData.get(audioId)
    if (!audio) {
      console.error(`音频 ${audioId} 不存在`)
      return false
    }

    // 更新项目ID
    await audioDb.audioData.update(audioId, { projectId: newProjectId })
    console.log(
      `音频 ${audioId} 已从项目 ${audio.projectId} 移至项目 ${newProjectId}`,
    )
    return true
  } catch (error) {
    console.error(`更新音频 ${audioId} 项目失败:`, error)
    return false
  }
}

/**
 * 删除项目下的所有音频
 * @param {string} projectId - 项目ID
 * @returns {Promise<number>} - 删除的音频数量
 */
export async function deleteProjectAudio(projectId) {
  if (!audioDb) await initAudioBinaryDataDatabase()

  try {
    // 获取项目中的所有音频ID
    const projectAudio = await audioDb.audioData
      .where("projectId")
      .equals(projectId)
      .toArray()
    const audioIds = projectAudio.map((audio) => audio.id)

    // 从缓存中删除
    audioIds.forEach((id) => audioDecodedBufferMap.delete(id))

    // 从数据库中删除
    const count = await audioDb.audioData
      .where("projectId")
      .equals(projectId)
      .delete()

    console.log(`已删除项目 ${projectId} 的 ${count} 个音频文件`)
    return count
  } catch (error) {
    console.error(`删除项目 ${projectId} 音频失败:`, error)
    return 0
  }
}

/**
 * 获取项目列表
 * @returns {Promise<string[]>} - 项目ID列表
 */
export async function listProjects() {
  if (!audioDb) await initAudioBinaryDataDatabase()

  try {
    // 获取所有音频记录的唯一projectId值
    const allAudio = await audioDb.audioData.toArray()
    const projectIds = [...new Set(allAudio.map((item) => item.projectId))]
    return projectIds
  } catch (error) {
    console.error("获取项目列表失败:", error)
    return []
  }
}

/**
 * 获取项目音频统计信息
 * @returns {Promise<Object>} - 各项目音频数量统计
 */
export async function getProjectStats() {
  if (!audioDb) await initAudioBinaryDataDatabase()

  try {
    const allAudio = await audioDb.audioData.toArray()
    const stats = {}

    // 计算每个项目的音频数量
    allAudio.forEach((audio) => {
      const projectId = audio.projectId || "default"
      stats[projectId] = (stats[projectId] || 0) + 1
    })

    return stats
  } catch (error) {
    console.error("获取项目统计信息失败:", error)
    return {}
  }
}

/**
 * 清理数据库和缓存
 * @param {string} [projectId] - 可选的项目ID，如果提供则只清理特定项目
 * @returns {Promise<void>}
 */
export async function clearAudioDatabase(projectId) {
  if (!audioDb) return

  try {
    if (projectId) {
      // 获取要删除的项目音频ID列表
      const projectAudio = await audioDb.audioData
        .where("projectId")
        .equals(projectId)
        .toArray()
      const audioIds = projectAudio.map((audio) => audio.id)

      // 从缓存中删除
      audioIds.forEach((id) => audioDecodedBufferMap.delete(id))

      // 从数据库中删除特定项目的音频
      await audioDb.audioData.where("projectId").equals(projectId).delete()
      console.log(`已清空项目 ${projectId} 的音频数据和缓存`)
    } else {
      // 清空整个数据库
      await audioDb.audioData.clear()
      // 清空缓存
      audioDecodedBufferMap.clear()
      console.log("音频数据库和缓存已完全清空")
    }
  } catch (error) {
    console.error(
      `清空音频数据库${projectId ? "项目 " + projectId : ""}失败:`,
      error,
    )
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

/**
 * 切换当前项目
 * @param {string} projectId - 要切换到的项目ID
 * @returns {Promise<void>}
 */
export async function switchProjectAudio(projectId) {
  try {
    // 清除当前内存缓存
    audioDecodedBufferMap.clear()

    // 加载新项目的音频
    await preloadExistingAudio(projectId)

    console.log(`已切换到项目 ${projectId}，并加载相关音频`)
  } catch (error) {
    console.error(`切换到项目 ${projectId} 失败:`, error)
  }
}

// 组件卸载时清理资源
export function useAudioDatabaseCleanup() {
  onUnmounted(async () => {
    await destroyAudioDatabase()
  })
}
