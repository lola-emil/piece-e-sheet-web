import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});

let refreshPromise: Promise<unknown> | null = null;

function refreshSession() {
    return axios.post(
        `${import.meta.env.VITE_API_URL}/auth/refresh`,
        {},
        { withCredentials: true }
    );
}

function isAuthEndpoint(url: string) {
    return (
        url.includes('/auth/login') ||
        url.includes('/auth/register') ||
        url.includes('/auth/refresh') ||
        url.includes('/auth/google') ||
        url.includes('/auth/me')
    );
}

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const original = error.config as
            | (InternalAxiosRequestConfig & { _retry?: boolean; })
            | undefined;

        const status = error.response?.status;
        const url = original?.url ?? '';

        if (status === 401 && original && !original._retry && !isAuthEndpoint(url)) {
            original._retry = true;

            try {
                refreshPromise ??= refreshSession().finally(() => {
                    refreshPromise = null;
                });
                await refreshPromise;
                return api(original);
            } catch {
                window.location.href = '/login';
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);

export default api;