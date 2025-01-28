export function generateUniqueId(prefix = "") {
  const timestamp = Date.now().toString(36) // 使用时间戳转换为36进制
  const randomString = Math.random().toString(36).substring(2, 10) // 生成一个8位的随机字符串
  return `${prefix}${timestamp}-${randomString}`
}
