window.ApiService = class {
  constructor(baseUrl) {
    const isLocal =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    const defaultUrl = isLocal ? "http://localhost:8080/api" : `/api`;

    this.baseUrl = baseUrl || defaultUrl;
    if (window.IS_DEV) {
      console.log("API Base URL:", this.baseUrl);
    }
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
        if (window.IS_DEV) {
          console.log("Authorization 헤더 추가");
        }
      } else if (window.IS_DEV) {
        console.warn("토큰이 없습니다!");
      }
    }
    if (window.IS_DEV) {
      console.log("최종 헤더:", headers);
    }
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

    if (window.IS_DEV) {
      console.log("API 요청:", {
        url,
        method: config.method || "GET",
        headers: config.headers,
        body: options.body,
      });
    }

    try {
      let response = await fetch(url, config);

      if (response.status === 401) {
        if (window.IS_DEV) {
          console.log("🔒 401 에러 - Access Token 갱신 시도");
        }

        if (typeof authManager !== "undefined" && authManager.refreshAccessToken) {
          const refreshed = await authManager.refreshAccessToken();

          if (refreshed) {
            if (window.IS_DEV) {
              console.log("✅ 토큰 갱신 성공 - 재요청");
            }
            const newToken = this.getToken();
            config.headers["Authorization"] = `Bearer ${newToken}`;
            response = await fetch(url, config);
          } else {
            if (window.IS_DEV) {
              console.log("❌ Refresh Token도 만료 - 로그아웃");
            }
            this.handleUnauthorized();
            throw { status: 401, message: "로그인이 만료되었습니다. 다시 로그인해주세요." };
          }
        } else {
          this.handleUnauthorized();
          throw { status: 401, message: "인증이 필요합니다." };
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
        if (window.IS_DEV) {
          console.error("API 에러 상세:", { status: response.status, url, data });
        }
        throw {
          status: response.status,
          message: data?.message || data || "요청 실패",
          data: data,
        };
      }

      return data;
    } catch (error) {
      if (window.IS_DEV) {
        console.error("API 요청 오류:", { endpoint, error });
      }
      throw error;
    }
  }

  handleUnauthorized() {
    if (window.IS_DEV) {
      console.log("🔓 인증 완전 만료 - 로그아웃 처리");
    }

    sessionStorage.clear();

    if (typeof authManager !== "undefined") {
      authManager.clearAuthState();
    }

    if (window.headerManager) {
      window.headerManager.updateAuthUI();
    }

    if (typeof showError === "function") {
      showError("로그인이 만료되었습니다. 다시 로그인해주세요.");
    } else {
      alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
    }

    const currentPath = window.location.pathname;
    if (!currentPath.includes('/login') && !currentPath.includes('/signup')) {
      window.location.href = "/login";
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