import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import AppLayout from '@/layouts/AppLayout.vue';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/LoginPage.vue'),
    meta: { requiresAuth: false }
  },

  {
    path: '/',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('../pages/DashboardPage.vue')
      },

      {
        path: 'expenses',
        name: 'Expenses',
        component: () => import('../pages/ExpensesPage.vue')
      },

      {
        path: 'categories',
        name: 'Categories',
        component: () => import('../pages/CategoriesPage.vue')
      },
      {
        path: 'debts',
        name: 'Debts',
        component: () => import('../pages/DebtsPage.vue')
      },
      {
        path: 'accounts',
        name: 'Accounts',
        component: () => import('../pages/AccountsPage.vue')
      },
    ]
  }

];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // If we don't have a user in the store yet, try to hydrate from cookie
  if (!authStore.user) {
    await authStore.initAuth();
  }

  // Now you can safely protect routes:
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login' });
  } else {
    next();
  }
});

export default router;