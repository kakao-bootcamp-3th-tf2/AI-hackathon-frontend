import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig
} from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

interface HttpClientConfig {
  baseURL?: string;
  headers?: Record<string, string>;
  timeout?: number;
}

class HttpClient {
  private client: AxiosInstance;

  constructor(config: HttpClientConfig) {
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 10000,
      headers: {
        "Content-Type": "application/json",
        ...config.headers
      },
      withCredentials: true // 쿠키 자동 포함
    });
  }

  // GET 요청
  async get<T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }

  // POST 요청
  async post<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }

  // PUT 요청
  async put<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config);
  }

  // PATCH 요청
  async patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(url, data, config);
  }

  // DELETE 요청
  async delete<T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config);
  }

  // 인터셉터: Authorization 헤더 동적 설정
  setAuthorizationHeader(token: string) {
    this.client.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  // 인터셉터: Authorization 헤더 제거
  removeAuthorizationHeader() {
    delete this.client.defaults.headers.common["Authorization"];
  }

  // 인터셉터 등록 - 요청 전 처리
  useRequestInterceptor(
    onFulfilled?: (
      config: InternalAxiosRequestConfig
    ) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>,
    onRejected?: (error: unknown) => Promise<unknown>
  ) {
    this.client.interceptors.request.use(onFulfilled, onRejected);
  }

  // 인터셉터 등록 - 응답 후 처리
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
  headers: {
    // 필요한 기본 헤더가 있으면 여기에 추가
  }
});

export default httpClient;
