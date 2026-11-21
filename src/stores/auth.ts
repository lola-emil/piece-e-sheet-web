import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '../services/api';
import type { User, LoginRequest } from '../types';

export const useAuthStore = defineStore('auth', () => {
    const user = ref<User | null>(null);
    const hasCheckedAuth = ref(false); // <--- Add this flag

    const isAuthenticated = computed(() => !!user.value);

    const initAuth = async () => {
        // Prevent running this on every route navigation
        if (hasCheckedAuth.value) return;

        try {
            await fetchUser();
        } catch (error) {
            user.value = null;
        } finally {
            hasCheckedAuth.value = true;
        }
    };

    const fetchUser = async () => {
        const { data } = await api.get<User>('/auth/me');
        user.value = data;
    };

    const login = async (credentials: LoginRequest) => {
        const { data } = await api.post<{ user: User; }>('/auth/login', credentials);
        user.value = data.user;
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error("Logout request failed", error);
        } finally {
            user.value = null;
            hasCheckedAuth.value = false; // Reset on logout
            window.location.href = '/login';
        }
    };

    return { user, isAuthenticated, hasCheckedAuth, initAuth, fetchUser, login, logout };
});