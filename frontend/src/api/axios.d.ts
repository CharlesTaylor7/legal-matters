import "axios";

declare module "axios" {
  export interface AxiosRequestConfig {
    // require action for error logging
    metadata: {
      action: string;
    };
  }
  export interface AxiosGetRequestConfig extends AxiosRequestConfig {
    // require signal for cancellation
    signal: AbortSignal;
  }

  // Override axios methods:
  // - require metadata for all requests
  // - require AbortController signals for all get requests
  export interface AxiosInstance {
    get<T = unknown, R = AxiosResponse<T>>(
      url: string,
      config: AxiosGetRequestConfig,
    ): Promise<R>;

    post<T = unknown, R = AxiosResponse<T>, D = unknown>(
      url: string,
      data: D,
      config: AxiosRequestConfig,
    ): Promise<R>;

    put<T = unknown, R = AxiosResponse<T>, D = unknown>(
      url: string,
      data: D,
      config: AxiosRequestConfig,
    ): Promise<R>;

    patch<T = unknown, R = AxiosResponse<T>, D = unknown>(
      url: string,
      data: D,
      config: AxiosRequestConfig,
    ): Promise<R>;

    delete<T = unknown, R = AxiosResponse<T>, D = unknown>(
      url: string,
      data: D,
      config: AxiosRequestConfig,
    ): Promise<R>;
  }
}
