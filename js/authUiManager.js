// authUiManager.js
window.AuthUiManager = class {
  constructor(authManager) {
    this.authManager = authManager;
  }

  updateUI() {
    const authNav = document.getElementById("authNav");
    if (!authNav) return;

    if (this.authManager.isLoggedIn()) {
      const user = this.authManager.getCurrentUser();
      
      if (user) {
        this.renderUserProfile(user);
      } else {
        this.renderLoadingProfile();
        this.loadAndRenderUserProfile();
      }
    } else {
      authNav.innerHTML = `<a href="/login" class="btn btn-primary btn-login">로그인</a>`;
    }
  }

  renderLoadingProfile() {
    const authNav = document.getElementById("authNav");
    if (!authNav) return;

    authNav.innerHTML = `
      <div class="profile-container">
        <button class="profile-btn">
          <div class="profile-image-default">👤</div>
        </button>
      </div>
    `;
  }

  async loadAndRenderUserProfile() {
    try {
      const user = await this.authManager.ensureUserInfo();
      if (user) {
        this.renderUserProfile(user);
      } else {
        const authNav = document.getElementById("authNav");
        if (authNav) {
          authNav.innerHTML = `<a href="/login" class="btn btn-primary btn-login">로그인</a>`;
        }
      }
    } catch (error) {
      console.error("사용자 정보 로드 실패:", error);
      const authNav = document.getElementById("authNav");
      if (authNav) {
        authNav.innerHTML = `<a href="/login" class="btn btn-primary btn-login">로그인</a>`;
      }
    }
  }

  renderUserProfile(user) {
    const authNav = document.getElementById("authNav");
    if (!authNav) return;

    const nickname = user.nickname;
    const hasProfileImage = user.profileImageUrl && user.profileImageUrl.trim() !== "";

    authNav.innerHTML = `
      <div class="profile-container">
        <button class="profile-btn" id="profileButton">
          ${
            hasProfileImage
              ? `<img src="${user.profileImageUrl}" alt="${nickname}" class="profile-image">`
              : `<div class="profile-image-default">👤</div>`
          }
        </button>
        <div class="profile-dropdown" id="profileDropdown">
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
            <li><a href="/pages/user-edit.html" class="dropdown-item">회원정보 수정</a></li>
            <li><a href="/pages/pw-edit.html" class="dropdown-item">비밀번호 수정</a></li>
            <li><a href="#" class="dropdown-item" onclick="authManager.logout(); return false;">로그아웃</a></li>
          </ul>
        </div>
      </div>
    `;

    // ✅ 렌더링 후 즉시 이벤트 바인딩
    this.bindDropdownEvents();
  }

  bindDropdownEvents() {
    const profileBtn = document.getElementById("profileButton");
    const dropdown = document.getElementById("profileDropdown");

    if (!profileBtn || !dropdown) {
      console.warn("프로필 버튼 또는 드롭다운을 찾을 수 없습니다.");
      return;
    }

    console.log("✅ 드롭다운 이벤트 바인딩");

    // ✅ 프로필 버튼 클릭
    profileBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log("프로필 버튼 클릭 - 드롭다운 토글");
      dropdown.classList.toggle("show");
    });

    // ✅ 문서 전체 클릭 시 드롭다운 닫기
    document.addEventListener("click", (e) => {
      if (!profileBtn.contains(e.target) && !dropdown.contains(e.target)) {
        if (dropdown.classList.contains("show")) {
          console.log("외부 클릭 - 드롭다운 닫기");
          dropdown.classList.remove("show");
        }
      }
    });
  }
};