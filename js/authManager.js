window.AuthManager = class {
  constructor() {
    this.currentUser = this.loadUserFromStorage();
    this.apiService = window.apiService;
    this.authUiManager = new AuthUiManager(this);
    this.userInfoPromise = null;
    this.init();
  }

  init() {
    if (window.IS_DEV) {
      console.log("AuthManager 초기화 시작");
      const token = this.getToken();
      console.log(
        "저장된 토큰:",
        token ? `${token.substring(0, 20)}...` : "없음"
      );
      console.log("로그인 상태:", this.isLoggedIn());
    }
  }

  loadUserFromStorage() {
    try {
      const raw = sessionStorage.getItem("user");
      if (!raw) return null;
      const user = JSON.parse(raw);

      if (!user.userId || !user.nickname) return null;
      return user;
    } catch (e) {
      if (window.IS_DEV) {
        console.error("저장된 사용자 정보 파싱 실패:", e);
      }
      return null;
    }
  }

  saveUserToStorage(user) {
    try {
      const safeUser = {
        userId: user.userId,
        email: user.email,
        nickname: user.nickname,
        profileImageUrl: user.profileImageUrl,
      };
      sessionStorage.setItem("user", JSON.stringify(safeUser));
    } catch (e) {
      if (window.IS_DEV) {
        console.error("사용자 정보 저장 실패:", e);
      }
    }
  }

  removeUserFromStorage() {
    sessionStorage.removeItem("user");
  }

  getToken() {
    return sessionStorage.getItem("token");
  }

  setToken(token) {
    if (!token) {
      if (window.IS_DEV) {
        console.error("❌ 토큰이 null 또는 undefined입니다!");
      }
      return;
    }
    sessionStorage.setItem("token", token);
    if (window.IS_DEV) {
      console.log("✅ Access Token 저장 완료 (세션스토리지)");
    }
  }

  removeToken() {
    sessionStorage.removeItem("token");
  }

  setUser(user) {
    this.currentUser = user;
    this.saveUserToStorage(user);
    if (window.IS_DEV) {
      console.log("✅ 사용자 정보 메모리+스토리지 저장:", user.nickname);
    }
  }

  clearAuthState() {
    this.removeToken();
    this.currentUser = null;
    this.userInfoPromise = null;
    this.removeUserFromStorage();
    if (window.IS_DEV) {
      console.log("인증상태 초기화");
    }
  }

  isLoggedIn() {
    return !!this.getToken();
  }

  getCurrentUser() {
    return this.currentUser;
  }

  async ensureUserInfo() {
    if (!this.getToken()) {
      if (window.IS_DEV) {
        console.warn("토큰이 없어서 사용자 정보를 가져올 수 없습니다.");
      }
      return null;
    }

    if (this.currentUser) {
      return this.currentUser;
    }

    if (this.userInfoPromise) {
      return this.userInfoPromise;
    }

    if (window.IS_DEV) {
      console.log("🔄 사용자 정보 로딩 중...");
    }
    this.userInfoPromise = this.apiService
      .get("/users/me")
      .then((user) => {
        this.setUser(user);
        if (window.IS_DEV) {
          console.log("✅ 사용자 정보 로드 성공:", user.nickname);
        }
        return user;
      })
      .catch((error) => {
        if (window.IS_DEV) {
          console.error("❌ 사용자 정보 로드 실패:", error);
        }

        if (error.status === 401) {
          if (window.IS_DEV) {
            console.log("토큰이 유효하지 않음 - 제거");
          }
          this.clearAuthState();
        }

        return null;
      })
      .finally(() => {
        this.userInfoPromise = null;
      });

    return this.userInfoPromise;
  }

  async login(email, password) {
    try {
      if (window.IS_DEV) {
        console.log("로그인 시도:", email);
      }
      const response = await this.apiService.post(
        "/auth/login",
        { email, password },
        false,
        { credentials: "include" }
      );
      if (window.IS_DEV) {
        console.log("로그인 응답:", response);
      }

      if (response.accessToken) {
        this.setToken(response.accessToken);
        if (window.IS_DEV) {
          console.log("✅ 토큰 저장 완료");
        }
      } else {
        throw new Error("로그인 응답에 토큰이 없습니다.");
      }

      const userInfo = {
        userId: response.userId,
        email: response.email,
        nickname: response.nickname,
        profileImageUrl: response.profileImageUrl,
      };
      this.setUser(userInfo);

      this.updateUI();
      showSuccess("로그인 성공!");
      return true;
    } catch (error) {
      if (window.IS_DEV) {
        console.error("로그인 실패:", error);
      }
      showError(error.message || "로그인에 실패했습니다.");
      return false;
    }
  }

  async signup(email, password, nickname, profileImageUrl) {
    try {
      if (window.IS_DEV) {
        console.log("회원가입 시도:", email);
      }

      const response = await this.apiService.post(
        "/auth/signup",
        { email, password, nickname, profileImageUrl },
        false,
        { credentials: "include" }
      );

      if (window.IS_DEV) {
        console.log("회원가입 응답:", response);
        console.log("✅ 회원가입 성공 - 로그인 페이지로 이동합니다");
      }

      return {
        success: true,
        status: 201,
        message: "회원가입이 완료되었습니다! 로그인해주세요.",
        data: response,
      };
    } catch (error) {
      if (window.IS_DEV) {
        console.error("회원가입 실패:", error);
      }
      throw error;
    }
  }

  async logout() {
    try {
      await this.apiService.post("/auth/logout");
    } catch (error) {
      if (window.IS_DEV) {
        console.error("로그아웃 요청 실패:", error);
      }
    }

    this.clearAuthState();
    window.location.href = "/";
    showSuccess("로그아웃 되었습니다.");
  }

  async refreshAccessToken() {
    try {
      if (window.IS_DEV) {
        console.log("🔄 Access Token 갱신 시도");
      }
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        if (window.IS_DEV) {
          console.error("❌ Token refresh 실패:", response.status);
        }
        return false;
      }

      const data = await response.json();

      if (data.accessToken) {
        this.setToken(data.accessToken);
        if (window.IS_DEV) {
          console.log("✅ Access Token 갱신 성공");
        }
        return true;
      }
      return false;
    } catch (error) {
      if (window.IS_DEV) {
        console.error("❌ Access Token 갱신 실패:", error);
      }
      return false;
    }
  }

  updateUI() {
    this.authUiManager.updateUI();
  }

  checkAuth(callback) {
    if (!this.isLoggedIn()) {
      showError("로그인이 필요합니다.");
      window.location.href = "/login";
      return false;
    }
    if (callback) callback();
    return true;
  }
};
