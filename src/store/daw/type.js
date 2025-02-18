// types.js

/**
 * @typedef {string} AudioTrackId - 音轨唯一标识符
 * @typedef {string} SubTrackItemId
 * @typedef {string} WorkspaceId
 * @typedef {string} PitchNameId - 以音名作为Map的键，同时具有id的作用
 */

/**
 * @typedef {[number, number]} ScaleYTuple - 垂直缩放比例范围元组 [最小值, 最大值]
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
 * @property {WorkspaceId} workspaceId - note元素所属的工作区的id
 * @property {AudioTrackId} audioTrackId - note元素所属音轨的id
 * @property {number} width - note元素的宽度
 * @property {number} height - note元素的高度
 * @property {number} relativeX - note元素相对于所属工作区的左上角原点的绝对横坐标
 * @property {number} y - note元素相对于midi编辑器左上角原点的绝对纵坐标
 * @property {number} workspaceStartPosition - note元素所属的工作区相对于midi编辑器左上角原点的绝对横坐标
 * @property {number} startTime - 以0时刻为起点的时间参考系，note元素的起始播放时刻
 * @property {number} duration - 以0时刻为起点的时间参考系，note元素的播放持续时间
 *
 * @property {number} x - note元素相对于midi编辑器左上角原点的绝对横坐标
 * @getter
 * @returns {number}
 *
 * @property {number} workspaceStartPosition - note元素所属的工作区相对于midi编辑器左上角原点的绝对横坐标
 * @getter
 * @returns {number}
 *
 * @property {number} startTime - 以0时刻为起点的时间参考系，note元素的起始播放时刻
 * @getter
 * @returns {number}
 *
 * @property {number} duration - 以0时刻为起点的时间参考系，note元素的播放持续时间
 * @getter
 * @returns {number}
 */

/**
 * @typedef {Object} NoteTrack
 * @property {PitchNameId} pitchName - 音高名称（与Map键严格一致）
 * @property {ScaleYTuple} scaleY - 垂直高度范围
 * @property {NoteItem[]} noteItems - 音符项集合（初始化为空数组）
 */

/** @typedef {Map<PitchNameId, NoteTrack>} NoteItemsMap */

/**
 * @typedef {Object} Workspace
 * @property {WorkspaceId} id - 工作区自身唯一ID
 * @property {string} audioTrackId - 工作区所属音轨的唯一ID
 * @property {number} startPosition - 工作区起始位置
 * @property {NoteItemsMap} noteItemsMap - 工作区内创建的note元素的Map集合
 * @property {number} width - 工作区宽度
 * @property {string} workspaceBadgeName - 工作区名称
 * @property {number} zoomRatio - 工作区缩放比例
 * @property {SubTrackItemId} subTrackItemId - 与工作区映射的子音轨
 *
 * @typedef {Map<WorkspaceId,Workspace>} WorkspaceMap
 */

/**
 * @typedef {Object} SubTrackItem
 * @property {SubTrackItemId} subTrackItemId
 * @property {AudioTrackId} audioTrackId
 * @property {WorkspaceId} workspaceId
 * @property {number} trackItemWidth
 * @property {number} trackItemHeight
 * @property {string} mainColor
 * @property {number} startPosition
 * @property {string} trackName
 * @property {number} trackZoomRatio
 */
/**
 * @typedef {Map<SubTrackItemId,SubTrackItem>} SubTrackItemsMap
 */

/**
 * @typedef {Object} MixTrackUnit
 * @property {AudioTrackId} id - 音轨的唯一标识符
 * @property {string} audioTrackName - 音轨显示名称
 * @property {string} mainColor - 音轨主色（十六进制颜色代码）
 * @property {number} serialNumbering - 音轨序号
 * @property {number} startPosition - 音轨起始位置（单位：像素）
 * @property {SubTrackItemsMap} subTrackItemsMap - 音轨中的子工作区
 * @property {number} mainEditorZoomRatio - 主编辑区的缩放倍率
 */

/**
 * @typedef {Map<AudioTrackId,MixTrackUnit>} MixTracksMap -存储所有音轨的Map集合
 */

/**
 * @typedef {Object} MidiWorkspace
 * @property {string} workspaceBadgeName
 * @property {Number} zoomRatio - midi编辑区的当前的缩放倍率
 * @property {WorkspaceMap} workspaceMap - 存储midi工作区的Map结构
 */
