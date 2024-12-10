export default function clearSelection() {
  const selectionController = new AbortController()
  document.addEventListener(
    "selectionchange",
    () => {
      const selection = window.getSelection()
      if (selection && selection.toString()) {
        // 清空选区，禁用弹出选项
        selection.removeAllRanges()
      }
    },
    {
      signal: selectionController.signal,
    },
  )
  return selectionController
}
