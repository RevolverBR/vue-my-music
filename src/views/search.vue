<template>
  <div class="search">
    <!-- 搜索框 -->
    <div class="search-input-wrapper">
      <searchInput v-model="query" />
    </div>
    <wrapScroll class="search-content" v-show="!query" ref="searchScrollRef">
      <div>
        <!-- 热门推荐 -->
        <div class="hot-keys">
          <h1 class="title">热门搜索</h1>
          <ul>
            <li
              class="item"
              v-for="item in hotKeys"
              :key="item.id"
              @click.stop="addQuery(item.key)"
            >
              <span>{{ item.key }}</span>
            </li>
          </ul>
        </div>
        <!-- 搜索历史 -->
        <div class="search-history" v-show="searchHistory.length">
          <h1 class="title">
            <span class="text">搜索历史</span>
            <span class="clear" @click="showConfirm">
              <i class="icon-clear"></i>
            </span>
          </h1>
          <confirm
            ref="deleteSHCRef"
            text="是否清空所有搜索历史"
            confirm-btn-text="清空"
            @confirm="confirmClear"
          />
          <search-list
            :searches="searchHistory"
            @select="addQuery"
            @delete="deleteSearch"
          />
        </div>
      </div>
    </wrapScroll>
    <!-- 搜索结果 -->
    <div class="search-result" v-show="query">
      <suggest
        :query="query"
        @select-song="selectSong"
        @select-singer="selectSinger"
      ></suggest>
    </div>
    <router-view v-slot="{ Component }">
      <transition appear name="slide">
        <component :is="Component" :data="selectedSinger" />
      </transition>
    </router-view>
  </div>
</template>

<script>
import { ref, computed, watch, nextTick } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import storage from 'good-storage'
import wrapScroll from '@/components/wrap-scroll/wrap-scroll'
import confirm from '@/components/base/confirm/confirm'

import searchInput from '@/components/search/search-input'
import suggest from '@/components/search/suggest'
import searchList from '@/components/base/search-list/search-list'

import { getHotKeys } from '@/service/search'
import { SINGER_KEY } from '@/assets/js/constant'
import useSearchHistory from '@/components/search/use-search-history'

export default {
  name: 'tabSearch',
  components: {
    searchInput,
    suggest,
    searchList,
    wrapScroll,
    confirm
  },
  setup() {
    const query = ref('')
    const hotKeys = ref([])
    const store = useStore()
    const selectedSinger = ref(null)
    const router = useRouter()
    const searchHistory = computed(() => store.state.searchHistory)
    const { saveSearch, deleteSearch, confirmClear } = useSearchHistory()
    const searchScrollRef = ref(null)
    const deleteSHCRef = ref(null)

    getHotKeys().then(result => {
      hotKeys.value = result.hotKeys
    })

    function addQuery(text) {
      query.value = text
    }

    function selectSong(song) {
      saveSearch(query.value)
      store.dispatch('addSong', song)
    }

    function selectSinger(singer) {
      saveSearch(query.value)
      selectedSinger.value = singer
      cacheSinger(singer)
      router.push({
        path: `/search/${singer.mid}`
      })
    }
    function cacheSinger(singer) {
      storage.session.set(SINGER_KEY, singer)
    }

    watch(query, async newQuery => {
      if (!newQuery) {
        await nextTick()
        refreshScroll()
      }
    })

    function refreshScroll() {
      searchScrollRef.value.scroll.refresh()
    }

    function showConfirm() {
      deleteSHCRef.value.show()
    }

    return {
      query,
      hotKeys,
      addQuery,
      selectSong,
      selectedSinger,
      selectSinger,
      searchHistory,
      deleteSearch,
      searchScrollRef,
      showConfirm,
      deleteSHCRef,
      confirmClear
    }
  }
}
</script>

<style lang="scss" scoped>
.search {
  position: fixed;
  width: 100%;
  top: 88px;
  bottom: 0;
  display: flex;
  flex-direction: column;
  .search-input-wrapper {
    margin: 20px;
  }
  .search-content {
    flex: 1;
    overflow: hidden;
    .hot-keys {
      margin: 0 20px 20px 20px;
      .title {
        margin-bottom: 20px;
        font-size: $font-size-medium;
        color: $color-text-l;
      }
      .item {
        display: inline-block;
        padding: 5px 10px;
        margin: 0 20px 10px 0;
        border-radius: 6px;
        background: $color-highlight-background;
        font-size: $font-size-medium;
        color: $color-text-d;
      }
    }
    .search-history {
      position: relative;
      margin: 0 20px;
      .title {
        display: flex;
        align-items: center;
        height: 40px;
        font-size: $font-size-medium;
        color: $color-text-l;
        .text {
          flex: 1;
        }
        .clear {
          @include extend-click();
          .icon-clear {
            font-size: $font-size-medium;
            color: $color-text-d;
          }
        }
      }
    }
  }
  .search-result {
    flex: 1;
    overflow: hidden;
  }
}
</style>
