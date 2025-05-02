import * as Y from "yjs"
import { IndexeddbPersistence } from "y-indexeddb"
import { mapToSerializable, serializableToMap } from "@/core/mapping/index.js"
import { useMixTrackEditorStore } from "@/store/daw/mix-track-editor/index.js"
import { useTrackFeatureMapStore } from "@/store/daw/track-feature-map/index.js"
import { useBeatControllerStore } from "@/store/daw/beat-controller/index.js"

const ydoc = new Y.Doc()
const yMixTracksMap = ydoc.getMap("y-mix-tracks-map")
const yTrackFeatureMap = ydoc.getMap("yTrackFeatureMap")
const yChoreBeatControllerParams = ydoc.getMap("yChoreBeatControllerParams")

const indexeddbProvider = new IndexeddbPersistence("seele-daw", ydoc)

function initDataFromIndexeddb() {
  return new Promise((resolve, reject) => {
    indexeddbProvider.whenSynced.then((data) => {
      recoverMixTrackDataFromIndexeddb()
      resolve()
    })
  })
}

function recoverMixTrackDataFromIndexeddb() {
  const mixTrackStore = useMixTrackEditorStore()
  const trackFeatureMapStore = useTrackFeatureMapStore()
  const beatControllerStore = useBeatControllerStore()

  if (yMixTracksMap.size >= 0) {
    const _yMixTracksMap = serializableToMap(yMixTracksMap.toJSON())
    mixTrackStore.mixTracksMap = _yMixTracksMap?.["yMixTracksMap"] ?? new Map()
  }

  if (yTrackFeatureMap.size >= 0) {
    const _yTrackFeatureMap = serializableToMap(yTrackFeatureMap.toJSON())
    trackFeatureMapStore.trackFeatureMap =
      _yTrackFeatureMap?.["yTrackFeatureMap"] ?? new Map()
  }
  if (yChoreBeatControllerParams.size >= 0) {
    const params = yChoreBeatControllerParams.get("yChoreBeatControllerParams")
    if (!params) return
    const { bpm, ppqn, timeSignature, editableTotalTick } = params
    beatControllerStore.updateChoreAudioParams({
      bpm,
      ppqn,
      timeSignature,
      editableTotalTick,
    })
  }
}
const undoManager = new Y.UndoManager(ydoc)
// 暴露操作方法
const undo = () => undoManager.undo()
const redo = () => undoManager.redo()

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

function transact(transactionFn) {
  let transactionRes = null
  ydoc.transact(() => {
    transactionRes = transactionFn()
  })
  return transactionRes
}

function snapshotYSharedData() {
  ydoc.transact(() => {
    updateMixTrackSharedTypeData()
    updateTrackFeatureSharedTypeData()
  })
}

export {
  ydoc,
  undoManager,
  yMixTracksMap,
  yTrackFeatureMap,
  initDataFromIndexeddb,
  recoverMixTrackDataFromIndexeddb,
  updateMixTrackSharedTypeData,
  updateTrackFeatureSharedTypeData,
  updateChoreBeatControllerParamsSharedData,
  transact,
  snapshotYSharedData,
  undo,
  redo,
}
