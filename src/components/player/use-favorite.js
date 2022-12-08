import { useStore } from 'vuex'
import { computed } from 'vue'
import { save, remove } from '@/assets/js/array-store'
import { FAVORITE_KEY } from '@/assets/js/constant'

export default function useFavorite() {
  const store = useStore()
  const favoriteList = computed(() => store.state.favoriteList)
  const maxLen = 100

  // 根据isfavorite决定favorite按钮的style
  function getFavoriteIcon(song) {
    return isFavorite(song) ? 'icon-favorite' : 'icon-not-favorite'
  }

  // 点击按钮加入favoritelist
  function toggleFavorite(song) {
    let list
    if (isFavorite(song)) {
      // remove
      list = remove(FAVORITE_KEY, compare)
    } else {
      // add
      list = save(song, FAVORITE_KEY, compare, maxLen)
    }
    store.commit('setFavoriteList', list)

    function compare(item) {
      return item.id === song.id
    }
  }

  // 判断favoriteList里有没有当前歌曲
  function isFavorite(song) {
    return (
      favoriteList.value.findIndex(item => {
        return item.id === song.id
      }) > -1
    )
  }

  return { getFavoriteIcon, toggleFavorite }
}
