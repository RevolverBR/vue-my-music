<template>
  <m-header></m-header>
  <tab></tab>
  <router-view v-slot="{ Component }">
    <keep-alive>
      <component :style="viewStyle" :is="Component" />
    </keep-alive>
  </router-view>
  <router-view :style="viewStyle" v-slot="{ Component }" name="user">
    <transition name="slide" appear>
      <component :is="Component" />
    </transition>
  </router-view>
  <player></player>
</template>

<script>
import Header from '@/components/header/header'
import Tab from '@/components/tab/tab'
import player from '@/components/player/player'
import { mapState } from 'vuex'
export default {
  components: {
    MHeader: Header,
    Tab,
    player
  },
  computed: {
    viewStyle() {
      const bottom = this.playList.length ? '40px' : '0'

      return {
        bottom
      }
    },
    ...mapState(['playList'])
  }
}
</script>
