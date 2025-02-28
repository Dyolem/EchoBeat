const map = new WeakMap()
const ob = new ResizeObserver((entries) => {
  for (const entry of entries) {
    const handler = map.get(entry.target)
    if (handler) {
      const borderBox = entry.borderBoxSize[0]
      const height = borderBox.blockSize
      const width = borderBox.inlineSize
      handler({ width, height })
    }
  }
})
export default {
  mounted(el, binding) {
    ob.observe(el)
    map.set(el, binding.value)
  },
  unmounted(el) {
    ob.unobserve(el)
    map.delete(el)
  },
}
