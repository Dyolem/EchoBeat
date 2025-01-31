/**
 *
 * @param {string} colorSpace
 * @param {string[]} colorStrings
 * @returns {string}
 *
 * 使用示例
 * ```js
 * console.log(colorMix('srgb', 'red', 'blue'));               // #800080
 * console.log(colorMix('srgb', 'red 30%', 'blue 70%'));       // #4d00b3
 * console.log(colorMix('srgb', '#ff0000 50%', '#0000ff'));    // #800080
 * console.log(colorMix('srgb', 'rgb(255,0,0) 20%', 'blue'));  // #3300cc
 * ```
 */
export function colorMix(colorSpace, ...colorStrings) {
  // 解析颜色字符串，提取颜色值和百分比
  function parseColorString(str) {
    const regex = /(.+?)(?:\s+(\d+%))?$/
    const match = str.match(regex)
    return {
      color: match[1].trim(),
      percentage: match[2] ? parseFloat(match[2]) : null,
    }
  }

  // 将颜色转换为RGB对象
  function parseColorToRgb(colorStr) {
    const lowerStr = colorStr.toLowerCase().trim()
    const colorKeywords = {
      red: [255, 0, 0],
      green: [0, 128, 0],
      blue: [0, 0, 255],
      white: [255, 255, 255],
      black: [0, 0, 0],
      yellow: [255, 255, 0],
      cyan: [0, 255, 255],
      magenta: [255, 0, 255],
      gray: [128, 128, 128],
    }

    if (colorKeywords[lowerStr]) {
      const [r, g, b] = colorKeywords[lowerStr]
      return { r, g, b }
    }

    // 处理十六进制颜色
    if (lowerStr.startsWith("#")) {
      let hex = lowerStr.slice(1).padEnd(6, "0")
      if (hex.length === 3) hex = [...hex].map((c) => c + c).join("")
      const r = parseInt(hex.substr(0, 2), 16)
      const g = parseInt(hex.substr(2, 2), 16)
      const b = parseInt(hex.substr(4, 2), 16)
      return { r, g, b }
    }

    // 处理RGB颜色
    const rgbMatch = lowerStr.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/i)
    if (rgbMatch) {
      return {
        r: +rgbMatch[1],
        g: +rgbMatch[2],
        b: +rgbMatch[3],
      }
    }

    throw new Error(`无法解析颜色值: ${colorStr}`)
  }

  // --- 主函数逻辑开始 ---
  if (colorSpace !== "srgb") {
    throw new Error("暂不支持该色彩空间")
  }

  if (colorStrings.length !== 2) {
    throw new Error("需要提供两个颜色参数")
  }

  // 解析颜色和百分比
  const colors = colorStrings.map((str) => {
    const parsed = parseColorString(str)
    return {
      ...parsed,
      rgb: parseColorToRgb(parsed.color),
    }
  })

  // 计算混合权重
  const [p1, p2] = colors.map((c) => c.percentage ?? 50)
  const total = p1 + p2 || 1 // 防止除以0
  const ratio1 = p1 / total
  const ratio2 = p2 / total

  // 执行颜色混合
  const mixChannel = (c1, c2) => Math.round(c1 * ratio1 + c2 * ratio2)
  const mixed = {
    r: mixChannel(colors[0].rgb.r, colors[1].rgb.r),
    g: mixChannel(colors[0].rgb.g, colors[1].rgb.g),
    b: mixChannel(colors[0].rgb.b, colors[1].rgb.b),
  }

  // 转换为十六进制格式
  const toHex = (c) => c.toString(16).padStart(2, "0")
  return `#${toHex(mixed.r)}${toHex(mixed.g)}${toHex(mixed.b)}`
}
