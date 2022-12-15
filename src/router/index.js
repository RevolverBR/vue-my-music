import { createRouter, createWebHashHistory } from 'vue-router'

// import tabRecommend from '@/views/recommend'
// import tabSearch from '@/views/search'
// import tabSinger from '@/views/singer'
// import tabTopList from '@/views/top-list'
// import singerDetail from '@/views/singer-detail'
// import album from '@/views/album'
// import topDetail from '@/views/top-detail'
// import UserContent from '@/views/user-content'

const tabRecommend = () =>
  import('@/views/recommend' /* webpackChunkName: "recommend" */)
const tabSearch = () =>
  import('@/views/search' /* webpackChunkName: "tabSearch" */)
const tabSinger = () =>
  import('@/views/singer' /* webpackChunkName: "tabSinger" */)
const tabTopList = () =>
  import('@/views/top-list' /* webpackChunkName: "tabTopList" */)
const singerDetail = () =>
  import('@/views/singer-detail' /* webpackChunkName: "singerDetail" */)
const album = () => import('@/views/album' /* webpackChunkName: "album" */)
const topDetail = () =>
  import('@/views/top-detail' /* webpackChunkName: "topDetail" */)
const UserContent = () =>
  import('@/views/user-content' /* webpackChunkName: "UserContent" */)

const routes = [
  {
    path: '/',
    redirect: '/recommend'
  },
  {
    path: '/recommend',
    component: tabRecommend,
    children: [
      {
        path: ':id',
        component: album
      }
    ]
  },
  {
    path: '/singer',
    component: tabSinger,
    children: [
      {
        path: ':id',
        component: singerDetail
      }
    ]
  },
  {
    path: '/search',
    component: tabSearch,
    children: [
      {
        path: ':id',
        component: singerDetail
      }
    ]
  },
  {
    path: '/top-list',
    component: tabTopList,
    children: [
      {
        path: ':id',
        component: topDetail
      }
    ]
  },
  {
    path: '/user',
    components: {
      user: UserContent
    }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
