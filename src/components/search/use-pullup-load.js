import BScroll from '@better-scroll/core'
import PullUp from '@better-scroll/pull-up'
import ObserveDOM from '@better-scroll/observe-dom'
import { ref, onMounted, onUnmounted, onActivated, onDeactivated } from 'vue'

BScroll.use(PullUp)
BScroll.use(ObserveDOM)

export default function usePullUpLoad(requestData, preventPullUpLoading) {
  const scroll = ref(null)
  const suggetsRootRef = ref(null)
  // 标志位
  const isPullUpLoad = ref(false)

  onMounted(() => {
    const scrollVal = (scroll.value = new BScroll(suggetsRootRef.value, {
      pullUpLoad: true,
      observeDOM: true,
      click: true
    }))

    scrollVal.on('pullingUp', pullingUphandle)

    async function pullingUphandle() {
      if (preventPullUpLoading.value) {
        scrollVal.finishPullUp()
        return
      }
      isPullUpLoad.value = true
      await requestData()
      scrollVal.finishPullUp()
      scrollVal.refresh()
      isPullUpLoad.value = false
    }
  })

  onUnmounted(() => {
    scroll.value.destroy()
  })
  onActivated(() => {
    scroll.value.enable()
    scroll.value.refresh()
  })

  onDeactivated(() => {
    scroll.value.disable()
  })

  return {
    scroll,
    suggetsRootRef,
    isPullUpLoad
  }
}
