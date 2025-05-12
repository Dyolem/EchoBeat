<script setup>
import { debounce } from "@/utils/debounce.js"
import EditorHeader from "@/views/daw/header/index.vue"
import MixTrackEditor from "@/views/daw/mix-track-editor/index.vue"
import EditorFooter from "@/views/daw/footer/index.vue"

import {
  computed,
  onMounted,
  onUnmounted,
  provide,
  ref,
  watch,
  watchEffect,
} from "vue"
import {
  FOLDED_AUDIO_TRACK_HEIGHT,
  UNFOLDED_AUDIO_TRACK_HEIGHT,
  INIT_FOOTER_HEIGHT,
  INIT_HEADER_HEIGHT,
  MAIN_EDITOR_ID,
} from "@/constants/daw/index.js"
import { useZoomRatioStore } from "@/store/daw/zoomRatio.js"
import {
  registerDeleteAudioTrackEvent,
  removeDeleteAudioTrackEventListener,
} from "@/core/custom-event/deleteAudioTrack.js"
import {
  registerDeleteSubTrackEvent,
  removeDeleteSubTrackEventListener,
} from "@/core/custom-event/deleteSubTrack.js"
import { storeToRefs } from "pinia"
import { useAudioStore } from "@/store/daw/audio/index.js"
import { useMixTrackEditorStore } from "@/store/daw/mix-track-editor/index.js"
import { initAudioResource } from "@/core/audio/initAudioResource.js"
import { snapshotYSharedData } from "@/core/history/index.js"
import {
  dispatchDestroyProjectEvent,
  removeAllProjectEvent,
} from "@/core/custom-event/projectManager.js"
import { removeAllRenderWaveDiagramEventListeners } from "@/core/custom-event/rerenderWaveDiagram.js"

const mixTrackEditorStore = useMixTrackEditorStore()
const audioStore = useAudioStore()
const { initAudioTrackRelativeNode } = audioStore
const { mutedAudioTrackIdSet, soloAudioTrackId } = storeToRefs(audioStore)
const { activeMixTrackId } = storeToRefs(mixTrackEditorStore)
const { updateSelectedActiveAudioTrackId } = mixTrackEditorStore
const zoomRatioStore = useZoomRatioStore()

const loading = ElLoading.service({
  lock: true,
  text: "Loading",
  background: "rgba(0, 0, 0, 0.7)",
})

zoomRatioStore.initZoomRatioMap()
watch(
  () => mixTrackEditorStore.mixTracksMap.size,
  () => {
    initAudioTrackRelativeNode(new Set(mixTrackEditorStore.mixTracksMap.keys()))
  },
  { immediate: true },
)
initAudioResource(audioStore.audioContext)
  .then(() => {
    loading.close()
  })
  .catch(() => {
    loading.close()
    ElNotification({
      title: "Error",
      message:
        "Audio resource loading error, please refresh the page and try again",
      type: "error",
    })
  })

const headerHeight = ref(INIT_HEADER_HEIGHT)
const footerHeight = ref(INIT_FOOTER_HEIGHT)

const editorSideBarWidth = ref(300)

const controller = new AbortController()
const exceptEditorHeight = computed(() => {
  return headerHeight.value + footerHeight.value
})

const mainEditorViewWidth = ref(window.innerWidth - editorSideBarWidth.value)
const mainEditorViewHeight = ref(window.innerHeight - exceptEditorHeight.value)
watchEffect(() => {
  mainEditorViewHeight.value = window.innerHeight - exceptEditorHeight.value
})

function resizeHandler(event) {
  mainEditorViewWidth.value = window.innerWidth - editorSideBarWidth.value
  mainEditorViewHeight.value = window.innerHeight - exceptEditorHeight.value
}
const debouncedResizeHandler = debounce(resizeHandler, 200)
window.addEventListener("resize", debouncedResizeHandler, {
  signal: controller.signal,
})

onMounted(() => {
  resizeHandler()
})
onUnmounted(() => {
  controller.abort()
  dispatchDestroyProjectEvent()
  removeDeleteAudioTrackEventListener()
  removeDeleteSubTrackEventListener()
  removeAllProjectEvent()
  removeAllRenderWaveDiagramEventListeners()
})

watch(
  () => mixTrackEditorStore.mixTracksMap.size,
  () => {
    const audioTrackIdsArr = Array.from(mixTrackEditorStore.mixTracksMap.keys())
    if (!audioTrackIdsArr.includes(activeMixTrackId.value)) {
      updateSelectedActiveAudioTrackId(
        mixTrackEditorStore.mixTracksMap.keys().next().value,
      )
    }
  },
)
registerDeleteAudioTrackEvent(({ audioTrackId }) => {
  if (audioTrackId !== activeMixTrackId.value) return
  const audioTrackIdsArr = Array.from(mixTrackEditorStore.mixTracksMap.keys())
  const lastAudioTrackIdIndex = audioTrackIdsArr.findIndex(
    (id) => id === audioTrackId,
  )
  if (lastAudioTrackIdIndex === -1 || lastAudioTrackIdIndex === 0) {
    updateSelectedActiveAudioTrackId("")
  } else {
    updateSelectedActiveAudioTrackId(
      audioTrackIdsArr[lastAudioTrackIdIndex - 1],
    )
  }
}, false)
registerDeleteAudioTrackEvent(() => {
  snapshotYSharedData()
})

provide("selectedAudioTrackId", {
  selectedAudioTrackId: activeMixTrackId,
  updateSelectedAudioTrackId: updateSelectedActiveAudioTrackId,
})

const selectedTrackItemId = ref("")
function updateSelectedTrackItemId(newId) {
  if (newId === undefined || newId === null) return
  selectedTrackItemId.value = newId
}
registerDeleteSubTrackEvent(() => {
  updateSelectedTrackItemId("")
  snapshotYSharedData()
})
provide("selectedTrackItemId", {
  selectedTrackItemId,
  updateSelectedTrackItemId,
})

const isMuted = computed(() => {
  return (audioTrackId) => mutedAudioTrackIdSet.value.has(audioTrackId)
})
const isSolo = computed(() => {
  return (audioTrackId) => soloAudioTrackId.value === audioTrackId
})
const filterEffect = computed(() => {
  return (audioTrackId) => {
    let grayscale = `grayscale(0)`
    if (isMuted.value(audioTrackId)) {
      grayscale = `grayscale(1)`
    } else {
      if (!!soloAudioTrackId.value && !isSolo.value(audioTrackId)) {
        grayscale = `grayscale(1)`
      }
    }
    return `${grayscale}`
  }
})

provide("playableAudioTrack", { isMuted, isSolo, filterEffect })

const unfoldHeight = ref(UNFOLDED_AUDIO_TRACK_HEIGHT)
const foldHeight = ref(FOLDED_AUDIO_TRACK_HEIGHT)
const foldedAudioTrackIdSet = ref(new Set())
const isFolded = computed(() => {
  return (audioTrackId) => foldedAudioTrackIdSet.value.has(audioTrackId)
})
const totalAudioTracksHeight = computed(() => {
  return (
    mixTrackEditorStore.mixTracksMap.size * unfoldHeight.value -
    foldedAudioTrackIdSet.value.size * (unfoldHeight.value - foldHeight.value)
  )
})
function addFoldedAudioTrack({ audioTrackId }) {
  foldedAudioTrackIdSet.value.add(audioTrackId)
}
function cancelSpecifiedFoldedAudioTrack({ audioTrackId }) {
  foldedAudioTrackIdSet.value.delete(audioTrackId)
}
provide("foldedAudioTrack", {
  unfoldHeight,
  foldHeight,
  totalAudioTracksHeight,
  isFolded,
  foldedAudioTrackIdSet,
  addFoldedAudioTrack,
  cancelSpecifiedFoldedAudioTrack,
})
registerDeleteSubTrackEvent(({ audioTrackId }) =>
  cancelSpecifiedFoldedAudioTrack({ audioTrackId }),
)
</script>

<template>
  <div id="main">
    <EditorHeader />

    <MixTrackEditor
      :main-editor-id="MAIN_EDITOR_ID"
      :main-editor-view-width="mainEditorViewWidth"
      :main-editor-view-height="mainEditorViewHeight"
    ></MixTrackEditor>
    <EditorFooter v-model:footer-height="footerHeight"></EditorFooter>
  </div>
</template>

<style scoped>
#main {
  --default-header-height: v-bind(INIT_HEADER_HEIGHT + "px");
  --default-footer-height: v-bind(INIT_FOOTER_HEIGHT + "px");
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
