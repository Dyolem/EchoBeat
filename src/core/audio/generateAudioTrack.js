/**
 * mid解析数据结构
 * @typedef {Object} MidiEvent
 * @property {string} type
 * @property {number} tick
 * @property {string | undefined} program
 */

/**
 * @typedef {Object} MidiNote
 * @property {number} channel
 * @property {number} durationTicks
 * @property {number} midi
 * @property {number} startTicks
 * @property {number} velocity
 */

/**
 * @typedef {Object} Track
 * @property {number} channel
 * @property {string} color
 * @property {number | string} id
 * @property {string | undefined} instrument
 * @property {boolean} isMuted
 * @property {string} name
 * @property {MidiEvent[]} events
 * @property {MidiNote[]} notes
 * @property {{startTick:number,endTick:number}} timeRange
 */

/**
 * @typedef {Object} MidiMeta
 * @property {number} formatType
 * @property {number} ppqn
 * @property {number} bpm
 * @property {string} timeSignature
 * @property {number} durationTicks
 */

/**
 * @typedef {Object} MidiData
 * @property {number} version
 * @property {MidiMeta} meta
 * @property {Track[]} tracks
 */

import { useMixTrackEditorStore } from "@/store/daw/mix-track-editor/index.js"
import { useWorkspaceStore } from "@/store/daw/workspace/index.js"
import { useNoteItemStore } from "@/store/daw/note-editor/noteItem.js"
import { useBeatControllerStore } from "@/store/daw/beat-controller/index.js"
import {
  MAIN_EDITOR_ID,
  midiToNoteName,
  SUBORDINATE_EDITOR_ID,
} from "@/constants/daw/index.js"
import { useZoomRatioStore } from "@/store/daw/zoomRatio.js"
import { useAudioStore } from "@/store/daw/audio/index.js"

/**
 *
 * @param {{meta:MidiMeta,tracks:Track[],version:number,mainEditorZoomRatio:number,midiWorkspaceZoomRatio:number}} midiData
 */
export function generateAudioTrack(midiData) {
  const {
    meta,
    tracks,
    version,
    midiWorkspaceZoomRatio = 1,
    mainEditorZoomRatio = 1,
  } = midiData
  const mixTrackEditorStore = useMixTrackEditorStore()
  const workspaceStore = useWorkspaceStore()
  const noteItemStore = useNoteItemStore()
  const audioStore = useAudioStore()
  const beatControllerStore = useBeatControllerStore()
  const zoomRatioStore = useZoomRatioStore()
  const dataConvert = (value) => {
    return zoomRatioStore.convertDataBetweenEditors({
      fromValue: value,
      fromZoomRatio: zoomRatioStore.getSpecifiedEditorZoomRatio(
        SUBORDINATE_EDITOR_ID,
      ),
      toZoomRatio: zoomRatioStore.getSpecifiedEditorZoomRatio(MAIN_EDITOR_ID),
    })
  }
  const parsedAudioTrackIdArr = []
  const { bpm, ppqn, timeSignature } = meta
  beatControllerStore.updateChoreAudioParams({ bpm, ppqn, timeSignature })
  for (const { events, timeRange, notes, name, color } of tracks) {
    if (events.length === 0 && notes.length === 0) continue
    else {
      const { startTick = 0, endTick = 0 } = timeRange
      const editableTotalTime =
        endTick * beatControllerStore.absoluteTimePerTick
      beatControllerStore.updateChoreAudioParams({
        editableTotalTime,
      })
      const audioTrackId = mixTrackEditorStore.addAudioTrack({
        audioTrackName: name,
        mainEditorZoomRatio,
        midiWorkspaceZoomRatio,
      })
      parsedAudioTrackIdArr.push(audioTrackId)
      const newWorkspaceWidth =
        beatControllerStore.pixelsPerTick(SUBORDINATE_EDITOR_ID) *
        (endTick - startTick)
      const newWorkspaceStartPosition =
        beatControllerStore.pixelsPerTick(SUBORDINATE_EDITOR_ID) * startTick
      const newWorkspaceId = workspaceStore.addNewWorkspace({
        audioTrackId,
        badgeName: name,
        width: newWorkspaceWidth,
        startPosition: newWorkspaceStartPosition,
        zoomRatio: midiWorkspaceZoomRatio,
      })
      const subTrackItemId = mixTrackEditorStore.createSubTrackItem({
        audioTrackId,
        workspaceId: newWorkspaceId,
        trackItemWidth: dataConvert(newWorkspaceWidth),
        startPosition: dataConvert(newWorkspaceStartPosition),
        trackName: name,
      })

      const workspace = workspaceStore.getWorkspace({
        audioTrackId,
        workspaceId: newWorkspaceId,
      })
      workspace.subTrackItemId = subTrackItemId
      const noteItemsMap = workspace.noteItemsMap
      for (const {
        channel,
        durationTicks,
        midi,
        startTicks,
        velocity,
      } of notes) {
        const specifiedPitchName = midiToNoteName(midi)
        const template = noteItemStore.getNoteItemTemplate({
          x:
            startTicks *
            beatControllerStore.pixelsPerTick(SUBORDINATE_EDITOR_ID),
          y: noteItemStore.noteHeight * (119 - midi),
          noteItemWidth:
            durationTicks *
            beatControllerStore.pixelsPerTick(SUBORDINATE_EDITOR_ID),
          insertToSpecifiedPitchName: specifiedPitchName,
          workspaceId: newWorkspaceId,
          audioTrackId,
          velocity,
          isDirectPosition: true,
        })
        const noteItems = noteItemsMap.get(specifiedPitchName)?.noteItems
        noteItems?.push(template)
        audioStore.insertSourceNodeAndGainNode(template)
      }
    }
  }
  return parsedAudioTrackIdArr?.[0] ?? ""
}
