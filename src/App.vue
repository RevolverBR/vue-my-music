<template>
  <m-header></m-header>
  <tab></tab>
  <router-view :style="viewStyle"></router-view>
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
