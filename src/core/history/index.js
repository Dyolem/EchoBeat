import * as Y from "yjs"
import { IndexeddbPersistence } from "y-indexeddb"
import { ref, computed } from "vue"
import { mapToSerializable, serializableToMap } from "@/core/mapping/index.js"
import { useMixTrackEditorStore } from "@/store/daw/mix-track-editor/index.js"
import { useTrackFeatureMapStore } from "@/store/daw/track-feature-map/index.js"
import { useBeatControllerStore } from "@/store/daw/beat-controller/index.js"
import { useTrackRulerStore } from "@/store/daw/trackRuler/timeLine.js"
import { clearPlayerOnUnmounted, pause, resume } from "@/core/audio/player.js"
import { ID_SET } from "@/constants/daw/index.js"
import { initWaveformDiagramOnMounted } from "@/core/audio/generateWaveformDiagram.js"
import { dispatchProjectChangedEvent } from "@/core/custom-event/projectManager.js"
import { removeAllRenderWaveDiagramEventListeners } from "@/core/custom-event/rerenderWaveDiagram.js"

// 全局项目管理
const PROJECTS_STORAGE_KEY = "seele-daw-projects"
const PROJECT_LIST_DOC = "project-list"

// 项目内容类型
const SHARED_DATA_TYPE_ENUM = {
  yProjectVersion: "yProjectVersion",
  yMixTracksMap: "yMixTracksMap",
  yTrackFeatureMap: "yTrackFeatureMap",
  yChoreBeatControllerParams: "yChoreBeatControllerParams",
}

const OPERATION_TYPE_ENUM = {
  undo: "undo",
  redo: "redo",
  userModification: "userModification",
}

// 状态管理
const hasSavedCurrentProject = ref(false)
const activeProjectId = ref(null)
const projectList = ref([])
const isLoading = ref(false)

// 当前项目文档和提供者
let currentYDoc = null
let currentIndexeddbProvider = null
let currentUndoManager = null
let currentClearObservers = null

// 共享数据引用
let yProjectVersion = null
let yMixTracksMap = null
let yTrackFeatureMap = null
let yChoreBeatControllerParams = null

// 项目列表管理
let projectListDoc = null
let projectListProvider = null

/**
 * 初始化项目列表管理器
 */
async function initProjectManager() {
  // 初始化项目列表文档
  projectListDoc = new Y.Doc()
  projectListProvider = new IndexeddbPersistence(
    PROJECT_LIST_DOC,
    projectListDoc,
  )

  // 等待项目列表加载完成
  await new Promise((resolve) => {
    projectListProvider.whenSynced.then(async () => {
      const projectsMap = projectListDoc.getMap(PROJECTS_STORAGE_KEY)

      // 从存储中加载项目列表
      const storedProjects = projectsMap.get("projects") || []
      projectList.value = storedProjects

      // 获取最后一次打开的项目ID
      const lastOpenedProjectId = projectsMap.get("lastOpenedProjectId")
      let currentProjectId = ""
      // 如果有项目，加载最后打开的项目，否则创建一个默认项目
      if (
        lastOpenedProjectId &&
        projectList.value.some((p) => p.id === lastOpenedProjectId)
      ) {
        console.log("load last")
        await loadProject(lastOpenedProjectId)
        currentProjectId = lastOpenedProjectId
      } else if (projectList.value.length > 0) {
        console.log("load first")
        currentProjectId = projectList.value[0].id
        await loadProject(currentProjectId)
      } else {
        console.log("create default project")
        const { id } = await createNewProject({ projectName: "New Project" })
        currentProjectId = id
      }
      resolve(currentProjectId)
    })
  })

  // 监听项目列表变化
  const projectsMap = projectListDoc.getMap(PROJECTS_STORAGE_KEY)
  projectsMap.observe((event) => {
    if (event.path[0] === "projects") {
      projectList.value = event.newValue || []
    }
  })

  return { projectList, activeProjectId, isLoading }
}

/**
 * 保存项目列表到存储
 */
function saveProjectList() {
  const projectsMap = projectListDoc.getMap(PROJECTS_STORAGE_KEY)
  projectsMap.set("projects", projectList.value)
  projectsMap.set("lastOpenedProjectId", activeProjectId.value)
}

const defaultProjectTemplate = ({ projectName = "New Project" } = {}) => {
  return {
    id: ID_SET.PROJECT_ID("project_id"),
    name: projectName,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    genre: "",
    description: "",
    explicitContent: false,
    forkable: false,
  }
}
/**
 * 创建新项目
 * @param {string} projectName - 项目名称
 * @returns {string} - 新项目的ID
 */
async function createNewProject({ projectName = "New Project" } = {}) {
  isLoading.value = true

  // 创建新项目对象
  const newProject = defaultProjectTemplate({ projectName })
  // 添加到项目列表
  projectList.value.push(newProject)
  saveProjectList()

  // 加载新项目
  await loadProject(newProject.id)
  isLoading.value = false
  return newProject
}

/**
 * 加载指定项目
 * @param {string} projectId - 要加载的项目ID
 */
async function loadProject(projectId) {
  if (activeProjectId.value === projectId) return

  isLoading.value = true

  try {
    // 如果有当前项目，保存当前项目状态并清理
    if (currentYDoc) {
      saveCurrentProject()
      await clearCurrentProject()
    }

    // 初始化新项目文档
    currentYDoc = new Y.Doc()
    currentIndexeddbProvider = new IndexeddbPersistence(
      `seele-daw-${projectId}`,
      currentYDoc,
    )

    // 初始化共享数据引用
    yProjectVersion = currentYDoc.getMap(SHARED_DATA_TYPE_ENUM.yProjectVersion)
    yMixTracksMap = currentYDoc.getMap(SHARED_DATA_TYPE_ENUM.yMixTracksMap)
    yTrackFeatureMap = currentYDoc.getMap(
      SHARED_DATA_TYPE_ENUM.yTrackFeatureMap,
    )
    yChoreBeatControllerParams = currentYDoc.getMap(
      SHARED_DATA_TYPE_ENUM.yChoreBeatControllerParams,
    )

    // 初始化撤销管理器
    currentUndoManager = new Y.UndoManager(currentYDoc, {
      trackedOrigins: new Set([
        OPERATION_TYPE_ENUM.userModification,
        OPERATION_TYPE_ENUM.redo,
        OPERATION_TYPE_ENUM.undo,
      ]),
    })

    // 设置监听器
    currentClearObservers = setupObservers()

    // 等待数据加载完成
    await new Promise((resolve) => {
      currentIndexeddbProvider.whenSynced.then(() => {
        // 从IndexedDB恢复数据
        recoverMixTrackDataFromIndexeddb({ recoverAll: true })
        // 更新活动项目ID
        activeProjectId.value = projectId

        // 更新项目的最后修改时间
        const projectIndex = projectList.value.findIndex(
          (p) => p.id === projectId,
        )
        if (projectIndex !== -1) {
          projectList.value[projectIndex].updatedAt = new Date().toISOString()
          saveProjectList()
        }
        resolve()
      })
    })
    await dispatchProjectChangedEvent()
    await initWaveformDiagramOnMounted()
  } finally {
    isLoading.value = false
  }
}

/**
 * 保存当前项目状态
 */
function saveCurrentProject() {
  if (!currentYDoc) return

  // 保存所有共享数据
  currentYDoc.transact(() => {
    updateMixTrackSharedTypeData()
    updateTrackFeatureSharedTypeData()
    updateChoreBeatControllerParamsSharedData()
    updateProjectVersionSharedData()
  }, OPERATION_TYPE_ENUM.userModification)

  // 更新项目的最后修改时间
  const projectIndex = projectList.value.findIndex(
    (p) => p.id === activeProjectId.value,
  )
  if (projectIndex !== -1) {
    projectList.value[projectIndex].updatedAt = new Date().toISOString()
    saveProjectList()
    hasSavedCurrentProject.value = true
  }
}

/**
 * 清理当前项目资源
 */
async function clearCurrentProject() {
  if (!currentYDoc) return
  await clearPlayerOnUnmounted()
  await dispatchProjectChangedEvent(true)
  removeAllRenderWaveDiagramEventListeners()
  // 清理观察者
  if (currentClearObservers) {
    currentClearObservers()
    currentClearObservers = null
  }

  // 销毁文档
  currentYDoc.destroy()
  currentYDoc = null
  currentIndexeddbProvider = null
  currentUndoManager = null

  // 清空共享数据引用
  yProjectVersion = null
  yMixTracksMap = null
  yTrackFeatureMap = null
  yChoreBeatControllerParams = null
}

/**
 * 删除项目
 * @param {string} projectId - 要删除的项目ID
 */
async function deleteProject(projectId) {
  // 不允许删除当前打开的项目
  if (activeProjectId.value === projectId) {
    throw new Error("不能删除当前打开的项目，请先切换到其他项目")
  }

  // 从项目列表中移除
  const projectIndex = projectList.value.findIndex((p) => p.id === projectId)
  if (projectIndex !== -1) {
    projectList.value.splice(projectIndex, 1)
    saveProjectList()
  }

  // 可选：从IndexedDB中删除项目数据
  try {
    await window.indexedDB.deleteDatabase(`seele-daw-${projectId}`)
  } catch (error) {
    console.error("删除项目数据失败:", error)
  }
}

/**
 * 重命名项目
 * @param {Object} projectDetails - 项目属性对象
 */
function updateProjectDetails(projectDetails) {
  const projectIndex = projectList.value.findIndex(
    (p) => p.id === activeProjectId.value,
  )
  if (projectIndex !== -1) {
    const project = projectList.value[projectIndex]
    Object.keys(projectDetails).forEach((key) => {
      if (projectDetails[key] !== undefined) {
        project[key] = projectDetails[key]
      }
    })
    projectList.value[projectIndex].updatedAt = new Date().toISOString()
    saveProjectList()
  }
}

function recoverMixTrackDataFromIndexeddb({
  sharedDataType,
  recoverAll = sharedDataType === undefined,
} = {}) {
  if (
    !recoverAll &&
    !Object.values(SHARED_DATA_TYPE_ENUM).includes(sharedDataType)
  )
    throw new TypeError("Passed params error")
  const mixTrackStore = useMixTrackEditorStore()
  const trackFeatureMapStore = useTrackFeatureMapStore()
  const beatControllerStore = useBeatControllerStore()
  const handlers = {
    [SHARED_DATA_TYPE_ENUM.yMixTracksMap]() {
      if (yMixTracksMap.size >= 0) {
        const _yMixTracksMap = serializableToMap(yMixTracksMap.toJSON())
        mixTrackStore.mixTracksMap =
          _yMixTracksMap?.["yMixTracksMap"] ?? new Map()
      }
    },
    [SHARED_DATA_TYPE_ENUM.yTrackFeatureMap]() {
      if (yTrackFeatureMap.size >= 0) {
        const _yTrackFeatureMap = serializableToMap(yTrackFeatureMap.toJSON())
        trackFeatureMapStore.trackFeatureMap =
          _yTrackFeatureMap?.["yTrackFeatureMap"] ?? new Map()
      }
    },
    [SHARED_DATA_TYPE_ENUM.yChoreBeatControllerParams]() {
      const trackRulerStore = useTrackRulerStore()
      if (yChoreBeatControllerParams.size >= 0) {
        const params = yChoreBeatControllerParams.get(
          "yChoreBeatControllerParams",
        )
        const { bpm, ppqn, timeSignature, editableTotalTick } = params ?? {}
        if (trackRulerStore.isPlaying) {
          pause().then(() => {
            beatControllerStore.updateChoreAudioParams({
              bpm,
              ppqn,
              timeSignature,
              editableTotalTick,
            })
            resume()
          })
        } else {
          beatControllerStore.updateChoreAudioParams({
            bpm,
            ppqn,
            timeSignature,
            editableTotalTick,
          })
        }
      }
    },
    [SHARED_DATA_TYPE_ENUM.yProjectVersion]() {
      if (yProjectVersion.size >= 0) {
        const newProjectDetailsInfo = yProjectVersion.get("yProjectVersion")
        updateProjectDetails(activeProjectId.value, newProjectDetailsInfo)
      }
    },
  }
  if (recoverAll) {
    for (const handlersKey in handlers) {
      handlers[handlersKey]()
    }
  } else {
    handlers[sharedDataType]()
  }
}

function updateMixTrackSharedTypeData() {
  const mixTrackMapStore = useMixTrackEditorStore()
  yMixTracksMap.set(
    "yMixTracksMap",
    mapToSerializable(mixTrackMapStore.mixTracksMap),
  )
}
function updateTrackFeatureSharedTypeData() {
  const trackFeatureMapStore = useTrackFeatureMapStore()
  yTrackFeatureMap.set(
    "yTrackFeatureMap",
    mapToSerializable(trackFeatureMapStore.trackFeatureMap),
  )
}

function updateChoreBeatControllerParamsSharedData() {
  const beatControllerStore = useBeatControllerStore()
  yChoreBeatControllerParams.set(
    "yChoreBeatControllerParams",
    beatControllerStore.choreBeatControllerParams,
  )
}
function updateProjectVersionSharedData() {
  yProjectVersion.set("yProjectVersion", currentProject.value)
  console.log(yProjectVersion.get("yProjectVersion"))
}

// 观察者设置
function setupObservers() {
  console.log("init observe for project:", activeProjectId.value)
  const clearObserveHandlers = []
  for (const observeKey in observesSet) {
    clearObserveHandlers.push(observesSet[observeKey]())
  }
  return () => clearObserveHandlers.forEach((handler) => handler())
}

function createObserveCallbackHandler(historyFn, otherOriginFn) {
  return (events, transaction) => {
    const origin = transaction.origin
    if (origin === OPERATION_TYPE_ENUM.userModification) {
      // 其他操作（如用户编辑）导致的变更
      otherOriginFn?.()
    } else if (origin instanceof Y.UndoManager) {
      // 撤销/重做操作导致的变更
      historyFn?.()
    }
    // origin还可能是 IndexeddbPersistence 实例，不过一般不对从离线存储获取数据这一事务添加进历史记录，故不再添加分支语句
  }
}
const observesSet = {
  [SHARED_DATA_TYPE_ENUM.yMixTracksMap]: () => {
    const handler = createObserveCallbackHandler(() =>
      recoverMixTrackDataFromIndexeddb({
        sharedDataType: SHARED_DATA_TYPE_ENUM.yMixTracksMap,
      }),
    )
    yMixTracksMap.observeDeep(handler)
    return () => yMixTracksMap.unobserveDeep(handler)
  },
  [SHARED_DATA_TYPE_ENUM.yTrackFeatureMap]: () => {
    const handler = createObserveCallbackHandler(() =>
      recoverMixTrackDataFromIndexeddb({
        sharedDataType: SHARED_DATA_TYPE_ENUM.yTrackFeatureMap,
      }),
    )
    yTrackFeatureMap.observeDeep(handler)
    return () => yTrackFeatureMap.unobserveDeep(handler)
  },
  [SHARED_DATA_TYPE_ENUM.yChoreBeatControllerParams]: () => {
    const handler = createObserveCallbackHandler(() =>
      recoverMixTrackDataFromIndexeddb({
        sharedDataType: SHARED_DATA_TYPE_ENUM.yChoreBeatControllerParams,
      }),
    )
    yChoreBeatControllerParams.observeDeep(handler)
    return () => yChoreBeatControllerParams.unobserveDeep(handler)
  },
  [SHARED_DATA_TYPE_ENUM.yProjectVersion]: () => {
    const handler = createObserveCallbackHandler(() =>
      recoverMixTrackDataFromIndexeddb({
        sharedDataType: SHARED_DATA_TYPE_ENUM.yProjectVersion,
      }),
    )
    yProjectVersion.observeDeep(handler)
    return () => yProjectVersion.unobserveDeep(handler)
  },
}

// 撤销/重做操作
function undo() {
  if (currentUndoManager) {
    currentUndoManager.undo()
  }
}

function redo() {
  if (currentUndoManager) {
    currentUndoManager.redo()
  }
}

// 快照函数
function snapshotProjectDetails() {
  if (!currentYDoc) return

  currentYDoc.transact(() => {
    updateProjectVersionSharedData()
  }, OPERATION_TYPE_ENUM.userModification)
}
function snapshotBeatParams() {
  if (!currentYDoc) return

  currentYDoc.transact(() => {
    updateChoreBeatControllerParamsSharedData()
  }, OPERATION_TYPE_ENUM.userModification)
}

function snapshotYSharedData() {
  if (!currentYDoc) return

  currentYDoc.transact(() => {
    updateMixTrackSharedTypeData()
    updateTrackFeatureSharedTypeData()
  }, OPERATION_TYPE_ENUM.userModification)
}

async function initYDoc() {
  try {
    const { projectList, activeProjectId, isLoading } =
      await initProjectManager()
    console.log(projectList.value, activeProjectId.value, isLoading.value)
  } catch (e) {
    throw e
  }
}
const currentProject = computed(() => {
  return (
    projectList.value.filter(({ id }) => id === activeProjectId.value)?.[0] ??
    {}
  )
})
export {
  // 项目管理API
  initProjectManager,
  defaultProjectTemplate,
  createNewProject,
  loadProject,
  saveCurrentProject,
  deleteProject,
  updateProjectDetails,
  clearCurrentProject,
  currentProject,
  projectList,
  activeProjectId,
  isLoading,
  hasSavedCurrentProject,

  // 原始API的替代品
  currentYDoc as ydoc,
  currentUndoManager as undoManager,
  initYDoc,
  yMixTracksMap,
  yTrackFeatureMap,
  recoverMixTrackDataFromIndexeddb,
  updateMixTrackSharedTypeData,
  updateTrackFeatureSharedTypeData,
  updateChoreBeatControllerParamsSharedData,
  updateProjectVersionSharedData,
  snapshotYSharedData,
  snapshotBeatParams,
  snapshotProjectDetails,
  undo,
  redo,
}
