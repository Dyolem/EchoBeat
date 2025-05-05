import * as Y from "yjs"
import { IndexeddbPersistence } from "y-indexeddb"
import { mapToSerializable, serializableToMap } from "@/core/mapping/index.js"
import { useMixTrackEditorStore } from "@/store/daw/mix-track-editor/index.js"
import { useTrackFeatureMapStore } from "@/store/daw/track-feature-map/index.js"
import { useBeatControllerStore } from "@/store/daw/beat-controller/index.js"
import { pause, resume } from "@/core/audio/player.js"
import { useTrackRulerStore } from "@/store/daw/trackRuler/timeLine.js"
import { onUnmounted } from "vue"

const SHARED_DATA_TYPE_ENUM = {
  yMixTracksMap: "yMixTracksMap",
  yTrackFeatureMap: "yTrackFeatureMap",
  yChoreBeatControllerParams: "yChoreBeatControllerParams",
}
const OPERATION_TYPE_ENUM = {
  undo: "undo",
  redo: "redo",
  userModification: "userModification",
}

let ydoc = null
let yMixTracksMap = null
let yTrackFeatureMap = null
let yChoreBeatControllerParams = null
let indexeddbProvider = null
let clearObservers = null

// 初始化 UndoManager
let undoManager = null
const undo = () => undoManager.undo()
const redo = () => undoManager.redo()

// 初始化
async function initYDoc() {
  ydoc = new Y.Doc()
  indexeddbProvider = new IndexeddbPersistence("seele-daw", ydoc)
  yMixTracksMap = ydoc.getMap(SHARED_DATA_TYPE_ENUM.yMixTracksMap)
  yTrackFeatureMap = ydoc.getMap(SHARED_DATA_TYPE_ENUM.yTrackFeatureMap)
  yChoreBeatControllerParams = ydoc.getMap(
    SHARED_DATA_TYPE_ENUM.yChoreBeatControllerParams,
  )
  undoManager = new Y.UndoManager(ydoc, {
    trackedOrigins: new Set([
      OPERATION_TYPE_ENUM.userModification,
      OPERATION_TYPE_ENUM.redo,
      OPERATION_TYPE_ENUM.undo,
    ]), // 跟踪用户操作
    // 可选：跟踪其他来源
  })
  clearObservers = setupObservers()
  onUnmounted(() => {
    clearYDocOnUnmounted()
  })
  return initDataFromIndexeddb()
}

function initDataFromIndexeddb() {
  return new Promise((resolve, reject) => {
    indexeddbProvider.whenSynced.then((data) => {
      recoverMixTrackDataFromIndexeddb({ recoverAll: true })
      resolve()
    })
  })
}

// 统一处理所有共享数据的观察
function setupObservers() {
  console.log("init observe")
  const clearObserveHandlers = []
  for (const observeKey in observesSet) {
    clearObserveHandlers.push(observesSet[observeKey]())
  }
  return () => clearObserveHandlers.forEach((handler) => handler())
}

function clearYDocOnUnmounted() {
  clearObservers?.()
  ydoc.destroy()
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

function transact(transactionFn, origin) {
  let transactionRes = null
  ydoc.transact(() => {
    transactionRes = transactionFn()
  }, origin)
  return transactionRes
}

function snapshotBeatParams() {
  ydoc.transact(() => {
    updateChoreBeatControllerParamsSharedData()
  }, OPERATION_TYPE_ENUM.userModification)
}
function snapshotYSharedData() {
  ydoc.transact(() => {
    updateMixTrackSharedTypeData()
    updateTrackFeatureSharedTypeData()
  }, OPERATION_TYPE_ENUM.userModification)
}

function createObserveCallbackHandler(historyFn, otherOriginFn) {
  return (events, transaction) => {
    const origin = transaction.origin
    if (origin === OPERATION_TYPE_ENUM.userModification) {
      // 其他操作（如用户编辑）导致的变更
      otherOriginFn?.()
    } else if (origin instanceof Y.UndoManager) {
      // 不同与自定义的origin值，对于UndoManager，IndexeddbPersistence等官方提供的API，origin都是对应实例
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
}

// 用户操作时，使用特定的 origin
function userModification() {
  ydoc.transact(() => {
    // 用户的修改操作
    // ...
  }, OPERATION_TYPE_ENUM.userModification)
}

export {
  ydoc,
  undoManager,
  yMixTracksMap,
  yTrackFeatureMap,
  initYDoc,
  clearYDocOnUnmounted,
  recoverMixTrackDataFromIndexeddb,
  updateMixTrackSharedTypeData,
  updateTrackFeatureSharedTypeData,
  updateChoreBeatControllerParamsSharedData,
  transact,
  snapshotYSharedData,
  snapshotBeatParams,
  undo,
  redo,
}
