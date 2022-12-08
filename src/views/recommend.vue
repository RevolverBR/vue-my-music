<template>
  <div class="recommend" v-loading:[loadingText]="loading">
    <my-scroll class="recommend-content">
      <div>
        <div class="slider-wrapper">
          <div class="slider-content">
            <my-slider v-if="sliders.length" :sliders="sliders"></my-slider>
          </div>
        </div>

        <div class="recommend-list">
          <h1 class="list-title" v-show="!loading">热门歌单推荐</h1>
          <ul>
            <li
              class="item"
              v-for="item in albums"
              :key="item.id"
            >
              <div class="icon">
                <img v-lazy="item.pic" width="60" height="60">
              </div>
              <div class="text">
                <h2 class="name">{{item.username}}</h2>
                <p class="title">{{item.title}}</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </my-scroll>
  </div>
</template>

<script>
import { getRecommend } from '@/service/recommend'
import myScroll from '@/components/base/scroll/scroll'
import mySlider from '@/components/base/slider/slider'

export default {
  name: 'tabRecommend',
  components: {
    mySlider,
    myScroll
  },
  data() {
    return {
      sliders: [],
      albums: [],
      loadingText: '！- - 你网络好差'
    }
  },
  async created() {
    const result = await getRecommend()
    this.sliders = result.sliders
    this.albums = result.albums
  },
  computed: {
    loading() {
      return !this.sliders.length && !this.albums.length
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/variable.scss';
.recommend {
  position: fixed;
  width: 100%;
  top: 88px;
  bottom: 0;
  // overflow: scroll;
  .recommend-content {
    height: 100%;
    overflow: hidden;
    .slider-wrapper {
      position: relative;
      width: 100%;
      height: 0;
      padding-top: 40%;
      overflow: hidden;
      .slider-content {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
      }
    }

    .recommend-list {
      .list-title {
        height: 65px;
        line-height: 65px;
        text-align: center;
        font-size: $font-size-medium;
        color: $color-theme;
      }
      .item {
        display: flex;
        box-sizing: border-box;
        align-items: center;
        padding: 0 20px 20px 20px;
        .icon {
          flex: 0 0 60px;
          width: 60px;
          margin-right: 20px;
        }
        .text {
          display: flex;
          flex-direction: column;
          justify-content: center;
          flex: 1;
          line-height: 20px;
          overflow: hidden;
          font-size: $font-size-medium;
        }
        .name {
          margin-bottom: 10px;
          color: $color-text;
        }
        .title {
          color: $color-text-d;
        }
      }
    }
  }
}
</style>
