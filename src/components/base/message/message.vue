<template>
  <teleport to="body">
    <transition name="slide-down">
      <div class="message" v-show="visible" @click="hide">
        <slot></slot>
      </div>
    </transition>
  </teleport>
</template>

<script>
export default {
  name: 'Message',
  data() {
    return {
      visible: false
    }
  },
  props: {
    delay: {
      type: Number,
      default: 2000
    }
  },
  methods: {
    show() {
      this.visible = true
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.hide()
      }, this.delay)
    },
    hide() {
      if (!this.visible) return
      this.visible = false
    }
  }
}
</script>

<style lang="scss" scoped>
.message {
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 400;
  background: $color-dialog-background;
  &.slide-down-enter-active,
  &.silde-down-leave-active {
    transition: all 0.3s;
  }
  &.slide-down-enter-from,
  &.slide-down-leave-to {
    transform: translate3d(0, -100%, 0);
  }
}
</style>
