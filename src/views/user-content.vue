<template>
  <div class="user-center" v-no-result:[noResultText]="noResult">
    <div class="back">
      <i class="icon-back" @click="back"></i>
    </div>
    <div class="switches-wrapper">
      <switches :items="['我喜欢的', '最近播放']" v-model="currentIndex" />
    </div>
    <div class="play-btn" v-if="currentList.length" @click="random">
      <i class="icon-play"></i>
      <span class="text">随机播放全部</span>
    </div>
    <div class="list-wrapper">
      <myScroll class="list-scroll" v-if="currentIndex === 0">
        <div class="list-inner">
          <song-list :songs="favoriteList" @select="selectSong" />
        </div>
      </myScroll>
      <myScroll class="list-scroll" v-if="currentIndex === 1">
        <div class="list-inner">
          <song-list :songs="playHistory" @select="selectSong" />
        </div>
      </myScroll>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import myScroll from '@/components/base/scroll/scroll'
import songList from '@/components/base/song-list/song-list'
import switches from '@/components/switches/switches'
export default {
  name: 'UserContent',
  components: {
    myScroll,
    songList,
    switches
  },
  data() {
    return {
      currentIndex: 0
    }
  },
  computed: {
    noResult() {
      return this.currentIndex === 0
        ? !this.favoriteList.length
        : !this.playHistory.length
    },
    noResultText() {
      return this.currentIndex === 0 ? '暂无收藏歌曲' : '你还没有听过歌曲'
    },
    currentList() {
      return this.currentIndex === 0 ? this.favoriteList : this.playHistory
    },
    ...mapState(['favoriteList', 'playHistory'])
  },
  methods: {
    back() {
      this.$router.push({
        path: '/'
      })
    },
    selectSong({ song }) {
      this.addSong(song)
    },
    random() {
      this.randomPlay(this.currentList)
    },
    ...mapActions(['addSong', 'randomPlay'])
  }
}
</script>

<style lang="scss" scoped>
.user-center {
  position: fixed;
  top: 0;
  bottom: 0;
  z-index: 100;
  width: 100%;
  background: $color-background;
  .back {
    position: absolute;
    top: 6px;
    left: 6px;
    z-index: 50;
    .icon-back {
      display: block;
      padding: 10px;
      font-size: $font-size-large-x;
      color: $color-theme;
    }
  }
  .switches-wrapper {
    margin: 10px 0 30px 0;
  }
  .play-btn {
    box-sizing: border-box;
    width: 135px;
    padding: 7px 0;
    margin: 0 auto;
    text-align: center;
    border: 1px solid $color-text-l;
    color: $color-text-l;
    border-radius: 100px;
    font-size: 0;
    .icon-play {
      display: inline-block;
      vertical-align: middle;
      margin-right: 6px;
      font-size: $font-size-medium-x;
    }
    .text {
      display: inline-block;
      vertical-align: middle;
      font-size: $font-size-small;
    }
  }
  .list-wrapper {
    position: absolute;
    top: 110px;
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
}
</style>
