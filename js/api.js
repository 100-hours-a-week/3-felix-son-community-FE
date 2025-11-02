// API 기본 설정
const API_BASE_URL = "http://localhost:8080/api";

// API 호출 유틸리티 클래스
class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  // 헤더 생성 - 세션 방식에서는 Authorization 불필요
  getHeaders() {
    return {
      "Content-Type": "application/json",
    };
  }

  // 공통 fetch 메서드
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      ...options,
      credentials: 'include',
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    if (config.body && typeof config.body !== "string") {
      config.body = JSON.stringify(config.body);
    }

    console.log("API 요청:", {
      url,
      method: config.method || "GET",
      headers: config.headers,
      credentials: config.credentials,
      body: options.body,
    });

    try {
      const response = await fetch(url, config);

      console.log("API 응답 상태:", response.status);

      if (response.status === 401) {
        console.warn("세션 만료 또는 인증 실패");
        
        if (!window.location.pathname.includes('/login') && 
            !window.location.pathname.includes('/register')) {
          window.dispatchEvent(new CustomEvent('sessionExpired'));
        }
      }

      const contentType = response.headers.get("content-type");
      let data;

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
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
  async get(endpoint) {
    return this.request(endpoint, {
      method: "GET",
    });
  }

  // POST 요청
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: "POST",
      body: data,
    });
  }

  // PUT 요청
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: "PUT",
      body: data,
    });
  }

  // PATCH 요청
  async patch(endpoint, data) {
    return this.request(endpoint, {
      method: "PATCH",
      body: data,
    });
  }

  // DELETE 요청
  async delete(endpoint) {
    return this.request(endpoint, {
      method: "DELETE",
    });
  }

  // ============================================
  // 인증 관련 API
  // ============================================

  async login(email, password) {
    return this.post("/auth/login", { email, password });
  }

  async signup(email, password, nickname, profileImageUrl = null) {
    const data = { email, password, nickname };
    
    if (profileImageUrl) {
      data.profileImageUrl = profileImageUrl;
    }
    
    return this.post("/auth/signup", data);
  }

  async logout() {
    return this.post("/auth/logout", {});
  }

  async getCurrentUser() {
    return this.get("/users/me");
  }

  // ============================================
  // 게시글 관련 API
  // ============================================

  async getPosts(page = 0, size = 10) {
    return this.get(`/posts?page=${page}&size=${size}`);
  }

  async getPost(postId) {
    return this.get(`/posts/${postId}`);
  }

  async createPost(title, body, imageUrls = []) {
    console.log("createPost 호출:", { title, body, imageUrls });
    return this.post(`/posts`, { title, body, imageUrls });
  }

  async updatePost(postId, title, body, imageUrls = []) {
    return this.put(`/posts/${postId}`, { title, body, imageUrls });
  }

  async deletePost(postId) {
    return this.delete(`/posts/${postId}`);
  }

  async likePost(postId) {
    return this.post(`/posts/${postId}/like`, {});
  }

  // ============================================
  // 댓글 관련 API
  // ============================================

  async getComments(postId) {
    return this.get(`/comments/post/${postId}`);
  }

  async createComment(postId, body) {
    return this.post(`/comments/post/${postId}`, { body });
  }

  async updateComment(commentId, body) {
    return this.put(`/comments/${commentId}`, { body });
  }

  async deleteComment(commentId) {
    return this.delete(`/comments/${commentId}`);
  }

  // ============================================
  // 사용자 정보 관련 API
  // ============================================

  async getUserProfile() {
    return this.get(`/users/me`);
  }

  async updateUserProfile(nickname, profileImageFile = null) {
    try {
      let profileImageUrl = null;
      
      if (profileImageFile) {
        console.log('프로필 이미지 업로드 시작:', {
          fileName: profileImageFile.name,
          fileSize: `${(profileImageFile.size / 1024).toFixed(2)} KB`,
          fileType: profileImageFile.type
        });
        
        const uploadResponse = await this.uploadImages([profileImageFile]);
        profileImageUrl = uploadResponse.urls[0];
        
        console.log('프로필 이미지 업로드 완료:', profileImageUrl);
      }
      
      const data = { nickname };
      
      if (profileImageUrl) {
        data.profileImageUrl = profileImageUrl;
      }

      console.log("프로필 업데이트 요청 데이터:", data);

      return this.patch("/users/me", data);
    } catch (error) {
      console.error('프로필 업데이트 실패:', error);
      throw error;
    }
  }

  async deleteAccount() {
    return this.patch(`/users/me/deactivate`, {});
  }

  async changePassword(newPassword, confirmPassword) {
    return this.patch(`/users/me/password`, {
      newPassword,
      confirmPassword,
    });
  }

  // ============================================
  // 이미지 업로드
  // ============================================

  async uploadImages(files) {
    if (!files || files.length === 0) {
      throw {
        status: 400,
        message: '업로드할 파일을 선택해주세요.'
      };
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    for (const file of files) {
      if (file.size > maxSize) {
        throw {
          status: 400,
          message: `파일 크기는 5MB를 초과할 수 없습니다. (${file.name})`
        };
      }

      if (!allowedTypes.includes(file.type)) {
        throw {
          status: 400,
          message: `지원하지 않는 파일 형식입니다. (${file.name})`
        };
      }
    }

    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    const url = `${this.baseUrl}/images`;

    console.log('이미지 업로드 요청:', {
      url,
      fileCount: files.length,
      files: files.map(f => ({ name: f.name, size: f.size, type: f.type }))
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      console.log('이미지 업로드 응답 상태:', response.status);

      if (response.status === 401) {
        window.dispatchEvent(new CustomEvent('sessionExpired'));
      }

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

// ============================================
// 유틸리티 함수
// ============================================

function showError(message) {
  const existingError = document.querySelector('.error-message');
  if (existingError) {
    existingError.remove();
  }

  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message";
  errorDiv.textContent = message;

  const container = document.querySelector(".container") || document.body;
  
  if (container === document.body) {
    errorDiv.style.position = 'fixed';
    errorDiv.style.top = '20px';
    errorDiv.style.left = '50%';
    errorDiv.style.transform = 'translateX(-50%)';
    errorDiv.style.zIndex = '9999';
    errorDiv.style.maxWidth = '80%';
  }
  
  container.insertBefore(errorDiv, container.firstChild);
  
  setTimeout(() => {
    errorDiv.style.opacity = '0';
    setTimeout(() => errorDiv.remove(), 300);
  }, 5000);
}

function showSuccess(message) {
  const existingSuccess = document.querySelector('.success-message');
  if (existingSuccess) {
    existingSuccess.remove();
  }

  const successDiv = document.createElement("div");
  successDiv.className = "success-message";
  successDiv.textContent = message;

  const container = document.querySelector(".container") || document.body;
  
  if (container === document.body) {
    successDiv.style.position = 'fixed';
    successDiv.style.top = '20px';
    successDiv.style.left = '50%';
    successDiv.style.transform = 'translateX(-50%)';
    successDiv.style.zIndex = '9999';
    successDiv.style.maxWidth = '80%';
  }
  
  container.insertBefore(successDiv, container.firstChild);
  
  setTimeout(() => {
    successDiv.style.opacity = '0';
    setTimeout(() => successDiv.remove(), 300);
  }, 3000);
}