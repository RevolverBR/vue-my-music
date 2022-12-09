import { createRouter, createWebHashHistory } from 'vue-router'

import tabRecommend from '@/views/recommend'
import tabSearch from '@/views/search'
import tabSinger from '@/views/singer'
import tabTopList from '@/views/top-list'
import singerDetail from '@/views/singer-detail'
import album from '@/views/album'
import topDetail from '@/views/top-detail'

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
    component: tabSearch
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
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
