window.ApiService = class {
  constructor(baseUrl = "http://localhost:8080/api") {
    this.baseUrl = baseUrl;
  }

  getToken() {
    return sessionStorage.getItem("token");
  }

  getHeaders(includeAuth = true, contentType = "application/json") {
    const headers = {};
    if (contentType) headers["Content-Type"] = contentType;
    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
        console.log(
          "Authorization 헤더 추가:",
          `Bearer ${token.substring(0, 20)}...`
        );
      } else {
        console.warn("토큰이 없습니다!");
      }
    }
    console.log("최종 헤더:", headers);
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(options.auth !== false, options.contentType),
        ...options.headers,
      },
      credentials: "include",
    };

    if (
      config.body &&
      !(config.body instanceof FormData) &&
      typeof config.body !== "string"
    ) {
      config.body = JSON.stringify(config.body);
    }

    console.log("API 요청:", {
      url,
      method: config.method || "GET",
      headers: config.headers,
      body: options.body,
    });

    try {
      let response = await fetch(url, config);

      // ✅ 401 처리 개선: authManager가 없으면 즉시 에러
      if (response.status === 401) {
        if (typeof authManager === "undefined") {
          throw { status: 401, message: "인증이 필요합니다." };
        }

        console.log("401 에러 - Access Token 갱신 시도");
        const refreshed = await authManager.refreshAccessToken();

        if (refreshed) {
          // 재시도
          const newToken = this.getToken();
          config.headers["Authorization"] = `Bearer ${newToken}`;
          response = await fetch(url, config);
        } else {
          throw { status: 401, message: "인증이 만료되었습니다." };
        }
      }

      const contentType = response.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        console.error("API 에러 상세:", { status: response.status, url, data });
        throw {
          status: response.status,
          message: data?.message || data || "요청 실패",
          data: data,
        };
      }

      return data;
    } catch (error) {
      console.error("API 요청 오류:", { endpoint, error });
      throw error;
    }
  }

  get(endpoint, auth = true, extra = {}) {
    return this.request(endpoint, { method: "GET", auth, ...extra });
  }

  post(endpoint, body, auth = true, extra = {}) {
    return this.request(endpoint, { method: "POST", body, auth, ...extra });
  }

  put(endpoint, body, auth = true, extra = {}) {
    return this.request(endpoint, { method: "PUT", body, auth, ...extra });
  }

  patch(endpoint, body, auth = true, extra = {}) {
    return this.request(endpoint, { method: "PATCH", body, auth, ...extra });
  }

  delete(endpoint, auth = true, extra = {}) {
    return this.request(endpoint, { method: "DELETE", auth, ...extra });
  }
};
