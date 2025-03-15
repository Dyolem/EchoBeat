export function velocityToAlphaHex(velocity) {
  velocity = Math.max(0, Math.min(127, velocity))
  const alpha = Math.pow(velocity / 127, 2) // 非线性映射
  const alpha8Bit = Math.round(alpha * 255)
  return alpha8Bit.toString(16).padStart(2, "0").toUpperCase()
}
