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

  // 将颜色转换为RGB(A)对象，考虑透明度
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
      return { r, g, b, a: 1 }
    }

    // 处理十六进制颜色（可能包含透明度）
    if (lowerStr.startsWith("#")) {
      let hex = lowerStr.slice(1)
      // 如果是3位十六进制颜色，则重复每个字符
      if (hex.length === 3) hex = [...hex].map((c) => c + c).join("")
      // 如果有透明度（8位），则需要解析最后两位
      const hasAlpha = hex.length === 8
      const r = parseInt(hex.slice(0, 2), 16)
      const g = parseInt(hex.slice(2, 4), 16)
      const b = parseInt(hex.slice(4, 6), 16)
      const a = hasAlpha ? parseInt(hex.slice(6, 8), 16) / 255 : 1
      return { r, g, b, a }
    }

    // 处理RGB(A)颜色
    const rgbaMatch = lowerStr.match(
      /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d*\.?\d+))?\)$/i,
    )
    if (rgbaMatch) {
      return {
        r: +rgbaMatch[1],
        g: +rgbaMatch[2],
        b: +rgbaMatch[3],
        a: rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 1,
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

  // 执行颜色混合（RGB通道）
  const mixChannel = (c1, c2) => Math.round(c1 * ratio1 + c2 * ratio2)
  const mixed = {
    r: mixChannel(colors[0].rgb.r, colors[1].rgb.r),
    g: mixChannel(colors[0].rgb.g, colors[1].rgb.g),
    b: mixChannel(colors[0].rgb.b, colors[1].rgb.b),
  }

  // 混合透明度
  const mixAlpha = (a1, a2) => {
    if (a1 === 1 && a2 === 1) {
      return 1 // 如果两个颜色都是完全不透明，则最终结果也是完全不透明
    }
    if (a1 === 1) {
      return a2 // 如果第一个颜色完全不透明，则透明度为第二个颜色的透明度
    }
    if (a2 === 1) {
      return a1 // 如果第二个颜色完全不透明，则透明度为第一个颜色的透明度
    }
    return a1 + a2 * (1 - a1) // 叠加透明度
  }

  const mixedAlpha = mixAlpha(colors[0].rgb.a, colors[1].rgb.a)

  // 转换为十六进制格式（包括透明度）
  const toHex = (c) => c.toString(16).padStart(2, "0")
  const alphaHex = Math.round(mixedAlpha * 255)
    .toString(16)
    .padStart(2, "0") // 转换透明度为十六进制
  return `#${toHex(mixed.r)}${toHex(mixed.g)}${toHex(mixed.b)}${alphaHex}`
}
