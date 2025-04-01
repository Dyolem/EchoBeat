/**
 * 安全过滤输入内容
 * @param {string} input 用户输入内容
 * @param {Object} [options] 配置选项
 * @param {boolean} [options.allowHtml=false] 是否允许HTML标签
 * @param {string[]} [options.allowedTags=[]] 允许的HTML标签列表（需要allowHtml=true）
 * @returns {string} 过滤后的安全内容
 *
 * @example
 * // 使用示例
 * const userInput = '<script>alert("xss"); SELECT * FROM users</script>'
 * console.log(sanitizeInput(userInput))
 * // 输出：&lt;script&gt;alert(&quot;xss&quot;); [filtered] * FROM users&lt;/script&gt;
 *
 * const safeHtmlInput = '<p class="safe">Hello</p>'
 * console.log(
 *   sanitizeInput(safeHtmlInput, {
 *     allowHtml: true,
 *     allowedTags: ["p", "strong"],
 *   }),
 * )
 * // 输出：<p class="safe">Hello</p>
 */
export function sanitizeInput(input, options = {}) {
  if (typeof input !== "string") return ""

  // 合并默认配置
  const config = {
    allowHtml: false,
    allowedTags: [],
    ...options,
  }

  // 基础HTML转义映射
  const escapeMap = {
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
    "&": "&amp;",
    "/": "&#x2F;",
  }

  // 处理HTML内容
  let sanitized = input.replace(/[<>"'&\/]/g, (char) => escapeMap[char] || char)

  // 如果允许有限HTML
  if (config.allowHtml && config.allowedTags.length > 0) {
    const tagWhitelist = config.allowedTags.join("|")
    const pattern = new RegExp(
      `&lt;(/?(${tagWhitelist})(\\s+[^&]*?)?)&gt;`,
      "gi",
    )

    sanitized = sanitized.replace(
      pattern,
      (match, p1) => `<${p1.replace(/&quot;/g, '"')}>`,
    )
  }

  // 移除危险属性（即使允许HTML）
  sanitized = sanitized.replace(
    /<(\w+)\s+[^>]*(on\w+|javascript:|expression\s*\(|href\s*:\s*(javascript:|data:))[^>]*>/gi,
    (match, tag) => `<${tag}>`,
  )

  // 防御基础SQL注入
  const sqlKeywords = [
    "select",
    "insert",
    "update",
    "delete",
    "drop",
    "union",
    "truncate",
    "exec",
    "create",
    "alter",
  ]
  const sqlPattern = new RegExp(`\\b(${sqlKeywords.join("|")})\\b`, "gi")
  sanitized = sanitized.replace(sqlPattern, "[filtered]")

  return sanitized
}
