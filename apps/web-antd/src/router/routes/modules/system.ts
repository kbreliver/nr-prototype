import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:settings',
      order: 8,
      title: $t('page.system.title'),
    },
    name: 'System',
    path: '/system',
    children: [
      {
        name: 'OrganizationManagement',
        path: '/system/organization',
        component: () => import('#/views/system/organization/index.vue'),
        meta: {
          icon: 'lucide:network',
          title: $t('page.system.organization'),
        },
      },
      {
        name: 'UserManagement',
        path: '/system/user',
        component: () => import('#/views/system/user/index.vue'),
        meta: {
          icon: 'lucide:user-cog',
          title: $t('page.system.user'),
        },
      },
      {
        name: 'RoleManagement',
        path: '/system/role',
        component: () => import('#/views/system/role/index.vue'),
        meta: {
          icon: 'lucide:shield',
          title: $t('page.system.role'),
        },
      },
      {
        name: 'DictionaryManagement',
        path: '/system/dictionary',
        component: () => import('#/views/system/dictionary/index.vue'),
        meta: {
          icon: 'lucide:book',
          title: $t('page.system.dictionary'),
        },
      },
    ],
  },
];

export default routes;


