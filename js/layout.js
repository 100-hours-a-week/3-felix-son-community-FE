// js/layout.js - 공통 레이아웃 관리
window.Layout = class {
  static getHeaderHTML() {
    return `
      <nav class="navbar">
        <div class="container">
          <div class="nav-brand">
            <h1><a href="/">아무 말 대잔치</a></h1>
          </div>
          <ul class="nav-menu">
            <li><a href="/">홈</a></li>
            <li><a href="/posts">게시글</a></li>
            <li id="authNav">
              <!-- 로그인/프로필 영역이 동적으로 표시됩니다 -->
            </li>
          </ul>
        </div>
      </nav>
    `;
  }

  // 공통 푸터 HTML 반환
  static getFooterHTML() {
    return `
    <footer class="footer">
      <div class="container">
        <p>&copy; 2025 아무 말 대잔치. All rights reserved.</p>
        <div class="footer-links">
          <a href="http://localhost:8080/terms/service" target="_blank">이용약관</a>
          <a href="http://localhost:8080/terms/privacy" target="_blank">개인정보처리방침</a>
        </div>
      </div>
    </footer>
  `;
  }

  // 헤더 삽입
  static loadHeader() {
    const headerHTML = this.getHeaderHTML();
    const headerElement = document.querySelector("header");

    if (headerElement) {
      headerElement.innerHTML = headerHTML;
    } else {
      document.body.insertAdjacentHTML("afterbegin", headerHTML);
    }

    this.setupDropdown();
  }

  // 푸터 삽입
  static loadFooter() {
    // 인증 페이지에서는 footer 숨김
    const authPages = ["/login", "/register"];
    const currentPath = window.location.pathname;

    if (authPages.includes(currentPath)) {
      return;
    }

    const footerHTML = this.getFooterHTML();
    const footerElement = document.querySelector("footer");

    if (footerElement) {
      footerElement.innerHTML = footerHTML;
    } else {
      document.body.insertAdjacentHTML("beforeend", footerHTML);
    }
  }

  // 드롭다운 이벤트 설정
  static setupDropdown() {
    document.addEventListener("click", (e) => {
      const profileBtn = e.target.closest(".profile-btn");
      const dropdown = document.querySelector(".profile-dropdown");

      if (profileBtn && dropdown) {
        e.stopPropagation();
        dropdown.classList.toggle("show");
      } else {
        if (dropdown && dropdown.classList.contains("show")) {
          dropdown.classList.remove("show");
        }
      }
    });
  }

  static init() {
    this.loadHeader();
    this.loadFooter();
    console.log("✅ 공통 레이아웃 로드 완료");

    // ✅ authManager가 있으면 UI 업데이트
    // 약간의 지연을 주어 DOM이 완전히 준비되도록
    setTimeout(() => {
      if (typeof authManager !== "undefined") {
        authManager.updateUI();
        console.log("✅ 인증 UI 업데이트 완료");
      }
    }, 0);
  }
};

// 페이지 로드 시 자동 실행
document.addEventListener("DOMContentLoaded", () => {
  Layout.init();
});
