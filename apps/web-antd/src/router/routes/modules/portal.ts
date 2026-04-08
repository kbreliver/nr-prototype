import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      hideInMenu: true,
      noBasicLayout: true,
      title: '门户首页',
    },
    name: 'Portal',
    path: '/portal',
    component: () => import('#/views/portal/index.vue'),
  },
];

export default routes;
