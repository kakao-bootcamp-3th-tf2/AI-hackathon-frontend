import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig
} from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
const ACCESS_TOKEN_STORAGE_KEY = "accessToken";
const ONBOARDING_STATUS_STORAGE_KEY = "onboardingStatus";
const MEMBER_ID_STORAGE_KEY = "memberId";
const AUTH_TOKEN_COOKIE = "ai-hackathon:auth-token";
const MEMBER_ID_COOKIE = "ai-hackathon:memberId";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export interface AuthRedirectFragment {
  accessToken: string;
  status?: string;
  memberId?: string;
}

interface HttpClientConfig {
  baseURL?: string;
  headers?: Record<string, string>;
  timeout?: number;
}

const safeWindow = typeof window !== "undefined";
const safeDocument = typeof document !== "undefined";

const setCookie = (name: string, value: string, maxAgeSeconds: number) => {
  if (!safeDocument) return;
  const expires = maxAgeSeconds > 0 ? maxAgeSeconds : 0;
  const expireValue = expires > 0 ? `; max-age=${expires}` : "; max-age=0";
  const cookieValue = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Strict${expireValue}`;
  document.cookie = cookieValue;
};

const removeCookie = (name: string) => {
  if (!safeDocument) return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Strict`;
};

class HttpClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private redirectData: AuthRedirectFragment | null = null;
  private tokenListeners = new Set<(token: string | null) => void>();

  constructor(config: HttpClientConfig) {
    const resolvedTimeout = config.timeout ?? 0;
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: resolvedTimeout,
      headers: {
        "Content-Type": "application/json",
        ...config.headers
      },
      withCredentials: true // 쿠키 자동 포함
    });

    if (safeWindow) {
      this.syncRedirectFragment();
      this.restoreAccessTokenFromStorage();
    }
  }

  private notifyTokenListeners() {
    this.tokenListeners.forEach((listener) => listener(this.accessToken));
  }

  private parseHashFragment(hash: string): AuthRedirectFragment | null {
    if (!hash.startsWith("#")) {
      return null;
    }

    const fragmentString = hash.slice(1);
    const params = new URLSearchParams(fragmentString);
    const accessToken = params.get("accessToken");
    const status = params.get("status") ?? undefined;
    const memberId = params.get("memberId") ?? undefined;

    if (!accessToken) {
      return null;
    }

    return { accessToken, status, memberId };
  }

  private syncRedirectFragment() {
    if (!safeWindow) return;

    const fragment = this.parseHashFragment(window.location.hash);
    if (!fragment?.accessToken) return;

    this.redirectData = fragment;
    this.setToken(fragment.accessToken, { persist: true });

    if (fragment.status) {
      window.localStorage.setItem(ONBOARDING_STATUS_STORAGE_KEY, fragment.status);
    }

    if (fragment.memberId) {
      window.localStorage.setItem(MEMBER_ID_STORAGE_KEY, fragment.memberId);
      setCookie(MEMBER_ID_COOKIE, fragment.memberId, COOKIE_MAX_AGE_SECONDS);
    }

    window.history.replaceState(
      {},
      document.title,
      window.location.pathname + window.location.search
    );
  }

  private restoreAccessTokenFromStorage() {
    if (!safeWindow) return;
    const storedToken = window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
    if (storedToken) {
      this.setToken(storedToken, { persist: false });
    }
  }

  private setToken(token: string | null, options: { persist: boolean }) {
    this.accessToken = token;
    if (token) {
      this.client.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      if (options.persist && safeWindow) {
        window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
      }
      setCookie(AUTH_TOKEN_COOKIE, token, COOKIE_MAX_AGE_SECONDS);

      if (safeWindow) {
        const storedMemberId = window.localStorage.getItem(MEMBER_ID_STORAGE_KEY);
        if (storedMemberId) {
          setCookie(MEMBER_ID_COOKIE, storedMemberId, COOKIE_MAX_AGE_SECONDS);
        }
      }
    } else {
      delete this.client.defaults.headers.common["Authorization"];
      if (safeWindow) {
        window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
        window.localStorage.removeItem(ONBOARDING_STATUS_STORAGE_KEY);
        window.localStorage.removeItem(MEMBER_ID_STORAGE_KEY);
      }
      removeCookie(AUTH_TOKEN_COOKIE);
      removeCookie(MEMBER_ID_COOKIE);
      this.redirectData = null;
    }

    this.notifyTokenListeners();
  }

  // GET 요청
  async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }

  // POST 요청
  async post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }

  // PUT 요청
  async put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config);
  }

  // PATCH 요청
  async patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(url, data, config);
  }

  // DELETE 요청
  async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config);
  }

  // Authorization header
  setAuthorizationHeader(token: string) {
    this.setToken(token, { persist: true });
  }

  removeAuthorizationHeader() {
    this.setToken(null, { persist: true });
  }

  getAccessToken() {
    return this.accessToken;
  }

  consumeRedirectData(): AuthRedirectFragment | null {
    const data = this.redirectData;
    this.redirectData = null;
    return data;
  }

  onAccessTokenChange(listener: (token: string | null) => void) {
    this.tokenListeners.add(listener);
    listener(this.accessToken);
    return () => {
      this.tokenListeners.delete(listener);
    };
  }

  useRequestInterceptor(
    onFulfilled?: (
      config: InternalAxiosRequestConfig
    ) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>,
    onRejected?: (error: unknown) => Promise<unknown>
  ) {
    this.client.interceptors.request.use(onFulfilled, onRejected);
  }

  useResponseInterceptor<T = unknown>(
    onFulfilled?: (
      response: AxiosResponse<T>
    ) => AxiosResponse<T> | Promise<AxiosResponse<T>>,
    onRejected?: (error: unknown) => Promise<unknown>
  ) {
    this.client.interceptors.response.use(onFulfilled, onRejected);
  }
}

const httpClient = new HttpClient({
  baseURL: API_BASE_URL,
  timeout: 0, // 무기한 타임아웃 (0 = no timeout)
  headers: {}
});

export default httpClient;
