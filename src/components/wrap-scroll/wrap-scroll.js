import {
  h,
  mergeProps,
  withCtx,
  renderSlot,
  ref,
  computed,
  watch,
  nextTick
} from 'vue'
import { useStore } from 'vuex'
import myScroll from '@/components/base/scroll/scroll'

export default {
  name: 'wrap-scroll',
  props: myScroll.props,
  emits: myScroll.emits,
  render(ctx) {
    return h(
      myScroll,
      mergeProps(
        {
          ref: 'scrollRef'
        },
        ctx.$props,
        {
          onScroll: e => {
            ctx.$emit('scroll', e)
          }
        }
      ),
      {
        default: withCtx(() => {
          return [renderSlot(ctx.$slots, 'default')]
        })
      }
    )
  },
  setup() {
    const scrollRef = ref(null)
    const scroll = computed(() => {
      return scrollRef.value.scroll
    })
    const store = useStore()
    const playList = computed(() => store.state.playList)

    watch(playList, async () => {
      await nextTick()
      scrollRef.value.scroll.refresh()
    })

    return { scrollRef, scroll }
  }
}
