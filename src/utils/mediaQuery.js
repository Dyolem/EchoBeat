import { ref, onUnmounted } from "vue"

export function useMediaQuery(query, onMatch, onUnmatch) {
  // 创建媒体查询
  const expectResult = ref(false)
  const mediaQuery = window.matchMedia(query)
  let matchedCallbackResult = null
  let onUnmatchedCallbackResult = null
  // 定义处理媒体查询匹配变化的函数
  function handleMediaChange(e) {
    expectResult.value = e.matches
    if (e.matches) {
      // 如果匹配成功，执行 onMatch 回调
      if (typeof onMatch === "function") {
        matchedCallbackResult = onMatch(e.matches)
      }
    } else {
      // 如果不匹配，执行 onUnmatch 回调
      if (typeof onUnmatch === "function") {
        onUnmatchedCallbackResult = onUnmatch(e.matches)
      }
    }
  }

  // 初始检查媒体查询条件
  handleMediaChange(mediaQuery)

  // 监听媒体查询的变化
  mediaQuery.addEventListener("change", handleMediaChange)
  onUnmounted(() => {
    mediaQuery.removeEventListener("change", handleMediaChange)
  })
  // 返回一个移除监听器的函数，方便在不需要时清除
  return [expectResult, [matchedCallbackResult, onUnmatchedCallbackResult]]
}
