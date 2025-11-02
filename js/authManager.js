window.AuthManager = class {
  constructor() {
    this.currentUser = null;
    this.apiService = window.apiService;
    this.authUiManager = new AuthUiManager(this);
    this.init();
  }

  init() {
    console.log("AuthManager 초기화 시작");

    const token = this.getToken();
    console.log("저장된 토큰:", token ? `${token.substring(0, 20)}...` : "없음");

    // ✅ init에서는 /users/me 호출하지 않음
    // 토큰만 확인하고 필요할 때 지연 로딩

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
    // ✅ 토큰만 있으면 로그인으로 간주
    return !!this.getToken();
  }

  getCurrentUser() {
    return this.currentUser;
  }

  // ✅ 사용자 정보가 필요할 때만 호출
  async ensureUserInfo() {
    if (this.currentUser) {
      return this.currentUser;
    }

    if (!this.getToken()) {
      console.warn("토큰이 없어서 사용자 정보를 가져올 수 없습니다.");
      return null;
    }

    try {
      console.log("사용자 정보 로딩 중...");
      const user = await this.apiService.get("/users/me");
      this.setUser(user);
      return user;
    } catch (error) {
      console.error("사용자 정보 로드 실패:", error);
      return null;
    }
  }

  // authManager.js
async login(email, password) {
  try {
    console.log("로그인 시도:", email);
    const response = await this.apiService.post("/auth/login", { email, password }, false);
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
    console.log("사용자 정보 저장 완료:", userInfo);

    this.updateUI();
    showSuccess("로그인 성공!");
    
    // ✅ 여기서 리다이렉트하지 않음 (login.html에서 처리)
    return true;
  } catch (error) {
    console.error("로그인 실패:", error);
    showError(error.message || "로그인에 실패했습니다.");
    return false;
  }
}

  async signup(email, password, nickname, profileImageUrl) {
    try {
      await this.apiService.post("/auth/signup", { email, password, nickname, profileImageUrl }, false);
      showSuccess("회원가입 성공! 로그인해주세요.");
      return true;
    } catch (error) {
      console.error("회원가입 실패:", error);
      showError(error.message || "회원가입에 실패했습니다.");
      return false;
    }
  }

  async logout() {
    try {
      await this.apiService.post("/auth/logout");
    } catch (error) {
      console.error("로그아웃 요청 실패:", error);
    }

    this.removeToken();
    this.currentUser = null;

    window.location.href = "/";
    showSuccess("로그아웃 되었습니다.");
  }

  async refreshUserInfo() {
    // ✅ 이 메서드는 이제 ensureUserInfo()를 사용
    return this.ensureUserInfo();
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