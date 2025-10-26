// js/auth.js
class AuthManager {
  constructor() {
    this.currentUser = null;
    this.init();
  }

  init() {
    console.log("AuthManager 초기화 시작");

    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    console.log("저장된 토큰:", token ? "있음" : "없음");
    console.log("저장된 사용자 정보:", savedUser);

    if (savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser);
        console.log("사용자 정보 로드 성공:", this.currentUser);
      } catch (error) {
        console.error("사용자 정보 파싱 오류:", error);
        localStorage.removeItem("user");
      }
    }

    if (token && !this.currentUser) {
      console.log("토큰은 있지만 사용자 정보 없음, 갱신 시도");
      this.refreshUserInfo();
    }

    console.log("로그인 상태:", this.isLoggedIn());
  }

  getToken() {
    return localStorage.getItem("token");
  }

  setToken(token) {
    localStorage.setItem("token", token);
  }

  setUser(user) {
    this.currentUser = user;
    localStorage.setItem("user", JSON.stringify(user));
  }

  isLoggedIn() {
    return !!this.getToken() && !!this.currentUser;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  async login(email, password) {
    try {
      console.log("로그인 시도:", email);
      const response = await api.login(email, password);
      console.log("로그인 응답:", response);

      if (response.accessToken) {
        this.setToken(response.accessToken);
        console.log("토큰 저장 완료");
      }

      if (response.refreshToken) {
        localStorage.setItem("refreshToken", response.refreshToken);
        console.log("refreshToken 저장 완료");
      }

      const userInfo = {
        userId: response.userId,
        email: response.email,
        nickname: response.nickname,
        profileImageUrl: response.profileImageUrl,
      };

      this.setUser(userInfo);
      console.log("사용자 정보 저장 완료:", userInfo);
      console.log("localStorage 확인:", {
        token: localStorage.getItem("token"),
        user: localStorage.getItem("user"),
      });

      this.updateUI();
      console.log("UI 업데이트 완료");

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
      await api.signup(email, password, nickname, profileImageUrl);
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
      await api.logout();
    } catch (error) {
      console.error("로그아웃 요청 실패:", error);
    }

    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("profileImageUrl");
    this.currentUser = null;

    // ✅ 절대 경로로 변경
    window.location.href = "/";

    showSuccess("로그아웃 되었습니다.");
  }

  async refreshUserInfo() {
    try {
      const user = await api.getUserProfile();
      this.setUser(user);
      return true;
    } catch (error) {
      console.error("사용자 정보 갱신 실패:", error);
      if (error.status === 401 || error.status === 403) {
        this.logout();
      }
      return false;
    }
  }


  updateUI() {
    const authNav = document.getElementById("authNav");
    if (!authNav) return;

    if (this.isLoggedIn()) {
      const user = this.getCurrentUser();
      const nickname = user.nickname;

  
      const hasProfileImage =
        user.profileImageUrl && user.profileImageUrl.trim() !== "";

      authNav.innerHTML = `
            <div class="profile-container">
                <button class="profile-btn">
                    ${
                      hasProfileImage
                        ? `<img src="${user.profileImageUrl}" alt="${nickname}" class="profile-image">`
                        : `<div class="profile-image-default">👤</div>`
                    }
                </button>
                <div class="profile-dropdown">
                    <div class="dropdown-header">
                        <div class="dropdown-user-info">
                            ${
                              hasProfileImage
                                ? `<img src="${user.profileImageUrl}" alt="${nickname}" class="dropdown-profile-image">`
                                : `<div class="dropdown-profile-default">👤</div>`
                            }
                            <div class="dropdown-user-name">${nickname}</div>
                        </div>
                    </div>
                    <div class="dropdown-divider"></div>
                    <ul class="dropdown-menu">
                        <li>
                            <a href="../pages/user-edit.html" class="dropdown-item">
                                회원정보 수정
                            </a>
                        </li>
                        <li>
                            <a href="../pages/pw-edit.html" class="dropdown-item">
                                비밀번호 수정
                            </a>
                        </li>
                        <li>
                            <a href="#" class="dropdown-item" onclick="authManager.logout(); return false;">
                                로그아웃
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        `;
    } else {
      authNav.innerHTML = `
            <a href="/login" class="btn btn-primary btn-login">로그인</a>
        `;
    }
  }

  checkAuth(callback) {
    if (!this.isLoggedIn()) {
      showError("로그인이 필요합니다.");

      // ✅ 절대 경로로 변경
      window.location.href = "/login";
      return false;
    }
    if (callback) callback();
    return true;
  }
}

const authManager = new AuthManager();
