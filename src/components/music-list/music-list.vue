<template>
  <div class="music-list">
    <div class="back" @click="goBack">
      <i class="icon-back"></i>
    </div>

    <h1 class="title">{{ title }}</h1>

    <div class="bg-image" :style="bgImageStyle" ref="bgImage">
      <div class="play-btn-wrapper" :style="playBtnStyle">
        <div class="play-btn" @click="random">
          <i class="icon-play"></i>
          <span class="text">随机播放全部</span>
        </div>
      </div>
      <div class="filter" :style="filterStyle"></div>
    </div>

    <myScroll
      class="list"
      :style="scrollStyle"
      v-loading="loading"
      v-no-result:[noResultText]="noResult"
      :probe-type="3"
      @scroll="onScroll"
    >
      <div class="song-list-wrapper">
        <song-list :songs="songs" @select="selectItem"></song-list>
      </div>
    </myScroll>
  </div>
</template>

<script>
import myScroll from '@/components/wrap-scroll/wrap-scroll'
import songList from '@/components/base/song-list/song-list'
import { mapActions, mapState } from 'vuex'

const RESERVED_HEIGHT = 40

export default {
  name: 'music-list',
  components: {
    songList,
    myScroll
  },
  data() {
    return {
      imageHeight: 0,
      scrollY: 0,
      maxTranslateY: 0
    }
  },
  props: {
    songs: {
      type: Array,
      default() {
        return []
      }
    },
    title: String,
    pic: String,
    loading: Boolean,
    noResultText: {
      type: String,
      default: '抱歉，没有找到可播放的歌曲'
    }
  },
  computed: {
    bgImageStyle() {
      const scrollY = this.scrollY
      let zIndex = 0
      let paddingBottom = '70%'
      let height = 0

      // iphone上拉效果兼容配置
      let translateZ = 0

      let scale = 1

      // 列表网上拉到最大距离后让图片压在列表上层
      if (scrollY > this.maxTranslateY) {
        zIndex = 10
        paddingBottom = 0
        height = `${RESERVED_HEIGHT}px`
        translateZ = 1
      }

      // 页面下拉缩放效果
      if (scrollY < 0) {
        scale = 1 + Math.abs(scrollY / this.imageHeight)
      }

      return {
        zIndex,
        backgroundImage: `url(${this.pic})`,
        paddingBottom,
        height,
        transform: `scale(${scale})translateZ(${translateZ}px)`
      }
    },
    scrollStyle() {
      const bottom = this.playList.length ? '40px' : '0'
      return {
        top: `${this.imageHeight}px`,
        bottom
      }
    },
    filterStyle() {
      // 虚化效果
      let blur = 0
      const scrollY = this.scrollY
      const imageHeight = this.imageHeight
      if (scrollY >= 0) {
        blur =
          Math.min(this.maxTranslateY / imageHeight, scrollY / imageHeight) * 5
      }

      return {
        backdropFilter: `blur(${blur}px)`
      }
    },
    // 页面没有数据的情况
    noResult() {
      return !this.loading && !this.songs.length
    },
    // 随机播放按钮上拉隐藏
    playBtnStyle() {
      let display = ''
      if (this.scrollY >= this.maxTranslateY) {
        display = 'none'
      }

      return { display }
    },
    ...mapState(['playList'])
  },
  methods: {
    // 返回歌手页
    goBack() {
      this.$router.back()
    },
    // 监听页面滚动行为
    onScroll(pos) {
      this.scrollY = -pos.y
    },
    selectItem({ song, index }) {
      this.selectPlay({
        list: this.songs,
        index
      })
    },
    random() {
      this.randomPlay(this.songs)
    },
    ...mapActions(['selectPlay', 'randomPlay'])
  },
  mounted() {
    this.imageHeight = this.$refs.bgImage.clientHeight
    this.maxTranslateY = this.imageHeight - RESERVED_HEIGHT
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/variable.scss';
@import '@/assets/scss/mixin.scss';
.music-list {
  position: relative;
  height: 100%;
  .back {
    position: absolute;
    top: 0;
    left: 6px;
    z-index: 20;
    transform: translateZ(2px);
    .icon-back {
      display: block;
      padding: 10px;
      font-size: $font-size-large-x;
      color: $color-theme;
    }
  }
  .title {
    position: absolute;
    top: 0;
    left: 10%;
    width: 80%;
    z-index: 20;
    transform: translateZ(2px);
    @include no-wrap();
    text-align: center;
    line-height: 40px;
    font-size: $font-size-large;
    color: $color-text;
  }
  .bg-image {
    position: relative;
    width: 100%;
    transform-origin: top;
    background-size: cover;
    .play-btn-wrapper {
      position: absolute;
      width: 100%;
      bottom: 20px;
      z-index: 10;
      .play-btn {
        box-sizing: border-box;
        width: 135px;
        padding: 7px 0;
        margin: 0 auto;
        text-align: center;
        border: 1px solid $color-theme;
        color: $color-theme;
        border-radius: 100px;
        // font-size: 0;
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
    }
    .filter {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(7, 17, 27, 0.4);
    }
  }
  .list {
    position: absolute;
    bottom: 0;
    width: 100%;
    z-index: 0;
    .song-list-wrapper {
      padding: 20px 30px;
      background: $color-background;
    }
  }
}
</style>
