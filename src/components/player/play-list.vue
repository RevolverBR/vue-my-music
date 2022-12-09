<template>
  <teleport to="body">
    <transition name="list-fade">
      <div class="play-list" v-show="visible && playList.length" @click="hide">
        <div class="list-wrapper" @click.stop>
          <!-- header -->
          <div class="list-header">
            <h1 class="title">
              <i class="icon" :class="modeIcon" @click="changeMode"></i>
              <span class="text">{{ modeText }}</span>
              <span class="clear" @click="showConfirm">
                <i class="icon-clear"></i>
              </span>
            </h1>
          </div>
          <!-- list-content -->
          <my-scroll class="list-content" ref="scrollRef">
            <transition-group name="list" tag="ul" ref="listRef">
              <li
                class="item"
                v-for="song in sequenceList"
                :key="song.id"
                @click="selectItem(song)"
              >
                <i class="current" :class="getCurrentIcon(song)"></i>
                <span class="text">{{ song.name }}</span>
                <span class="favorite" @click.stop="toggleFavorite(song)">
                  <i :class="getFavoriteIcon(song)"></i>
                </span>
                <span
                  class="delete"
                  :class="{ disable: removing }"
                  @click.stop="removeSong(song)"
                >
                  <i class="icon-delete"></i>
                </span>
              </li>
            </transition-group>
          </my-scroll>
          <div class="list-footer" @click="hide">
            <span>关闭</span>
          </div>
        </div>
        <!-- confirm -->
        <confirm
          text="是否清空播放列表?"
          confirm-btn-text="清空"
          ref="confirmRef"
          @confirm="confirmClear"
        ></confirm>
      </div>
    </transition>
  </teleport>
</template>

<script>
import myScroll from '@/components/base/scroll/scroll'
import confirm from '@/components/base/confirm/confirm'
import { ref, computed, nextTick, watch } from 'vue'
import { useStore } from 'vuex'
import useMode from './use-mode'
import useFavorite from './use-favorite'
export default {
  name: 'myPlaylist',
  components: {
    myScroll,
    confirm
  },
  setup() {
    const visible = ref(false)
    const store = useStore()
    const scrollRef = ref(null)
    const listRef = ref(null)
    const removing = ref(false)
    const confirmRef = ref(null)
    // computed
    const playList = computed(() => store.state.playList)

    const sequenceList = computed(() => store.state.sequenceList)
    const currentSong = computed(() => store.getters.currentSong)
    // hook
    const { modeIcon, modeText, changeMode } = useMode()
    const { getFavoriteIcon, toggleFavorite } = useFavorite()

    watch(currentSong, async newSong => {
      if (!visible.value || !newSong.id) return
      await nextTick()
      scrollToCurrent()
    })

    // playlist展示与否
    async function show() {
      visible.value = true
      await nextTick()
      refreshScroll()
      scrollToCurrent()
    }
    function hide() {
      visible.value = false
    }

    //
    function getCurrentIcon(song) {
      if (song.id === currentSong.value.id) return 'icon-play'
    }

    //
    function refreshScroll() {
      scrollRef.value.scroll.refresh()
    }

    // 记录位置并重置
    function scrollToCurrent() {
      const index = sequenceList.value.findIndex(song => {
        return currentSong.value.id === song.id
      })
      // 点击remove过快会触发多次，dispatch removeSong时使currentIndex在--时变成负数
      if (index === -1) return
      const target = listRef.value.$el.children[index]

      scrollRef.value.scroll.scrollToElement(target, 300)
    }

    function selectItem(song) {
      const index = playList.value.findIndex(item => {
        return song.id === item.id
      })

      store.commit('setCurrentIndex', index)
      store.commit('setPlayingState', true)
    }

    function removeSong(song) {
      // 限制removing歌曲的操作时间间隔
      if (removing.value) return
      removing.value = true
      store.dispatch('removeSong', song)
      if (!playList.value.length) {
        hide()
      }
      setTimeout(() => {
        removing.value = false
      }, 300)
    }

    function showConfirm() {
      confirmRef.value.show()
    }

    function confirmClear() {
      store.dispatch('clearSongList')
      hide()
    }

    return {
      visible,
      playList,
      sequenceList,
      removing,
      confirmRef,
      // hook
      modeIcon,
      modeText,
      changeMode,
      getFavoriteIcon,
      toggleFavorite,
      show,
      hide,
      getCurrentIcon,
      scrollRef,
      listRef,
      selectItem,
      removeSong,
      showConfirm,
      confirmClear
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/variable.scss';
@import '@/assets/scss/mixin.scss';
.play-list {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 200;
  background-color: $color-background-d;
  &.list-fade-enter-active,
  &.list-fade-leave-active {
    transition: opacity 0.3s;
    .list-wrapper {
      transition: all 0.3s;
    }
  }
  &.list-fade-enter-from,
  &.list-fade-leave-to {
    opacity: 0;
    .list-wrapper {
      transform: translate3d(0, 100%, 0);
    }
  }
  .list-wrapper {
    position: fixed;
    left: 0;
    bottom: 0;
    z-index: 210;
    width: 100%;
    background-color: $color-highlight-background;
    .list-header {
      position: relative;
      padding: 20px 30px 10px 20px;
      .title {
        display: flex;
        align-items: center;
        .icon {
          margin-right: 10px;
          font-size: 24px;
          color: $color-theme-d;
        }
      }
      .text {
        flex: 1;
        font-size: $font-size-medium;
        color: $color-text-l;
      }
      .clear {
        @include extend-click();
        .icon-clear {
          font-size: $font-size-medium;
          color: $color-text-d;
        }
      }
    }
    .list-content {
      max-height: 240px;
      overflow: hidden;
      .item {
        display: flex;
        align-items: center;
        height: 40px;
        padding: 0 30px 0 20px;
        overflow: hidden;
        .current {
          flex: 0 0 20px;
          width: 20px;
          font-size: $font-size-small;
          color: $color-theme-d;
        }
        .text {
          flex: 1;
          @include no-wrap();
          font-size: $font-size-medium;
          color: $color-text-d;
        }
        .favorite {
          @include extend-click();
          margin-right: 15px;
          font-size: $font-size-small;
          color: $color-theme;
          .icon-favorite {
            color: $color-sub-theme;
          }
        }
        .delete {
          @include extend-click();
          font-size: $font-size-small;
          color: $color-theme;
          &.disable {
            color: $color-theme-d;
          }
        }
      }
    }
    .list-footer {
      text-align: center;
      line-height: 50px;
      background: $color-background;
      font-size: $font-size-medium-x;
      color: $color-text-l;
    }
  }
}
</style>
