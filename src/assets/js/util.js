// 洗牌
export function shuffle(source) {
  // 避免影响原数组
  const arr = source.slice()
  // 洗牌
  for (let i = 0; i < arr.length; i++) {
    const j = getRandomInt(i)
    swap(arr, i, j)
  }

  return arr
}

// 取0-max的整数
function getRandomInt(max) {
  return Math.floor(Math.random() * (max + 1))
}

// 交换arr[i],arr[j]
function swap(arr, i, j) {
  const t = arr[i]
  arr[i] = arr[j]
  arr[j] = t
}

// 格式化时间
export function formatTime(interval) {
  // 向下取整
  interval = interval | 0

  const minute = (((interval / 60) | 0) + '').padStart(2, '0')
  const second = ((interval % 60) + '').padStart(2, '0')

  return `${minute}:${second}`
}
