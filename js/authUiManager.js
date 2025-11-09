window.AuthUiManager = class {
  constructor(authManager) {
    this.authManager = authManager;
  }

  async updateUI() {
    const authNav = document.getElementById("authNav");
    if (!authNav) return;

    // ✅ 핵심: 토큰이 없으면 즉시 로그인 버튼 렌더링
    if (!this.authManager.isLoggedIn()) {
      this.renderLoginButton();
      return;
    }

    // ✅ 토큰이 있을 때만 사용자 정보 로드 시도
    const user = this.authManager.getCurrentUser();
    
    if (user) {
      this.renderUserProfile(user);
    } else {
      this.renderLoadingProfile();
      const loadedUser = await this.authManager.ensureUserInfo();
      if (loadedUser) {
        this.renderUserProfile(loadedUser);
      } else {
        // 사용자 정보 로드 실패 시 로그인 버튼 표시
        this.renderLoginButton();
      }
    }
  }

  renderLoginButton() {
    const authNav = document.getElementById("authNav");
    if (!authNav) return;
    authNav.innerHTML = `<a href="/login" class="btn btn-primary btn-login">로그인</a>`;
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

  createProfileImageHTML(user, size = 'small') {
    const nickname = user.nickname;
    const hasProfileImage = user.profileImageUrl && user.profileImageUrl.trim() !== "";
    
    if (hasProfileImage) {
      const className = size === 'small' ? 'profile-image' : 'dropdown-profile-image';
      return `<img src="${user.profileImageUrl}" alt="${nickname}" class="${className}">`;
    } else {
      const className = size === 'small' ? 'profile-image-default' : 'dropdown-profile-default';
      return `<div class="${className}">👤</div>`;
    }
  }

  renderUserProfile(user) {
    const authNav = document.getElementById("authNav");
    if (!authNav) return;

    const nickname = user.nickname;

    authNav.innerHTML = `
      <div class="profile-container">
        <button class="profile-btn" id="profileButton">
          ${this.createProfileImageHTML(user, 'small')}
        </button>
        <div class="profile-dropdown" id="profileDropdown">
          <div class="dropdown-header">
            <div class="dropdown-user-info">
              ${this.createProfileImageHTML(user, 'large')}
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

    profileBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log("프로필 버튼 클릭 - 드롭다운 토글");
      dropdown.classList.toggle("show");
    });

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