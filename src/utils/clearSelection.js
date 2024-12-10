export default function clearSelection() {
  const selectionController = new AbortController()
  document.addEventListener(
    "selectionchange",
    () => {
      const selection = window.getSelection()
      if (selection && selection.toString()) {
        // Clear selection and disable pop-up options
        selection.removeAllRanges()
      }
    },
    {
      signal: selectionController.signal,
    },
  )
  return selectionController
}
