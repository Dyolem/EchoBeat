import { AUDIO_TRACK_ENUM } from "@/constants/daw/index.js"
import { stringUtils } from "@/utils/stringUtils.js"
import {
  PROGRAM_CHANGE_TO_SOUNDBANK,
  SOUNDBANK_TO_PROGRAM_CHANGE,
} from "@/constants/daw/soundbank.js"

/**
 * 通用MIDI (GM)音色表
 * Program Number 范围: 0-127
 *
 * 字段说明:
 * - name: 乐器的标准名称
 * - family: 乐器所属的音色家族
 * - percussion: 是否为打击乐器
 */

export const gmProgramMap = {
  // Drum (custom -1 channel index 9)
  "-1": { name: "Standard Kit", family: "drum", percussion: true },
  // Piano (0-7)
  0: { name: "Acoustic Grand Piano", family: "piano", percussion: false },
  1: { name: "Bright Acoustic Piano", family: "piano", percussion: false },
  2: { name: "Electric Grand Piano", family: "piano", percussion: false },
  3: { name: "Honky-tonk Piano", family: "piano", percussion: false },
  4: { name: "Electric Piano 1", family: "piano", percussion: false },
  5: { name: "Electric Piano 2", family: "piano", percussion: false },
  6: { name: "Harpsichord", family: "piano", percussion: false },
  7: { name: "Clavinet", family: "piano", percussion: false },

  // Chromatic Percussion (8-15)
  8: { name: "Celesta", family: "chromatic_percussion", percussion: true },
  9: { name: "Glockenspiel", family: "chromatic_percussion", percussion: true },
  10: { name: "Music Box", family: "chromatic_percussion", percussion: true },
  11: { name: "Vibraphone", family: "chromatic_percussion", percussion: true },
  12: { name: "Marimba", family: "chromatic_percussion", percussion: true },
  13: { name: "Xylophone", family: "chromatic_percussion", percussion: true },
  14: {
    name: "Tubular Bells",
    family: "chromatic_percussion",
    percussion: true,
  },
  15: { name: "Dulcimer", family: "chromatic_percussion", percussion: true },

  // Organ (16-23)
  16: { name: "Drawbar Organ", family: "organ", percussion: false },
  17: { name: "Percussive Organ", family: "organ", percussion: false },
  18: { name: "Rock Organ", family: "organ", percussion: false },
  19: { name: "Church Organ", family: "organ", percussion: false },
  20: { name: "Reed Organ", family: "organ", percussion: false },
  21: { name: "Accordion", family: "organ", percussion: false },
  22: { name: "Harmonica", family: "organ", percussion: false },
  23: { name: "Tango Accordion", family: "organ", percussion: false },

  // Guitar (24-31)
  24: { name: "Acoustic Guitar (nylon)", family: "guitar", percussion: false },
  25: { name: "Acoustic Guitar (steel)", family: "guitar", percussion: false },
  26: { name: "Electric Guitar (jazz)", family: "guitar", percussion: false },
  27: { name: "Electric Guitar (clean)", family: "guitar", percussion: false },
  28: { name: "Electric Guitar (muted)", family: "guitar", percussion: false },
  29: { name: "Overdriven Guitar", family: "guitar", percussion: false },
  30: { name: "Distortion Guitar", family: "guitar", percussion: false },
  31: { name: "Guitar Harmonics", family: "guitar", percussion: false },

  // Bass (32-39)
  32: { name: "Acoustic Bass", family: "bass", percussion: false },
  33: { name: "Electric Bass (finger)", family: "bass", percussion: false },
  34: { name: "Electric Bass (pick)", family: "bass", percussion: false },
  35: { name: "Fretless Bass", family: "bass", percussion: false },
  36: { name: "Slap Bass 1", family: "bass", percussion: false },
  37: { name: "Slap Bass 2", family: "bass", percussion: false },
  38: { name: "Synth Bass 1", family: "bass", percussion: false },
  39: { name: "Synth Bass 2", family: "bass", percussion: false },

  // Strings (40-47)
  40: { name: "Violin", family: "strings", percussion: false },
  41: { name: "Viola", family: "strings", percussion: false },
  42: { name: "Cello", family: "strings", percussion: false },
  43: { name: "Contrabass", family: "strings", percussion: false },
  44: { name: "Tremolo Strings", family: "strings", percussion: false },
  45: { name: "Pizzicato Strings", family: "strings", percussion: false },
  46: { name: "Orchestral Harp", family: "strings", percussion: false },
  47: { name: "Timpani", family: "strings", percussion: true },

  // Ensemble (48-55)
  48: { name: "String Ensemble 1", family: "ensemble", percussion: false },
  49: { name: "String Ensemble 2", family: "ensemble", percussion: false },
  50: { name: "Synth Strings 1", family: "ensemble", percussion: false },
  51: { name: "Synth Strings 2", family: "ensemble", percussion: false },
  52: { name: "Choir Aahs", family: "ensemble", percussion: false },
  53: { name: "Voice Oohs", family: "ensemble", percussion: false },
  54: { name: "Synth Voice", family: "ensemble", percussion: false },
  55: { name: "Orchestra Hit", family: "ensemble", percussion: false },

  // Brass (56-63)
  56: { name: "Trumpet", family: "brass", percussion: false },
  57: { name: "Trombone", family: "brass", percussion: false },
  58: { name: "Tuba", family: "brass", percussion: false },
  59: { name: "Muted Trumpet", family: "brass", percussion: false },
  60: { name: "French Horn", family: "brass", percussion: false },
  61: { name: "Brass Section", family: "brass", percussion: false },
  62: { name: "Synth Brass 1", family: "brass", percussion: false },
  63: { name: "Synth Brass 2", family: "brass", percussion: false },

  // Reed (64-71)
  64: { name: "Soprano Sax", family: "reed", percussion: false },
  65: { name: "Alto Sax", family: "reed", percussion: false },
  66: { name: "Tenor Sax", family: "reed", percussion: false },
  67: { name: "Baritone Sax", family: "reed", percussion: false },
  68: { name: "Oboe", family: "reed", percussion: false },
  69: { name: "English Horn", family: "reed", percussion: false },
  70: { name: "Bassoon", family: "reed", percussion: false },
  71: { name: "Clarinet", family: "reed", percussion: false },

  // Pipe (72-79)
  72: { name: "Piccolo", family: "pipe", percussion: false },
  73: { name: "Flute", family: "pipe", percussion: false },
  74: { name: "Recorder", family: "pipe", percussion: false },
  75: { name: "Pan Flute", family: "pipe", percussion: false },
  76: { name: "Blown Bottle", family: "pipe", percussion: false },
  77: { name: "Shakuhachi", family: "pipe", percussion: false },
  78: { name: "Whistle", family: "pipe", percussion: false },
  79: { name: "Ocarina", family: "pipe", percussion: false },

  // Synth Lead (80-87)
  80: { name: "Lead 1 (square)", family: "synth_lead", percussion: false },
  81: { name: "Lead 2 (sawtooth)", family: "synth_lead", percussion: false },
  82: { name: "Lead 3 (calliope)", family: "synth_lead", percussion: false },
  83: { name: "Lead 4 (chiff)", family: "synth_lead", percussion: false },
  84: { name: "Lead 5 (charang)", family: "synth_lead", percussion: false },
  85: { name: "Lead 6 (voice)", family: "synth_lead", percussion: false },
  86: { name: "Lead 7 (fifths)", family: "synth_lead", percussion: false },
  87: { name: "Lead 8 (bass + lead)", family: "synth_lead", percussion: false },

  // Synth Pad (88-95)
  88: { name: "Pad 1 (new age)", family: "synth_pad", percussion: false },
  89: { name: "Pad 2 (warm)", family: "synth_pad", percussion: false },
  90: { name: "Pad 3 (polysynth)", family: "synth_pad", percussion: false },
  91: { name: "Pad 4 (choir)", family: "synth_pad", percussion: false },
  92: { name: "Pad 5 (bowed)", family: "synth_pad", percussion: false },
  93: { name: "Pad 6 (metallic)", family: "synth_pad", percussion: false },
  94: { name: "Pad 7 (halo)", family: "synth_pad", percussion: false },
  95: { name: "Pad 8 (sweep)", family: "synth_pad", percussion: false },

  // Synth Effects (96-103)
  96: { name: "FX 1 (rain)", family: "synth_effects", percussion: false },
  97: { name: "FX 2 (soundtrack)", family: "synth_effects", percussion: false },
  98: { name: "FX 3 (crystal)", family: "synth_effects", percussion: false },
  99: { name: "FX 4 (atmosphere)", family: "synth_effects", percussion: false },
  100: {
    name: "FX 5 (brightness)",
    family: "synth_effects",
    percussion: false,
  },
  101: { name: "FX 6 (goblins)", family: "synth_effects", percussion: false },
  102: { name: "FX 7 (echoes)", family: "synth_effects", percussion: false },
  103: { name: "FX 8 (sci-fi)", family: "synth_effects", percussion: false },

  // Ethnic (104-111)
  104: { name: "Sitar", family: "ethnic", percussion: false },
  105: { name: "Banjo", family: "ethnic", percussion: false },
  106: { name: "Shamisen", family: "ethnic", percussion: false },
  107: { name: "Koto", family: "ethnic", percussion: false },
  108: { name: "Kalimba", family: "ethnic", percussion: false },
  109: { name: "Bagpipe", family: "ethnic", percussion: false },
  110: { name: "Fiddle", family: "ethnic", percussion: false },
  111: { name: "Shanai", family: "ethnic", percussion: false },

  // Percussive (112-119)
  112: { name: "Tinkle Bell", family: "percussive", percussion: true },
  113: { name: "Agogo", family: "percussive", percussion: true },
  114: { name: "Steel Drums", family: "percussive", percussion: true },
  115: { name: "Woodblock", family: "percussive", percussion: true },
  116: { name: "Taiko Drum", family: "percussive", percussion: true },
  117: { name: "Melodic Tom", family: "percussive", percussion: true },
  118: { name: "Synth Drum", family: "percussive", percussion: true },
  119: { name: "Reverse Cymbal", family: "percussive", percussion: true },

  // Sound Effects (120-127)
  120: {
    name: "Guitar Fret Noise",
    family: "sound_effects",
    percussion: false,
  },
  121: { name: "Breath Noise", family: "sound_effects", percussion: false },
  122: { name: "Seashore", family: "sound_effects", percussion: false },
  123: { name: "Bird Tweet", family: "sound_effects", percussion: false },
  124: { name: "Telephone Ring", family: "sound_effects", percussion: false },
  125: { name: "Helicopter", family: "sound_effects", percussion: false },
  126: { name: "Applause", family: "sound_effects", percussion: false },
  127: { name: "Gunshot", family: "sound_effects", percussion: false },
}

export const INSTRUMENT_SET = {
  "808S": "808s",
  BRASS: "Brass",
  DRUM_KITS: "Drum Kits",
  DRUM_PADS: "Drum Pads",
  ELECTRIC_BASSES: "Electric Basses",
  GUITARS: "Guitars",
  KEYBOARDS: "Keyboards",
  LEADS: "Leads",
  ORGANS: "Organs",
  PADS: "Pads",
  PERCUSSION: "Percussion",
  STRINGS: "Strings",
  SYNTH_BASSES: "Synth Basses",
  SYNTHS: "Synths",
  VOICES: "Voices",
  WINDS: "Winds",
}

/**
 * 自定义乐器分类到具体MIDI程序号的映射
 * 每个分类对应一个数组，包含所有符合该分类的MIDI程序号
 */
export const INSTRUMENT_TO_PROGRAM_NUMBERS = {
  // 打击乐器类 (通常使用MIDI通道10)
  [INSTRUMENT_SET["808S"]]: [-1], // 特殊值-1表示使用MIDI通道10
  [INSTRUMENT_SET.DRUM_KITS]: [-1], // 特殊值-1表示使用MIDI通道10
  [INSTRUMENT_SET.DRUM_PADS]: [-1], // 特殊值-1表示使用MIDI通道10
  [INSTRUMENT_SET.PERCUSSION]: [
    8, 9, 10, 11, 12, 13, 14, 15, 112, 113, 114, 115, 116, 117, 118, 119,
  ],

  // 键盘类
  [INSTRUMENT_SET.KEYBOARDS]: [0, 1, 2, 3, 4, 5, 6, 7], // 钢琴家族
  [INSTRUMENT_SET.ORGANS]: [16, 17, 18, 19, 20, 21, 22, 23], // 风琴家族

  // 弦乐器类
  [INSTRUMENT_SET.GUITARS]: [24, 25, 26, 27, 28, 29, 30, 31], // 吉他家族
  [INSTRUMENT_SET.STRINGS]: [40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51], // 弦乐器和弦乐合奏

  // 贝司类
  [INSTRUMENT_SET.ELECTRIC_BASSES]: [32, 33, 34, 35, 36, 37], // 原声和电贝司
  [INSTRUMENT_SET.SYNTH_BASSES]: [38, 39], // 合成贝司

  // 管乐类
  [INSTRUMENT_SET.BRASS]: [56, 57, 58, 59, 60, 61, 62, 63], // 铜管乐器
  [INSTRUMENT_SET.WINDS]: [
    64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79,
  ], // 包括簧管和笛管两个家族

  // 合成器类
  [INSTRUMENT_SET.LEADS]: [80, 81, 82, 83, 84, 85, 86, 87], // 合成主音
  [INSTRUMENT_SET.PADS]: [88, 89, 90, 91, 92, 93, 94, 95], // 合成垫音
  [INSTRUMENT_SET.SYNTHS]: [
    80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98,
    99, 100, 101, 102, 103,
  ], // 包括所有合成器类型

  // 人声类
  [INSTRUMENT_SET.VOICES]: [52, 53, 54, 55], // 人声合唱
}

function getCustomizedInstrumentTypeWithProgramNumber(programNumber) {
  const instrumentTargetArr = []
  for (const instrumentSetKey in INSTRUMENT_TO_PROGRAM_NUMBERS) {
    const index = INSTRUMENT_TO_PROGRAM_NUMBERS[instrumentSetKey].findIndex(
      (number) => number === programNumber,
    )
    if (index !== -1) {
      instrumentTargetArr.push(instrumentSetKey)
    }
  }
  return instrumentTargetArr
}
export const generateSoundOptions = () => {
  const _INSTRUMENT_SET = { ...INSTRUMENT_SET }
  const optionObj = {}
  for (const instrument in _INSTRUMENT_SET) {
    optionObj[_INSTRUMENT_SET[instrument]] = {
      value: _INSTRUMENT_SET[instrument],
      label: instrument,
      children: [],
    }
  }
  Object.entries(SOUNDBANK_TO_PROGRAM_CHANGE).forEach(
    ([soundbank, programNumber]) => {
      const customizedInstrumentTypeArr =
        getCustomizedInstrumentTypeWithProgramNumber(programNumber)
      if (customizedInstrumentTypeArr.length > 0) {
        customizedInstrumentTypeArr.forEach((customizedInstrumentType) => {
          optionObj[customizedInstrumentType].children.push({
            value: soundbank,
            label: stringUtils.upperFirstLetter(soundbank),
          })
        })
      }
    },
  )
  return Object.values(optionObj)
}
export const DEFAULT_PROGRAM_NUMBERS = {
  // 打击乐器类，设为-1表示使用MIDI通道10的打击乐器模式
  [INSTRUMENT_SET["808S"]]: -1, // 808电子鼓使用MIDI通道10
  [INSTRUMENT_SET.DRUM_KITS]: -1, // 完整鼓组使用MIDI通道10
  [INSTRUMENT_SET.DRUM_PADS]: -1, // 打击垫使用MIDI通道10
  [INSTRUMENT_SET.PERCUSSION]: 12, // 选择马林巴琴(Marimba)作为代表性打击乐器(程序号12)

  // 弦乐器类
  [INSTRUMENT_SET.GUITARS]: 24, // 尼龙弦吉他(Nylon Guitar)作为代表(程序号24)
  [INSTRUMENT_SET.STRINGS]: 48, // 弦乐合奏(String Ensemble)作为代表(程序号48)

  // 贝司类
  [INSTRUMENT_SET.ELECTRIC_BASSES]: 33, // 电贝司指弹(Electric Bass Finger)作为代表(程序号33)
  [INSTRUMENT_SET.SYNTH_BASSES]: 38, // 合成贝司1(Synth Bass 1)作为代表(程序号38)

  // 键盘类
  [INSTRUMENT_SET.KEYBOARDS]: 0, // 大钢琴(Acoustic Grand Piano)作为代表(程序号0)
  [INSTRUMENT_SET.ORGANS]: 16, // 抽音风琴(Drawbar Organ)作为代表(程序号16)

  // 管乐类
  [INSTRUMENT_SET.BRASS]: 56, // 小号(Trumpet)作为代表(程序号56)
  [INSTRUMENT_SET.WINDS]: 73, // 长笛(Flute)作为代表(程序号73)

  // 合成器类
  [INSTRUMENT_SET.LEADS]: 80, // 方波合成器(Square Lead)作为代表(程序号80)
  [INSTRUMENT_SET.PADS]: 88, // 幻想合成器(New Age Pad)作为代表(程序号88)
  [INSTRUMENT_SET.SYNTHS]: 81, // 锯齿波合成器(Sawtooth Lead)作为代表(程序号81)

  // 人声类
  [INSTRUMENT_SET.VOICES]: 52, // 合唱"啊"音(Choir Aahs)作为代表(程序号52)
}

export function getInitInstrumentInfo({ programNumber: number, channel }) {
  if (channel === 9) {
    number = -1
  }
  const sound = PROGRAM_CHANGE_TO_SOUNDBANK[number].soundbank

  const customInstrumentType =
    getCustomizedInstrumentTypeWithProgramNumber(number)
  const { family, name: instrumentName } =
    getFamilyInfoByMidiProgramNumber(number)
  return {
    customInstrumentType,
    instrumentName,
    family,
    sound,
  }
}

export function getInstrumentInfoBySoundName({ soundName }) {
  const programNumber = SOUNDBANK_TO_PROGRAM_CHANGE[soundName]
  const { name, family } = getFamilyInfoByMidiProgramNumber(programNumber)
  return {
    name,
    family,
    number: programNumber,
  }
}
export function getFamilyInfoByMidiProgramNumber(programNumber) {
  return gmProgramMap[programNumber]
}
export function getDefaultInstrumentByInstrumentType({ instrumentType }) {
  const defaultProgramNumber = DEFAULT_PROGRAM_NUMBERS[instrumentType]
  const soundName = PROGRAM_CHANGE_TO_SOUNDBANK[defaultProgramNumber].soundbank
  const programNumber = defaultProgramNumber
  return { soundName, programNumber }
}

// 音轨类型与乐器家族映射关系
export const AUDIO_TRACK_TYPE_INSTRUMENT_MAP = new Map([
  // 人声/音频轨道 - 主要用于录音，但也可以使用某些合成声音
  [
    AUDIO_TRACK_ENUM.VOICE,
    {
      default: INSTRUMENT_SET.VOICES,
      instruments: [
        INSTRUMENT_SET.VOICES, // 人声合成器和人声音色
        // 通常音频轨道不会有太多预设乐器选择，因为它主要用于录制外部音频
      ],
    },
  ],

  // 虚拟乐器轨道 - 几乎可以使用所有种类的乐器
  [
    AUDIO_TRACK_ENUM.VIRTUAL_INSTRUMENTS,
    {
      default: INSTRUMENT_SET.KEYBOARDS, // 键盘乐器,
      instruments: [
        INSTRUMENT_SET.KEYBOARDS, // 键盘乐器
        INSTRUMENT_SET.STRINGS, // 弦乐器
        INSTRUMENT_SET.BRASS, // 铜管乐器
        INSTRUMENT_SET.WINDS, // 木管乐器
        INSTRUMENT_SET.ORGANS, // 风琴
        INSTRUMENT_SET.LEADS, // 主音合成器
        INSTRUMENT_SET.PADS, // 合成器垫音
        INSTRUMENT_SET.SYNTHS, // 合成器
        INSTRUMENT_SET.VOICES, // 人声合成器
        INSTRUMENT_SET.PERCUSSION, // 打击乐器
        INSTRUMENT_SET.GUITARS, // 吉他
        INSTRUMENT_SET.ELECTRIC_BASSES, // 电贝司
        INSTRUMENT_SET.SYNTH_BASSES, // 合成贝司
      ],
    },
  ],

  // 鼓机轨道 - 专注于鼓类和打击乐器
  [
    AUDIO_TRACK_ENUM.DRUM_MACHINE,
    {
      default: INSTRUMENT_SET.DRUM_KITS,
      instruments: [
        INSTRUMENT_SET.DRUM_KITS, // 鼓组
        INSTRUMENT_SET.DRUM_PADS, // 鼓垫
        INSTRUMENT_SET["808S"], // 808音色
        INSTRUMENT_SET.PERCUSSION, // 打击乐器
      ],
    },
  ],

  // 采样轨道 - 可以加载各种采样
  [
    AUDIO_TRACK_ENUM.SAMPLE,
    {
      default: INSTRUMENT_SET.DRUM_KITS, // 鼓组采样
      instruments: [
        INSTRUMENT_SET.DRUM_KITS, // 鼓组采样
        INSTRUMENT_SET.DRUM_PADS, // 鼓垫采样
        INSTRUMENT_SET["808S"], // 808音色采样
        INSTRUMENT_SET.PERCUSSION, // 打击乐采样
        INSTRUMENT_SET.VOICES, // 人声采样
        // 采样轨道通常可以加载任何类型的音频样本，因此这里可以根据实际情况扩展
      ],
    },
  ],

  // 吉他轨道 - 专注于吉他类乐器
  [
    AUDIO_TRACK_ENUM.GUITAR,
    {
      default: INSTRUMENT_SET.GUITARS,
      instruments: [
        INSTRUMENT_SET.GUITARS, // 吉他
        // 有些DAW会将合成吉他声音也包含在这里
        INSTRUMENT_SET.LEADS, // 吉他风格的主音合成器
      ],
    },
  ],

  // 贝司轨道 - 专注于贝司类乐器
  [
    AUDIO_TRACK_ENUM.BASS,
    {
      default: INSTRUMENT_SET.ELECTRIC_BASSES, // 电贝司
      instruments: [
        INSTRUMENT_SET.ELECTRIC_BASSES, // 电贝司
        INSTRUMENT_SET.SYNTH_BASSES, // 合成贝司
        // 一些DAW也会允许其他低音乐器出现在这里
        INSTRUMENT_SET.STRINGS, // 包含低音提琴等弦乐器低音
      ],
    },
  ],
])

export function getDefaultProgramNumberByAudioTrackType(audioTrackType) {
  const defaultInstrumentType =
    AUDIO_TRACK_TYPE_INSTRUMENT_MAP.get(audioTrackType).default
  return getDefaultInstrumentByInstrumentType({
    instrumentType: defaultInstrumentType,
  }).programNumber
}
