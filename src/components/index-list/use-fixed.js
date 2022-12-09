import { ref, watch, nextTick, computed } from 'vue'

export default function useFixed(props) {
  // 标题高度
  const TITLE_HEIGHT = 30
  // 绑定dom节点
  const groupRef = ref(null)
  // 高度区间
  const listHeight = ref([])
  // 纵向滚动的值
  const scrollY = ref(0)
  // 当前位置索引
  const currentIndex = ref(0)
  // 当前渲染组距离下个组的距离
  const distance = ref(0)

  // 确定当前位置标题
  const fixedTitle = computed(() => {
    const currentGroup = props.data[currentIndex.value]
    // 顶头上拉时不显示标题
    if (scrollY.value < 0) {
      return ''
    }

    return currentGroup ? currentGroup.title : ''
  })

  const fixedStyle = computed(() => {
    const distanceVal = distance.value
    // 偏移值
    const diff = (distanceVal > 0 && distanceVal < TITLE_HEIGHT) ? distanceVal - TITLE_HEIGHT : 0

    return {
      transform: `translate3d(0,${diff}px,0)`
    }
  })

  watch(() => props.data, async () => {
    // 数据变化后dom还没变化，所以使用nexttick
    await nextTick()
    calculate()
  })

  // 监听滚动
  watch(scrollY, (newY) => {
    const listHeightVal = listHeight.value
    for (let i = 0; i < listHeightVal.length - 1; i++) {
      // 判断高度在哪个区间
      const heightTop = listHeightVal[i]
      const heightBottom = listHeightVal[i + 1]
      if (newY >= heightTop && newY <= heightBottom) {
        currentIndex.value = i
        distance.value = heightBottom - newY
      }
    }
  })

  // 求取列表高度
  function calculate() {
    // 获取ul里的li
    const list = groupRef.value.children

    const listHeightVal = listHeight.value

    // 清空数组
    listHeightVal.length = 0
    let height = 0

    listHeightVal.push(height)
    // 每个元素对应一个dom
    for (let i = 0; i < list.length; i++) {
      height += list[i].clientHeight
      listHeightVal.push(height)
    }
  }

  // onscroll派发一个参数pos
  function onScroll(pos) {
    scrollY.value = -pos.y
  }

  return {
    groupRef,
    onScroll,
    fixedTitle,
    fixedStyle,
    currentIndex
  }
}
