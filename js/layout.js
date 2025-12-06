// 백엔드 베이스 URL 환경별 설정
const isLocal =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

const BACKEND_BASE_URL = isLocal
  ? "http://localhost:8080"
  : "https://www.justforshare.click";

window.Layout = class {
  static getHeaderHTML() {
    return `
      <nav class="navbar">
        <div class="container">
          <div class="nav-brand">
            <h1><a href="/">Just For Share</a></h1>
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

  static getFooterHTML() {
    return `
      <footer class="footer">
        <div class="container">
          <p>&copy; 2025 Just For Share. All rights reserved.</p>
          <div class="footer-links">
            <a href="${BACKEND_BASE_URL}/terms/service" target="_blank">이용약관</a>
            <a href="${BACKEND_BASE_URL}/terms/privacy" target="_blank">개인정보처리방침</a>
          </div>
        </div>
      </footer>
    `;
  }

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

  static loadFooter() {
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
    if (typeof authManager !== "undefined") {
      authManager.updateUI();
    }
  }
};

document.addEventListener("DOMContentLoaded", () => {
  Layout.init();
});
