<template>
  <teleport to="body">
    <transition name="slide">
      <div class="add-song" v-show="visible">
        <!-- header -->
        <div class="header">
          <h1 class="title">添加歌曲列表</h1>
          <div class="close" @click="hide">
            <i class="icon-close"></i>
          </div>
        </div>
        <!-- 搜索框 -->
        <div class="search-input-wrapper">
          <search-input v-model="query" placehoder="搜索歌曲" />
        </div>
        <!-- switch -->
        <div v-show="!query">
          <Switches :items="['最近播放', '搜索历史']" v-model="currentIndex" />
          <div class="list-wrapper">
            <myScroll
              ref="scrollRef"
              v-if="currentIndex === 0"
              class="list-scroll"
            >
              <div class="list-inner">
                <song-list
                  :songs="playHistory"
                  @select="selectSongBySongList"
                />
              </div>
            </myScroll>
            <myScroll
              ref="scrollRef"
              v-if="currentIndex === 1"
              class="list-scroll"
            >
              <div class="list-inner">
                <search-list
                  :showDelete="false"
                  :searches="searchHistory"
                  @select="addQuery"
                />
              </div>
            </myScroll>
          </div>
        </div>
        <div class="search-result" v-show="query">
          <suggest
            :query="query"
            :show-singer="false"
            @select-song="selectSongBySuggest"
          />
        </div>
        <Message ref="messageRef">
          <div class="message-title">
            <i class="icon-ok"></i>
            <span class="text">1首歌曲已经添加到播放列表</span>
          </div>
        </Message>
      </div>
    </transition>
  </teleport>
</template>

<script>
import { ref, computed, nextTick, watch } from 'vue'
import { useStore } from 'vuex'
import searchInput from '@/components/search/search-input'
import suggest from '@/components/search/suggest'
import Switches from '@/components/switches/switches'
import myScroll from '@/components/base/scroll/scroll'
import songList from '@/components/base/song-list/song-list'
import searchList from '@/components/base/search-list/search-list'
import useSearchHistory from '@/components/search/use-search-history'
import Message from '@/components/base/message/message'

export default {
  name: 'AddSong',
  components: {
    searchInput,
    suggest,
    Switches,
    myScroll,
    songList,
    searchList,
    Message
  },
  setup() {
    const visible = ref(false)
    const query = ref('')
    const currentIndex = ref(0)
    const store = useStore()
    const { saveSearch } = useSearchHistory()
    const scrollRef = ref(null)
    const messageRef = ref(null)

    const playHistory = computed(() => store.state.playHistory)

    const searchHistory = computed(() => store.state.searchHistory)

    watch(query, async () => {
      await nextTick()
      refreshScroll()
    })

    // 控制组件显示隐藏
    async function show() {
      visible.value = true
      await nextTick()
      refreshScroll()
    }
    function hide() {
      visible.value = false
    }

    function refreshScroll() {
      scrollRef.value.scroll.refresh()
    }

    function addQuery(text) {
      query.value = text
    }

    function selectSongBySongList({ song }) {
      addSong(song)
    }

    function selectSongBySuggest(song) {
      addSong(song)
      saveSearch(query.value)
    }

    function addSong(song) {
      store.dispatch('addSong', song)
      showMessage()
    }

    function showMessage() {
      messageRef.value.show()
    }

    return {
      visible,
      query,
      show,
      hide,
      currentIndex,
      searchHistory,
      playHistory,
      addQuery,
      selectSongBySongList,
      selectSongBySuggest,
      scrollRef,
      messageRef
    }
  }
}
</script>

<style lang="scss" scoped>
.add-song {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 300;
  background: $color-background;
  .header {
    position: relative;
    height: 44px;
    text-align: center;
    .title {
      line-height: 44px;
      font-size: $font-size-large;
      color: $color-text;
    }
    .close {
      position: absolute;
      top: 0;
      right: 8px;
      .icon-close {
        display: block;
        padding: 12px;
        font-size: 20px;
        color: $color-theme;
      }
    }
  }
  .search-input-wrapper {
    margin: 20px;
  }
  .list-wrapper {
    position: absolute;
    top: 165px;
    bottom: 0;
    width: 100%;
    .list-scroll {
      height: 100%;
      overflow: hidden;
      .list-inner {
        padding: 20px 30px;
      }
    }
  }
  .search-result {
    position: fixed;
    top: 124px;
    bottom: 0;
    width: 100%;
  }
}
.message-title {
  text-align: center;
  padding: 18px 0;
  font-size: 0;
  .icon-ok {
    font-size: $font-size-medium;
    color: $color-theme;
    margin-right: 4px;
  }
  .text {
    font-size: $font-size-medium;
    color: $color-text;
  }
}
</style>
