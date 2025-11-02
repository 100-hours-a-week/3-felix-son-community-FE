// js/auth.js
class AuthManager {
  constructor() {
    this.currentUser = null;
    this.initPromise = null;
    this.setupGlobalErrorHandler();
  }

  /**
   * AuthManager 초기화
   * 페이지 로드 시 세션 확인 및 사용자 정보 로드
   */
  async init() {
    // ✅ 중복 초기화 방지
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      console.log("AuthManager 초기화 시작");
      
      try {
        // ✅ 서버에 세션 확인 요청
        await this.refreshUserInfo();
        console.log("로그인 상태:", this.isLoggedIn());
      } catch (error) {
        console.error("초기화 실패:", error);
      }
    })();

    return this.initPromise;
  }

  /**
   * 전역 에러 핸들러 설정
   * 세션 만료 이벤트를 감지하여 자동 처리
   */
  setupGlobalErrorHandler() {
    // ✅ api.js에서 발생시킨 세션 만료 이벤트 처리
    window.addEventListener('sessionExpired', () => {
      this.handleSessionExpired();
    });
  }

  /**
   * 세션 만료 처리
   * 로그인 페이지로 리다이렉트 및 사용자에게 알림
   */
  handleSessionExpired() {
    if (this.currentUser) {
      console.log("세션 만료 감지 - 로그아웃 처리");
      this.currentUser = null;
      this.updateUI();
      
      // 로그인 페이지가 아닌 경우에만 리다이렉트
      if (!window.location.pathname.includes('/login') && 
          !window.location.pathname.includes('/register')) {
        showError("세션이 만료되었습니다. 다시 로그인해주세요.");
        
        setTimeout(() => {
          const currentPath = window.location.pathname + window.location.search;
          window.location.href = `/login?returnUrl=${encodeURIComponent(currentPath)}`;
        }, 1500);
      }
    }
  }

  /**
   * 사용자 정보 설정
   * @param {Object} user - 사용자 정보 객체
   */
  setUser(user) {
    this.currentUser = user;
  }

  /**
   * 로그인 상태 확인
   * @returns {boolean} 로그인 여부
   */
  isLoggedIn() {
    return !!this.currentUser;
  }

  /**
   * 현재 로그인한 사용자 정보 반환
   * @returns {Object|null} 사용자 정보
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * 로그인
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<boolean>} 로그인 성공 여부
   */
  async login(email, password) {
    try {
      console.log("로그인 시도:", email);
      const response = await api.login(email, password);
      console.log("로그인 응답:", response);

      // ✅ 세션 쿠키는 서버가 자동으로 설정
      // ✅ 사용자 정보는 메모리에만 저장
      if (response.userId) {
        const userInfo = {
          userId: response.userId,
          email: response.email,
          nickname: response.nickname,
          profileImageUrl: response.profileImageUrl,
        };
        this.setUser(userInfo);
        console.log("사용자 정보 메모리 저장 완료:", userInfo);
      } else {
        // 응답에 사용자 정보가 없으면 다시 요청
        await this.refreshUserInfo();
      }

      this.updateUI();
      showSuccess("로그인 성공!");
      return true;
    } catch (error) {
      console.error("로그인 실패:", error);
      showError(error.message || "로그인에 실패했습니다.");
      return false;
    }
  }

  /**
   * 회원가입
   * @param {string} email 
   * @param {string} password 
   * @param {string} nickname 
   * @param {string|null} profileImageUrl 
   * @returns {Promise<boolean>} 회원가입 성공 여부
   */
  async signup(email, password, nickname, profileImageUrl = null) {
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

  /**
   * 로그아웃
   * 서버 세션 무효화 및 로그인 페이지로 리다이렉트
   */
  async logout() {
    try {
      console.log("로그아웃 시작");
      
      // ✅ 1. 메모리 정리
      this.currentUser = null;
      this.updateUI();
      
      // ✅ 2. 서버에 로그아웃 요청 (세션 무효화)
      await api.logout();
      
      console.log("로그아웃 성공");
    } catch (error) {
      console.error("로그아웃 요청 실패:", error);
      // 에러가 나도 진행 (이미 메모리는 정리됨)
    } finally {
      // ✅ 3. 로그인 페이지로 이동
      showSuccess("로그아웃 되었습니다.");
      
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
    }
  }

  /**
   * 사용자 정보 갱신
   * 서버에서 세션 확인 및 최신 사용자 정보 가져오기
   * @returns {Promise<boolean>} 갱신 성공 여부
   */
  async refreshUserInfo() {
    try {
      const user = await api.getCurrentUser();
      this.setUser(user);
      this.updateUI();
      console.log("사용자 정보 갱신 성공:", user);
      return true;
    } catch (error) {
      console.error("사용자 정보 갱신 실패:", error);
      
      // ✅ 인증 에러 vs 네트워크 에러 구분
      if (error.status === 401 || error.status === 403) {
        console.log("세션 없음 또는 만료됨");
        this.currentUser = null;
        this.updateUI();
      } else if (error.status >= 500) {
        console.error("서버 에러 - 현재 상태 유지");
        // 서버 에러는 현재 상태 유지
      } else {
        console.error("알 수 없는 에러:", error);
      }
      
      return false;
    }
  }

  /**
   * UI 업데이트
   * 로그인 상태에 따라 네비게이션 UI 렌더링
   */
  updateUI() {
    const authNav = document.getElementById("authNav");
    
    if (!authNav) {
      console.log("authNav 요소를 찾을 수 없습니다.");
      return;
    }

    if (this.isLoggedIn()) {
      const user = this.getCurrentUser();
      const nickname = user.nickname || '사용자';
      const hasProfileImage = user.profileImageUrl && user.profileImageUrl.trim() !== "";
      
      // ✅ XSS 방지를 위한 텍스트 이스케이프
      const safeNickname = this.escapeHtml(nickname);
      const safeProfileImageUrl = hasProfileImage ? this.escapeHtml(user.profileImageUrl) : '';

      authNav.innerHTML = `
        <div class="profile-container">
          <button class="profile-btn" aria-label="프로필 메뉴">
            ${
              hasProfileImage
                ? `<img src="${safeProfileImageUrl}" alt="${safeNickname}" class="profile-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                   <div class="profile-image-default" style="display:none;">👤</div>`
                : `<div class="profile-image-default">👤</div>`
            }
          </button>
          <div class="profile-dropdown">
            <div class="dropdown-header">
              <div class="dropdown-user-info">
                ${
                  hasProfileImage
                    ? `<img src="${safeProfileImageUrl}" alt="${safeNickname}" class="dropdown-profile-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                       <div class="dropdown-profile-default" style="display:none;">👤</div>`
                    : `<div class="dropdown-profile-default">👤</div>`
                }
                <div class="dropdown-user-name">${safeNickname}</div>
              </div>
            </div>
            <div class="dropdown-divider"></div>
            <ul class="dropdown-menu">
              <li>
                <a href="/pages/user-edit.html" class="dropdown-item">
                  <span class="dropdown-icon">👤</span>
                  회원정보 수정
                </a>
              </li>
              <li>
                <a href="/pages/pw-edit.html" class="dropdown-item">
                  <span class="dropdown-icon">🔒</span>
                  비밀번호 수정
                </a>
              </li>
              <li>
                <a href="#" class="dropdown-item logout-btn" data-action="logout">
                  <span class="dropdown-icon">🚪</span>
                  로그아웃
                </a>
              </li>
            </ul>
          </div>
        </div>
      `;

      // ✅ 이벤트 리스너 등록
      this.attachDropdownEvents();
      
    } else {
      // ✅ 로그아웃 상태
      authNav.innerHTML = `
        <a href="/login" class="btn btn-primary btn-login">로그인</a>
      `;
    }
  }

  /**
   * HTML 이스케이프 (XSS 방지)
   * @param {string} text 
   * @returns {string} 이스케이프된 텍스트
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * 드롭다운 이벤트 리스너 등록
   */
  attachDropdownEvents() {
    const profileBtn = document.querySelector('.profile-btn');
    const dropdown = document.querySelector('.profile-dropdown');
    const logoutBtn = document.querySelector('.logout-btn');

    if (!profileBtn || !dropdown) return;

    // 프로필 버튼 클릭 시 드롭다운 토글
    profileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('show');
    });

    // 로그아웃 버튼 클릭
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (confirm('로그아웃 하시겠습니까?')) {
          await this.logout();
        }
      });
    }

    // 드롭다운 외부 클릭 시 닫기
    const closeDropdown = (e) => {
      if (!profileBtn.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove('show');
      }
    };
    document.addEventListener('click', closeDropdown);

    // ESC 키로 드롭다운 닫기
    const handleEscape = (e) => {
      if (e.key === 'Escape' && dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
        profileBtn.focus();
      }
    };
    document.addEventListener('keydown', handleEscape);
  }

  /**
   * 인증 확인
   * 로그인이 필요한 페이지에서 사용
   * @param {Function} callback - 인증 성공 시 실행할 콜백
   * @returns {Promise<boolean>} 인증 여부
   */
  async checkAuth(callback) {
    // ✅ 초기화 완료 대기
    await this.init();
    
    if (!this.isLoggedIn()) {
      showError("로그인이 필요합니다.");
      
      // ✅ 현재 페이지를 returnUrl로 저장
      const currentPath = window.location.pathname + window.location.search;
      const loginUrl = `/login?returnUrl=${encodeURIComponent(currentPath)}`;
      
      setTimeout(() => {
        window.location.href = loginUrl;
      }, 1000);
      
      return false;
    }
    
    if (callback) {
      await callback();
    }
    
    return true;
  }
}

// ✅ 전역 인스턴스 생성
const authManager = new AuthManager();

// ✅ 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', async () => {
  await authManager.init();
  console.log('AuthManager 초기화 완료');
});