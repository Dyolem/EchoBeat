import { defineStore } from "pinia"
import { randomUtils } from "@/utils/randomUtils.js"

export const useAudioTrackMainColorStore = defineStore(
  "audioTrackMainColor",
  () => {
    /**
     *
     * @type {Set<string>}
     * 红色 (Red) → 胭脂红 #E63946
     *
     * 说明：略带粉色调的红色，视觉上更加柔和而有质感。
     * 橙色 (Orange) → 琥珀橙 #FF8C42
     *
     * 说明：带有一点暖色调，既保留了橙色的活力，又避免过于刺眼。
     * 黄色 (Yellow) → 蜂蜜黄 #FFD700
     *
     * 说明：温暖且富有光泽的黄色，比纯正黄色更加柔和且富有层次感。
     * 绿色 (Green) → 薄荷绿 #4CAF50
     *
     * 说明：充满生机的绿色，既不会过于鲜艳，也不会显得沉闷。
     * 青色 (Cyan) → 湖水蓝 #00A8CC
     *
     * 说明：清爽的青色，兼具蓝色的沉稳与绿色的活力，适合现代设计。
     * 蓝色 (Blue) → 蔚蓝色 #1E90FF
     *
     * 说明：较亮的蓝色，接近天空的颜色，视觉清新且令人愉悦。
     * 紫色 (Purple) → 丁香紫 #9370DB
     *
     * 说明：柔和而富有层次的紫色，优雅且不会过于浓烈。
     */
    const colorPreset = new Set([
      "#E63946",
      "#FF8C42",
      "#FFD700",
      "#4CAF50",
      "#00A8CC",
      "#1E90FF",
      "#9370DB",
    ])
    let usedColor = new Set()
    let unUsedColor = new Set(colorPreset)
    function getRandomColor() {
      const unUsedColorSize = unUsedColor.size
      if (unUsedColorSize === 0) {
        unUsedColor = new Set(colorPreset)
        usedColor.clear()
      }
      const randomColorIndex = randomUtils.getRandomInt(0, unUsedColorSize - 1)
      const newColor = Array.from(unUsedColor)[randomColorIndex]
      usedColor.add(newColor)
      unUsedColor.delete(newColor)
      return newColor
    }
    return { getRandomColor }
  },
)
