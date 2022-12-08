import { useStore } from 'vuex'
import { computed } from 'vue'
import { PLAY_MODE } from '@/assets/js/constant'

export default function useMode() {
  const store = useStore()
  const playMode = computed(() => store.state.playMode)

  const modeIcon = computed(() => {
    const playModeVal = playMode.value
    return playModeVal === PLAY_MODE.sequence
      ? 'icon-sequence'
      : playModeVal === PLAY_MODE.random
      ? 'icon-random'
      : 'icon-loop'
  })

  // 播放模式文字描述
  const modeText = computed(() => {
    const playModeVal = playMode.value
    return playModeVal === PLAY_MODE.sequence
      ? '顺序播放'
      : playModeVal === PLAY_MODE.random
      ? '随机播放'
      : '单曲循环'
  })

  function changeMode() {
    // mode = 0,1,2
    const mode = (playMode.value + 1) % 3
    // 提交action
    store.dispatch('changeMode', mode)
  }

  return { modeIcon, modeText, changeMode }
}
