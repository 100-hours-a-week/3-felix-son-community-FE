window.AuthManager = class {
  constructor() {
    this.currentUser = null;
    this.apiService = window.apiService;
    this.authUiManager = new AuthUiManager(this);
    this.userInfoPromise = null;
    this.init();
  }

  init() {
    console.log("AuthManager 초기화 시작");
    const token = this.getToken();
    console.log("저장된 토큰:", token ? `${token.substring(0, 20)}...` : "없음");
    console.log("로그인 상태:", this.isLoggedIn());
  }

  getToken() {
    return sessionStorage.getItem("token");
  }

  setToken(token) {
    if (!token) {
      console.error("❌ 토큰이 null 또는 undefined입니다!");
      return;
    }
    sessionStorage.setItem("token", token);
    console.log("✅ Access Token 저장 완료 (세션스토리지)");
  }

  removeToken() {
    sessionStorage.removeItem("token");
  }

  setUser(user) {
    this.currentUser = user;
    console.log("✅ 사용자 정보 메모리 저장:", user.nickname);
  }

  isLoggedIn() {
    return !!this.getToken();
  }

  getCurrentUser() {
    return this.currentUser;
  }

  async ensureUserInfo() {
    // ✅ 토큰이 없으면 즉시 반환
    if (!this.getToken()) {
      console.warn("토큰이 없어서 사용자 정보를 가져올 수 없습니다.");
      return null;
    }

    // 이미 로드된 경우
    if (this.currentUser) {
      return this.currentUser;
    }

    // 이미 요청 중인 경우 (중복 요청 방지)
    if (this.userInfoPromise) {
      return this.userInfoPromise;
    }

    // 새로운 요청 시작
    console.log("🔄 사용자 정보 로딩 중...");
    this.userInfoPromise = this.apiService
      .get("/users/me")
      .then((user) => {
        this.setUser(user);
        console.log("✅ 사용자 정보 로드 성공:", user.nickname);
        return user;
      })
      .catch((error) => {
        console.error("❌ 사용자 정보 로드 실패:", error);
        
        // ✅ 토큰이 유효하지 않으면 제거
        if (error.status === 401) {
          console.log("토큰이 유효하지 않음 - 제거");
          this.removeToken();
          this.currentUser = null;
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
      console.log("로그인 시도:", email);
      const response = await this.apiService.post(
        "/auth/login",
        { email, password },
        false,
        { credentials: "include" }
      );
      console.log("로그인 응답:", response);

      if (response.accessToken) {
        this.setToken(response.accessToken);
        console.log("✅ 토큰 저장 완료:", response.accessToken.substring(0, 20) + "...");
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
      console.error("로그인 실패:", error);
      showError(error.message || "로그인에 실패했습니다.");
      return false;
    }
  }

  async signup(email, password, nickname, profileImageUrl) {
    try {
      console.log("회원가입 시도:", email);

      const response = await this.apiService.post(
        "/auth/signup",
        { email, password, nickname, profileImageUrl },
        false,
        { credentials: "include" }
      );

      console.log("회원가입 응답:", response);

      // ✅ 토큰을 받았지만 저장하지 않음 (명시적 로그인 유도)
      console.log("✅ 회원가입 성공 - 로그인 페이지로 이동합니다");

      return {
        success: true,
        status: 201,
        message: "회원가입이 완료되었습니다! 로그인해주세요.",
        data: response,
      };
    } catch (error) {
      console.error("회원가입 실패:", error);
      throw error;
    }
  }

  async logout() {
    try {
      await this.apiService.post("/auth/logout");
    } catch (error) {
      console.error("로그아웃 요청 실패:", error);
    }

    this.clearAuthState();
    window.location.href = "/";
    showSuccess("로그아웃 되었습니다.");
  }

  // ✅ 인증 상태 초기화 메서드
  clearAuthState() {
    this.removeToken();
    this.currentUser = null;
    this.userInfoPromise = null;
    console.log("✅ 인증 상태 초기화 완료");
  }

  async refreshAccessToken() {
    try {
      console.log("🔄 Access Token 갱신 시도");
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        console.error("❌ Token refresh 실패:", response.status);
        return false;
      }

      const data = await response.json();

      if (data.accessToken) {
        this.setToken(data.accessToken);
        console.log("✅ Access Token 갱신 성공");
        return true;
      }
      return false;
    } catch (error) {
      console.error("❌ Access Token 갱신 실패:", error);
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