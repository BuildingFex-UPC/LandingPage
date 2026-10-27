import { ref, onMounted, onUnmounted } from 'vue'

export function useScrollReveal(options = {}) {
  const { rootMargin = '50px 0px -20px 0px', threshold = 0, once = true } = options

  const targetRef = ref(null)
  const isVisible = ref(false)

  let observer

  onMounted(() => {
    const el = targetRef.value
    if (!el) return

    // If already in or above viewport on mount (e.g. hash link or short page), reveal immediately
    const rect = el.getBoundingClientRect()
    if (rect.top <= window.innerHeight * 1.1) {
      isVisible.value = true
      return
    }

    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            isVisible.value = true
            if (once) observer?.disconnect()
          }
        },
        { root: null, rootMargin, threshold },
      )
      observer.observe(el)
    } else {
      isVisible.value = true
    }
  })

  onUnmounted(() => observer?.disconnect())

  return { targetRef, isVisible }
}
