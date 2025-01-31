// types.js
/**
 * @typedef {[number, number]} ScaleYTuple - 垂直缩放比例范围元组 [最小值, 最大值]
 */

/**
 * @typedef {string} PitchNameId - 以音名作为Map的键，同时具有id的作用
 */

/**
 * @typedef {Object} PitchAreaElement
 * @property {PitchNameId} pitchName - 音高名称（如 "c4"）
 * @property {ScaleYTuple} scale - 垂直高度范围
 */

/**
 * @typedef {Object} NoteItem
 * @property {PitchNameId} pitchName - 音高名称（与Map键严格一致）
 * @property {string} id - note元素自身id
 * @property {string} width - note元素的宽度
 * @property {string} height - note元素的高度
 * @property {string} x - note元素相对于midi编辑器左上角原点的绝对横坐标
 * @property {string} y - note元素相对于midi编辑器左上角原点的绝对纵坐标
 * @property {number} startTime - 以0时刻为起点的时间参考系，note元素的起始播放时刻
 * @property {number} duration - 以0时刻为起点的时间参考系，note元素的播放持续时间
 * @property {AudioContext} audioContext - 创建note对应的音频节点的音频上下文
 */
/**
 * @typedef {Object} NoteTrack
 * @property {PitchNameId} pitchName - 音高名称（与Map键严格一致）
 * @property {ScaleYTuple} scaleY - 垂直高度范围
 * @property {NoteItem[]} noteItems - 音符项集合（初始化为空数组）
 */

/** @typedef {Map<PitchNameId, NoteTrack>} NoteItemsMap */

/**
 * @typedef {{id: string, type:string, noteItemsMap:NoteItemsMap, width: number, startPosition: number}} WorkspaceMap
 */
