import { PLAY_MODE } from '@/assets/js/constant'
import { shuffle } from '@/assets/js/util'

// 顺序播放
export function selectPlay({ commit }, { list, index }) {
  commit('setPlayMode', PLAY_MODE.sequence)
  commit('setSequenceList', list)
  commit('setPlayingState', true)
  commit('setFullScreen', true)
  commit('setPlayList', list)
  commit('setCurrentIndex', index)
}

// 随机播放
export function randomPlay({ commit }, list) {
  commit('setPlayMode', PLAY_MODE.random)
  commit('setSequenceList', list)
  commit('setPlayingState', true)
  commit('setFullScreen', true)
  commit('setPlayList', shuffle(list))
  commit('setCurrentIndex', 0)
}

// 变更播放模式
export function changeMode({ commit, state, getters }, mode) {
  const currentId = getters.currentSong.id
  if (mode === PLAY_MODE.random) {
    // 随机播放
    commit('setPlayList', shuffle(state.sequenceList))
  } else {
    // 顺序播放
    commit('setPlayList', state.sequenceList)
  }
  // 让当前歌曲index重新绑定到洗牌后的当前歌曲
  const index = state.playList.findIndex(song => {
    return song.id === currentId
  })

  commit('setCurrentIndex', index)
  commit('setPlayMode', mode)
}

// removeSong
export function removeSong({ commit, state }, song) {
  const sequenceList = state.sequenceList.slice()
  const playList = state.playList.slice()

  const sequenceListIndex = findIndex(sequenceList, song)
  const playListIndex = findIndex(playList, song)

  // 一层保护
  if (sequenceListIndex < 0 || playListIndex < 0) return

  sequenceList.splice(sequenceListIndex, 1)
  playList.splice(playListIndex, 1)

  // 删除当前歌曲前面歌曲时index发生变化，让index自适应
  let currentIndex = state.currentIndex
  if (playListIndex < currentIndex || currentIndex === playList.length) {
    currentIndex--
  }

  commit('setSequenceList', sequenceList)
  commit('setPlayList', playList)
  commit('setCurrentIndex', currentIndex)
  if (!playList.length) {
    commit('setPlayingState', false)
  }
}

// 清空列表
export function clearSongList({ commit, state }) {
  commit('setSequenceList', [])
  commit('setPlayList', [])
  commit('setCurrentIndex', 0)
  commit('setPlayingState', false)
}

// removeSong内使用
function findIndex(list, song) {
  return list.findIndex(item => {
    return item.id === song.id
  })
}
