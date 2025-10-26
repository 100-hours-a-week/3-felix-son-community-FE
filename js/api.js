// API 기본 설정
const API_BASE_URL = "http://localhost:8080/api";

// API 호출 유틸리티 클래스
class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  // 토큰 가져오기
  getToken() {
    return localStorage.getItem("token");
  }

  // 헤더 생성
  getHeaders(includeAuth = true) {
    const headers = {
      "Content-Type": "application/json",
    };

    if (includeAuth) {
      const token = this.getToken();
      console.log("getHeaders - 토큰 확인:", token ? "있음" : "없음");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
        console.log(
          "Authorization 헤더 추가:",
          `Bearer ${token.substring(0, 20)}...`
        );
      } else {
        console.warn("토큰이 없습니다!");
      }
    }

    console.log("최종 헤더:", headers);
    return headers;
  }

  // 공통 fetch 메서드
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(options.auth !== false),
        ...options.headers,
      },
    };

    // ✅ body가 이미 string이면 그대로, 아니면 stringify
    if (config.body && typeof config.body !== "string") {
      config.body = JSON.stringify(config.body);
    }

    console.log("API 요청:", {
      url,
      method: config.method || "GET",
      headers: config.headers,
      body: options.body,
    });

    try {
      const response = await fetch(url, config);

      console.log("API 응답 상태:", response.status);

      // 응답이 JSON이 아닐 수 있으므로 확인
      const contentType = response.headers.get("content-type");
      let data;

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        // 에러 상세 정보 로깅
        console.error("API 에러 상세:", {
          status: response.status,
          url: url,
          data: data,
        });

        throw {
          status: response.status,
          message: data?.message || data || "요청 실패",
          data: data,
        };
      }

      return data;
    } catch (error) {
      console.error("API 요청 오류:", {
        endpoint: endpoint,
        error: error,
      });
      throw error;
    }
  }

  // GET 요청
  async get(endpoint, auth = true) {
    return this.request(endpoint, {
      method: "GET",
      auth: auth,
    });
  }

  // POST 요청
  async post(endpoint, data, auth = true) {
    return this.request(endpoint, {
      method: "POST",
      body: data,
      auth: auth,
    });
  }

  // PUT 요청
  async put(endpoint, data, auth = true) {
    return this.request(endpoint, {
      method: "PUT",
      body: data,
      auth: auth,
    });
  }

  // PATCH 요청
  async patch(endpoint, data, auth = true) {
    return this.request(endpoint, {
      method: "PATCH",
      body: data,
      auth: auth,
    });
  }

  // DELETE 요청
  async delete(endpoint, auth = true) {
    return this.request(endpoint, {
      method: "DELETE",
      auth: auth,
    });
  }

  // 인증 관련 API
  async login(email, password) {
    return this.post("/auth/login", { email, password }, { auth: false });
  }

  async signup(email, password, nickname, profileImageUrl) {
    return this.post(
      "/auth/signup",
      { email, password, nickname, profileImageUrl },
      { auth: false }
    );
  }

  async logout() {
    // 서버에 로그아웃 요청이 필요한 경우
    try {
      await this.post("/auth/logout");
    } catch (error) {
      console.error("로그아웃 요청 실패:", error);
    }
    // 로컬 토큰 삭제
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  }

  async getCurrentUser() {
    return this.get("/auth/me");
  }

  // 게시글 관련 API
  async getPosts(page = 0, size = 10) {
    return this.get(`/posts?page=${page}&size=${size}`);
  }

  async getPost(postId) {
    return this.get(`/posts/${postId}`);
  }

  async createPost(title, body, imageUrls = []) {
    console.log("createPost 호출:", { title, body, imageUrls });
    console.log("현재 저장된 토큰:", this.getToken() ? "있음" : "없음");
    return this.post(`/posts`, { title, body, imageUrls });
  }

  async updatePost(postId, title, body, imageUrls = []) {
    return this.put(`/posts/${postId}`, { title, body, imageUrls });
  }

  async deletePost(postId) {
    return this.delete(`/posts/${postId}`);
  }

  async likePost(postId) {
    return this.post(`/posts/${postId}/like`);
  }

  // 댓글 관련 API
  async getComments(postId) {
    return this.get(`/comments/post/${postId}`);
  }

  async createComment(postId, body) {
    return this.post(`/comments/post/${postId}`, { body });
  }

  // 댓글 수정
  async updateComment(commentId, body) {
    return this.put(`/comments/${commentId}`, { body });
  }

  async deleteComment(commentId) {
    return this.delete(`/comments/${commentId}`);
  }

  //사용자 정보 조회
  async getUserProfile() {
    return this.get(`/users/me`);
  }

  /**
   * 사용자 정보 수정
   */
  async updateUserProfile(nickname, profileImageUrl = null) {
    const data = { nickname };

    // ✅ 프로필 이미지가 있으면 추가
    if (profileImageUrl) {
      data.profileImageUrl = profileImageUrl;
    }

    console.log("API 요청 데이터:", data);

    return this.patch("/users/me", data);
  }

  // 회원임시탈퇴
  async deleteAccount() {
    return this.patch(`/users/me/deactivate`);
  }

  /**
   * 비밀번호 변경 (PATCH 방식)
   * @param {string} newPassword - 새 비밀번호
   * @param {string} confirmPassword - 새 비밀번호 확인
   */
  async changePassword(newPassword, confirmPassword) {
    return this.patch(`/users/me/password`, {
      newPassword,
      confirmPassword,
    });
  }

  /**
   * 이미지 업로드 (multipart/form-data)
   * @param {Array<File>} files - 업로드할 파일 배열
   * @returns {Promise<{urls: string[]}>} - 업로드된 이미지 URL 목록
   */
  async uploadImages(files) {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    const url = `${this.baseUrl}/images`;
    const token = this.getToken();

    console.log('이미지 업로드 요청:', {
      url,
      fileCount: files.length,
      token: token ? '있음' : '없음'
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Content-Type은 설정하지 않음 (브라우저가 자동으로 multipart/form-data 설정)
        },
        body: formData
      });

      console.log('이미지 업로드 응답 상태:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('이미지 업로드 실패:', {
          status: response.status,
          error: errorData
        });
        throw {
          status: response.status,
          message: errorData?.message || '이미지 업로드에 실패했습니다.',
          data: errorData
        };
      }

      const data = await response.json();
      console.log('이미지 업로드 성공:', data);
      return data;
    } catch (error) {
      console.error('이미지 업로드 오류:', error);
      throw error;
    }
  }

}

// 전역 API 인스턴스 생성
const api = new ApiService();

// 에러 메시지 표시 유틸리티
function showError(message) {
  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message";
  errorDiv.textContent = message;

  const container = document.querySelector(".container");
  if (container) {
    container.insertBefore(errorDiv, container.firstChild);
    setTimeout(() => errorDiv.remove(), 5000);
  } else {
    alert(message);
  }
}

// 성공 메시지 표시 유틸리티
function showSuccess(message) {
  const successDiv = document.createElement("div");
  successDiv.className = "success-message";
  successDiv.textContent = message;

  const container = document.querySelector(".container");
  if (container) {
    container.insertBefore(successDiv, container.firstChild);
    setTimeout(() => successDiv.remove(), 3000);
  }
}