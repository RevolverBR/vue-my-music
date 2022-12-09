<template>
  <div class="player" v-show="playList.length">
    <transition
      name="normal"
      @enter="enter"
      @after-enter="afterEnter"
      @leave="leave"
      @afterLeave="afterLeave"
    >
      <div class="normal-player" v-show="fullScreen" ref="normalplayerRef">
        <div class="background">
          <img :src="currentSong.pic" />
        </div>
        <div class="top">
          <div class="back" @click="goBack">
            <i class="icon-back" />
          </div>
          <h1 class="title">{{ currentSong.name }}</h1>
          <h2 class="subtitle">{{ currentSong.singer }}</h2>
        </div>

        <div
          class="middle"
          @touchstart.prevent="onMiddleTouchStart"
          @touchmove.prevent="onMiddleTouchMove"
          @touchend.prevent="onMiddleTouchEnd"
        >
          <div class="middle-l" :style="middleLStyle">
            <div class="cd-wrapper" ref="cdWrapperRef">
              <div class="cd" ref="cdRef">
                <img
                  :src="currentSong.pic"
                  class="image"
                  :class="cdCls"
                  ref="cdImageRef"
                />
              </div>
            </div>
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric">{{ playingLyric }}</div>
            </div>
          </div>

          <my-scroll
            class="middle-r"
            :style="middleRStyle"
            ref="lyricScrollRef"
          >
            <div class="lyric-wrapper">
              <div v-if="currentLyric" ref="lyricListRef">
                <p
                  class="text"
                  :class="{ current: currentLineNum === index }"
                  v-for="(line, index) in currentLyric.lines"
                  :key="line.num"
                >
                  {{ line.txt }}
                </p>
              </div>
              <div class="pure-music" v-show="pureMusicLyric">
                <p>
                  {{ pureMusicLyric }}
                </p>
              </div>
            </div>
          </my-scroll>
        </div>

        <div class="bottom">
          <div class="dot-wrapper">
            <span class="dot" :class="{ active: currentShow === 'cd' }"></span>
            <span
              class="dot"
              :class="{ active: currentShow === 'lyric' }"
            ></span>
          </div>
          <div class="progress-wrapper">
            <span class="time time-l">{{ formatTime(currentTime) }}</span>
            <div class="progress-bar-wrapper">
              <progress-bar
                :progress="progress"
                @progress-changing="onProgressChanging"
                @progress-changed="onProgressChanged"
                ref="barRef"
              />
            </div>
            <span class="time time-r">{{
              formatTime(currentSong.duration)
            }}</span>
          </div>

          <div class="operators">
            <div class="icon i-left">
              <i :class="modeIcon" @click="changeMode"></i>
            </div>
            <div class="icon i-left" :class="disableCls">
              <i class="icon-prev" @click="prev"></i>
            </div>
            <div class="icon i-center" :class="disableCls">
              <i :class="playIcon" @click="togglePlay"></i>
            </div>
            <div class="icon i-right" :class="disableCls">
              <i class="icon-next" @click="next"></i>
            </div>
            <div class="icon i-right">
              <i
                :class="getFavoriteIcon(currentSong)"
                @click="toggleFavorite(currentSong)"
              ></i>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <mini-player :progress="progress" :toggle-play="togglePlay" />
    <audio
      ref="audioRef"
      @pause="pause"
      @canplay="ready"
      @error="error"
      @timeupdate="updateTime"
      @ended="end"
    ></audio>
  </div>
</template>

<script>
import { computed, watch, ref, nextTick } from 'vue'
import { useStore } from 'vuex'
// 组件
import progressBar from './progress-bar.vue'
import myScroll from '@/components/base/scroll/scroll'
import miniPlayer from './mini-player.vue'
// function
import useMode from './use-mode'
import useFavorite from './use-favorite'
import { formatTime } from '@/assets/js/util'
import useCd from './use-cd'
import useLyric from './use-lyric'
import useMiddleInterActive from './use-middle-interactive'
import useAnimation from './use-animation'
// data
import { PLAY_MODE } from '@/assets/js/constant'

export default {
  name: 'player',
  components: {
    progressBar,
    myScroll,
    miniPlayer
  },
  setup() {
    const store = useStore()
    const normalplayerRef = ref(null)
    const fullScreen = computed(() => store.state.fullScreen)

    const currentSong = computed(() => store.getters.currentSong)
    const audioRef = ref(null)
    const barRef = ref(null)
    // playing状态
    const playing = computed(() => store.state.playing)
    // 当前播放索引
    const currentIndex = computed(() => store.state.currentIndex)
    // 当前播放列表
    const playList = computed(() => store.state.playList)
    // 歌曲默认没准备好
    const songReady = ref(false)
    // disalbe样式
    const disableCls = computed(() => {
      return songReady.value ? '' : 'disable'
    })
    // 当前播放时间
    const currentTime = ref(0)
    // 播放进度
    const progress = computed(() => {
      return currentTime.value / currentSong.value.duration
    })
    // 播放进度标识位
    let progressChanging = false
    // 播放模式
    const playMode = computed(() => store.state.playMode)

    // hooks
    // 判断播放模式动态赋予播放模式icon
    const { modeIcon, changeMode } = useMode()
    // favorite
    const { getFavoriteIcon, toggleFavorite } = useFavorite()
    // cd
    const { cdCls, cdRef, cdImageRef } = useCd()
    // lyric
    const {
      currentLyric,
      currentLineNum,
      playLyric,
      lyricScrollRef,
      lyricListRef,
      stopLyric,
      pureMusicLyric,
      playingLyric
    } = useLyric(songReady, currentTime)
    // middle-interactive
    const {
      currentShow,
      middleLStyle,
      middleRStyle,
      onMiddleTouchStart,
      onMiddleTouchMove,
      onMiddleTouchEnd
    } = useMiddleInterActive()

    // animation
    const {
      cdWrapperRef,
      enter,
      afterEnter,
      leave,
      afterLeave
    } = useAnimation()

    // 开始播放
    watch(currentSong, newSong => {
      if (!newSong.id || !newSong.url) {
        return
      }
      currentTime.value = 0
      songReady.value = false
      const audioEl = audioRef.value
      audioEl.src = newSong.url
      audioEl.play()
      store.commit('setPlayingState', true)
    })

    // 播放页退出按钮
    function goBack() {
      store.commit('setFullScreen', false)
    }

    // 播放按钮动态样式
    const playIcon = computed(() => {
      return playing.value ? 'icon-pause' : 'icon-play'
    })

    // 点击播放按钮事件
    function togglePlay() {
      if (!songReady.value) return
      store.commit('setPlayingState', !playing.value)
    }
    // watch播放状态
    watch(playing, newPlaying => {
      if (!songReady.value) return
      const audioEl = audioRef.value
      if (newPlaying) {
        audioEl.play()
        playLyric()
      } else {
        audioEl.pause()
        stopLyric()
      }
    })

    // 让mini播放器放大时进度条不会从0开始
    watch(fullScreen, async newFullScreen => {
      if (newFullScreen) {
        await nextTick()
        barRef.value.setOffset(progress.value)
      }
    })

    // audio原生pause事件
    function pause() {
      store.commit('setPlayingState', false)
    }

    // 前进后退按钮
    function prev() {
      const list = playList.value
      // 一首歌都没有
      if (!songReady.value || !list.length) return
      // 只有一首歌
      if (list.length === 1) {
        loop()
      } else {
        let index = currentIndex.value - 1
        if (index === -1) {
          index = list.length - 1
        }
        store.commit('setCurrentIndex', index)
      }
    }
    function next() {
      const list = playList.value
      // 一首歌都没有
      if (!songReady.value || !list.length) return
      // 只有一首歌
      if (list.length === 1) {
        loop()
      } else {
        let index = currentIndex.value + 1
        if (index === list.length) {
          index = 0
        }
        store.commit('setCurrentIndex', index)
      }
    }

    // 循环播放
    function loop() {
      const audioEl = audioRef.value
      // 从0开始播放
      audioEl.currentTime = 0
      audioEl.play()
      store.commit('setPlayingState', true)
    }

    // 处理点击切换过快出现的报错
    function ready() {
      if (songReady.value) return
      songReady.value = true
      playLyric()
    }

    // 监听播放错误
    function error() {
      songReady.value = true
    }

    // audio原生事件得到currenttime
    function updateTime(e) {
      if (!progressChanging) {
        currentTime.value = e.target.currentTime
      }
    }

    // 移动进度条事件
    function onProgressChanging(progress) {
      progressChanging = true
      currentTime.value = currentSong.value.duration * progress
      playLyric()
      stopLyric()
    }
    function onProgressChanged(progress) {
      progressChanging = false
      audioRef.value.currentTime = currentTime.value =
        currentSong.value.duration * progress
      if (!playing.value) {
        store.commit('setPlayingState', true)
      }
      playLyric()
    }

    // audio原生播放结束事件
    function end() {
      currentTime.value = 0
      if (playMode.value === PLAY_MODE.loop) {
        loop()
      } else {
        next()
      }
    }

    // 非player全屏让normal隐藏，v-show没作用？？？？
    watch(fullScreen, (newFullScreen) => {
      if (newFullScreen) return
      setTimeout(() => {
        normalplayerRef.value.style.display = 'none'
      }, 600)
    })

    return {
      playList,
      barRef,
      fullScreen,
      currentSong,
      audioRef,
      goBack,
      playIcon,
      togglePlay,
      pause,
      prev,
      next,
      ready,
      disableCls,
      error,
      modeIcon,
      changeMode,
      getFavoriteIcon,
      toggleFavorite,
      currentTime,
      progress,
      updateTime,
      formatTime,
      onProgressChanging,
      onProgressChanged,
      end,
      cdCls,
      cdRef,
      cdImageRef,
      currentLyric,
      currentLineNum,
      lyricScrollRef,
      lyricListRef,
      pureMusicLyric,
      playingLyric,
      currentShow,
      middleLStyle,
      middleRStyle,
      onMiddleTouchStart,
      onMiddleTouchMove,
      onMiddleTouchEnd,
      // animation
      cdWrapperRef,
      normalplayerRef,
      enter,
      afterEnter,
      leave,
      afterLeave
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/variable.scss';
@import '@/assets/scss/mixin.scss';
.player {
  .normal-player {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 150;
    background: $color-background;
    .background {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      opacity: 0.6;
      filter: blur(20px);
      img {
        width: 100%;
        height: 100%;
      }
    }
    .top {
      position: relative;
      margin-bottom: 25px;
      .back {
        position: absolute;
        top: 0;
        left: 6px;
        z-index: 50;
        .icon-back {
          display: block;
          padding: 9px;
          font-size: $font-size-large-x;
          color: $color-theme;
          transform: rotate(-90deg);
        }
      }
      .title {
        width: 70%;
        margin: 0 auto;
        line-height: 40px;
        text-align: center;
        @include no-wrap();
        font-size: $font-size-large;
        color: $color-text;
      }
      .subtitle {
        line-height: 20px;
        text-align: center;
        font-size: $font-size-medium;
        color: $color-text;
      }
    }
    .middle {
      position: fixed;
      width: 100%;
      top: 80px;
      bottom: 170px;
      white-space: nowrap;
      font-size: 0;
      .middle-l {
        display: inline-block;
        vertical-align: top;
        position: relative;
        width: 100%;
        height: 0;
        padding-top: 80%;
        .cd-wrapper {
          position: absolute;
          left: 10%;
          top: 0;
          width: 80%;
          box-sizing: border-box;
          height: 100%;
          .cd {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            img {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
              box-sizing: border-box;
              border-radius: 50%;
              border: 10px solid rgba(255, 255, 255, 0.1);
            }
            .playing {
              animation: rotate 20s linear infinite;
            }
          }
        }
        .playing-lyric-wrapper {
          width: 80%;
          margin: 30px auto 0 auto;
          overflow: hidden;
          text-align: center;
          .playing-lyric {
            height: 20px;
            line-height: 20px;
            font-size: $font-size-medium;
            color: $color-text-l;
          }
        }
      }
      .middle-r {
        display: inline-block;
        vertical-align: top;
        width: 100%;
        height: 100%;
        overflow: hidden;
        .lyric-wrapper {
          width: 80%;
          margin: 0 auto;
          overflow: hidden;
          text-align: center;
          .text {
            line-height: 32px;
            color: $color-text-l;
            font-size: $font-size-medium;
            &.current {
              color: $color-text;
            }
          }
          .pure-music {
            padding-top: 50%;
            line-height: 32px;
            color: $color-text-l;
            font-size: $font-size-medium;
          }
        }
      }
    }
    .bottom {
      position: absolute;
      width: 100%;
      bottom: 50px;
      .dot-wrapper {
        text-align: center;
        font-size: 0;
        .dot {
          display: inline-block;
          vertical-align: middle;
          margin: 0 4px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: $color-text-l;
          &.active {
            width: 20px;
            border-radius: 5px;
            background: $color-text-ll;
          }
        }
      }
      .progress-wrapper {
        display: flex;
        align-items: center;
        width: 80%;
        margin: 0 auto;
        padding: 10px 0;
        .time {
          color: $color-text;
          font-size: $font-size-small;
          flex: 0 0 40px;
          line-height: 30px;
          width: 40px;
          &.time-l {
            text-align: left;
          }
          &.time-r {
            text-align: right;
          }
        }
        .progress-bar-wrapper {
          flex: 1;
        }
      }
      .operators {
        display: flex;
        .icon {
          flex: 1;
          color: $color-theme;
          text-align: center;
          i {
            font-size: 30px;
          }
          &.disable {
            color: $color-theme-d;
          }
        }
        .i-left {
          text-align: right;
        }
        .i-center {
          padding: 0 20px;
          text-align: center;
          i {
            font-size: 40px;
          }
        }
        .icon-favorite {
          color: $color-sub-theme;
        }
        .i-right {
          text-align: left;
        }
      }
    }
    &.normal-enter-active,
    &.normal-leave-active {
      transition: all 0.6s;
      .top,
      .bottom {
        transition: all 0.6s cubic-bezier(0.45, 0, 0.55, 1);
      }
    }
    &.normal-enter-from,
    &.normal-leave-to {
      opacity: 0;
      .top {
        transform: translate3d(0, -100px, 0);
      }
      .bottom {
        transform: translate3d(0, 100px, 0);
      }
    }
  }
}
</style>
