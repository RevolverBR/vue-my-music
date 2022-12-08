import storage from 'good-storage'

// 添加
export function save(item, key, compare, maxLen) {
  const items = storage.get(key, [])
  insertArray(items, item, compare, maxLen)
  storage.set(key, items)

  return items
}
// 移除
export function remove(key, compare) {
  const items = storage.get(key, [])
  deleteFromArray(items, compare)
  storage.set(key, items)

  return items
}

// 辅助
function insertArray(arr, val, compare, maxLen) {
  const index = arr.findIndex(compare)
  if (index > -1) {
    return
  }
  arr.unshift(val)
  if (maxLen && arr.length > maxLen) {
    // 超过maxlen删掉最后一项
    arr.pop()
  }
}
function deleteFromArray(arr, compare) {
  const index = arr.findIndex(compare)
  if (index > -1) {
    arr.splice(index, 1)
  }
}

// 初始化从storage得到favoritelist
export function load(key) {
  return storage.get(key, [])
}
