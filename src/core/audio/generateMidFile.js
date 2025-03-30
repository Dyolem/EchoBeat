import { Midi } from "@tonejs/midi"
import { storeToRefs } from "pinia"
import { useWorkspaceStore } from "@/store/daw/workspace/index.js"
import { useBeatControllerStore } from "@/store/daw/beat-controller/index.js"

const beatControllerStore = useBeatControllerStore()
const { bpm, beatsPerMeasure, noteValueDenominator } =
  storeToRefs(beatControllerStore)

const workspaceStore = useWorkspaceStore()
const { getWorkspace, getWorkspaceMap } = workspaceStore

function transformNotesToMidiData(midi, { noteItemsArr, trackName }) {
  if (!(midi instanceof Midi)) return
  const track = midi.addTrack()
  track.name = trackName
  noteItemsArr.forEach((noteItem) => {
    const { pitchName, startTime, duration, velocity } = noteItem
    track.addNote({
      name: pitchName,
      time: startTime,
      duration: duration,
      velocity: velocity / 127,
    })
  })
}

export function generateMidTrack({ audioTrackId, workspaceId, trackInfo }) {
  if (!audioTrackId) return
  const { name } = trackInfo
  const midi = new Midi()
  midi.header.setTempo(bpm.value)
  midi.header.timeSignatures.push({
    ticks: 0,
    timeSignature: [beatsPerMeasure.value, noteValueDenominator.value],
  })

  if (workspaceId !== undefined) {
    const workspace = getWorkspace({ audioTrackId, workspaceId })
    const noteItemsMap = workspace.noteItemsMap
    transformNotesToMidiData(midi, {
      noteItemsArr: [...noteItemsMap.values()],
      trackName: name,
    })
  } else {
    const workspaceMap = getWorkspaceMap({ audioTrackId })
    const notes = []
    workspaceMap.forEach((workspace) => {
      const noteItemsMap = workspace.noteItemsMap
      notes.push(...noteItemsMap.values())
    })
    transformNotesToMidiData(midi, { noteItemsArr: notes, trackName: name })
  }
  // 导出为 MIDI 文件
  const arrayBuffer = midi.toArray()
  const blob = new Blob([arrayBuffer], { type: "audio/midi" })
  const url = URL.createObjectURL(blob)

  // 创建隐藏的 <a> 标签触发下载
  const a = document.createElement("a")
  a.style.display = "none"
  a.href = url
  a.download = `${name}.mid` // 自定义文件名
  document.body.appendChild(a)
  a.click()

  // 清理临时 URL 和 DOM 元素
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
