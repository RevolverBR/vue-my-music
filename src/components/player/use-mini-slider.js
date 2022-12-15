import {
  ref,
  computed,
  watch,
  nextTick,
  onMounted,
  onUnmounted,
  onActivated,
  onDeactivated
} from 'vue'
import { useStore } from 'vuex'
import BScroll from '@better-scroll/core'
import Slide from '@better-scroll/slide'

BScroll.use(Slide)

export default function useMiniSlider() {
  const sliderWrapperRef = ref(null)
  const slider = ref(null)

  const store = useStore()
  const fullScreen = computed(() => store.state.fullScreen)
  const playlist = computed(() => store.state.playList)
  const currentIndex = computed(() => store.state.currentIndex)

  const sliderShow = computed(() => {
    return !fullScreen.value && !!playlist.value
  })

  onMounted(() => {
    let sliderVal
    watch(sliderShow, async newSliderShow => {
      if (newSliderShow) {
        await nextTick()
        if (!sliderVal) {
          sliderVal = slider.value = new BScroll(sliderWrapperRef.value, {
            click: true,
            scrollX: true,
            scrollY: false,
            momentum: false,
            bounce: false,
            probeType: 2,
            slide: {
              autoplay: false,
              loop: true
            }
          })
          // miniplayer轮播切画面换同时切换歌曲
          sliderVal.on('slidePageChanged', ({ pageX }) => {
            store.commit('setCurrentIndex', pageX)
            // 切miniplayer-slider自动播放歌曲，但是在miniplaylist里删除当前歌曲前面歌曲时会自动播放，效果不好
            // store.commit('setPlayingState', true)
          })
        } else {
          sliderVal.refresh()
        }
        sliderVal.goToPage(currentIndex.value, 0, 0)
      }
    })

    watch(currentIndex, newIndex => {
      if (sliderVal && sliderShow.value) {
        sliderVal.goToPage(newIndex, 0, 0)
      }
    })

    // PlayList发生变化的时候，refresh slider，不然playlist发生变化(removeSong)，dom结构没变化，切歌时会报错
    watch(playlist, async newList => {
      if (sliderVal && sliderShow.value && newList.length) {
        // 数据变化到dom变化要等一个tick
        await nextTick()
        sliderVal.refresh()
      }
    })
  })

  onUnmounted(() => {
    if (slider.value) {
      slider.value.destroy()
    }
  })

  onActivated(() => {
    slider.value.enable()
    slider.value.refresh()
  })

  onDeactivated(() => {
    slider.value.disable()
  })

  return { slider, sliderWrapperRef }
}
