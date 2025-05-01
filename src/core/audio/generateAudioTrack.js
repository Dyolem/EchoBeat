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
 * @property {number} initialBpm
 * @property {TempoEvent[]} tempoEvents
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
  AUDIO_TRACK_ENUM,
  AUDIO_TRACK_TYPE_CONFIG,
} from "@/constants/daw/index.js"
import {
  getInitInstrumentInfo,
  gmProgramMap,
} from "@/constants/daw/instruments.js"
import { useAudioGeneratorStore } from "@/store/daw/audio/audioGenerator.js"

// /**
//  *
//  * @param {{meta:MidiMeta,tracks:Track[],version:number,mainEditorZoomRatio:number,midiWorkspaceZoomRatio:number}} midiData
//  */
export function generateAudioTrack({
  midiData,
  generatedStartTick = 100,
  alignTracks = false,
}) {
  const { header, tracks } = midiData
  const { name: headerName, tempos, timeSignatures, ppq } = header
  const mixTrackEditorStore = useMixTrackEditorStore()
  const workspaceStore = useWorkspaceStore()
  const noteItemStore = useNoteItemStore()
  const beatControllerStore = useBeatControllerStore()
  const audioGeneratorStore = useAudioGeneratorStore()
  const { addSoundBuffer } = audioGeneratorStore

  const addSoundBufferWorkArr = []
  const parsedAudioTrackIdArr = []
  const bpm = tempos[0]?.bpm
  const ppqn = ppq
  const timeSignature = timeSignatures[0]?.timeSignature
  beatControllerStore.updateChoreAudioParams({
    ppqn,
    timeSignature,
  })

  const midiTypeAudioTrackInfo = AUDIO_TRACK_TYPE_CONFIG.get(
    AUDIO_TRACK_ENUM.VIRTUAL_INSTRUMENTS,
  )
  const defaultInstrument = { number: 0, ...gmProgramMap["0"] }
  for (const {
    channel = 0,
    notes,
    name,
    instrument = defaultInstrument,
    endOfTrackTicks,
    durationTicks,
  } of tracks) {
    if (notes.length === 0) continue
    else {
      let endTick = 0
      if (endOfTrackTicks === undefined) {
        endTick = durationTicks + generatedStartTick
      } else {
        endTick = endOfTrackTicks + generatedStartTick
      }

      beatControllerStore.updateChoreAudioParams({
        editableTotalTick: endTick,
      })
      let startTick = 0
      if (alignTracks) {
        startTick = generatedStartTick
      } else {
        startTick = endTick - durationTicks
      }

      const audioTrackType = midiTypeAudioTrackInfo.type
      const audioTrackName = name === "" ? audioTrackType : name
      const { number } = instrument
      const { instrumentName, family, sound, customInstrumentType } =
        getInitInstrumentInfo({ programNumber: number, channel })
      addSoundBufferWorkArr.push(addSoundBuffer({ soundName: sound }))

      const audioTrackId = mixTrackEditorStore.addAudioTrack({
        audioTrackName,
        audioTrackType,
        audioTrackIcon: midiTypeAudioTrackInfo.icon,
        channel,
        instrument: {
          number,
          customInstrumentType,
          family,
          name: instrumentName,
          sound,
        },
      })
      parsedAudioTrackIdArr.push(audioTrackId)
      const newWorkspaceWidth = endTick - startTick
      const newWorkspaceStartPosition = startTick
      const newWorkspaceId = workspaceStore.addNewWorkspace({
        audioTrackId,
        badgeName: audioTrackName,
        width: newWorkspaceWidth,
        startPosition: newWorkspaceStartPosition,
      })
      const subTrackItemId = mixTrackEditorStore.createSubTrackItem({
        audioTrackId,
        workspaceId: newWorkspaceId,
        trackItemWidth: newWorkspaceWidth,
        startPosition: newWorkspaceStartPosition,
        trackName: audioTrackName,
      })

      const workspace = workspaceStore.getWorkspace({
        audioTrackId,
        workspaceId: newWorkspaceId,
      })
      workspace.subTrackItemId = subTrackItemId
      const noteItemsMap = workspace.noteItemsMap
      for (const {
        durationTicks,
        midi,
        ticks: startTicks,
        velocity,
        name,
      } of notes) {
        const midiVelocity = velocity * 127
        const template = noteItemStore.getNoteItemTemplate({
          x: startTicks,
          y: noteItemStore.noteHeight * (119 - midi),
          noteItemWidth: durationTicks,
          insertToSpecifiedPitchName: name,
          workspaceId: newWorkspaceId,
          audioTrackId,
          velocity: midiVelocity,
          isDirectPosition: true,
        })
        noteItemsMap.set(template.id, template)
      }
    }
  }
  return Promise.all(addSoundBufferWorkArr).then(() => {
    return parsedAudioTrackIdArr?.[0] ?? ""
  })
}
