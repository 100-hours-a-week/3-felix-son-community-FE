window.FileUploadService = class {
  constructor() {
    this.apiService = window.apiService;
    
    // 환경별 자동 감지
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const defaultUrl = isLocal 
      ? 'http://localhost:8080/api'
      : `/api`;
    
    this.baseUrl = this.apiService?.baseUrl || defaultUrl;
    console.log("FileUpload Base URL:", this.baseUrl);
  }

  async uploadImages(files) {
    const formData = new FormData();
    files.forEach(f => formData.append("images", f));
    const token = this.apiService.getToken();
    const url = `${this.baseUrl}/images`;

    let response = await fetch(url, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` },
      body: formData,
      credentials: "include",
    });

    if (response.status === 401 && typeof authManager !== "undefined") {
      const refreshed = await authManager.refreshAccessToken();
      if (refreshed) {
        const newToken = this.apiService.getToken();
        response = await fetch(url, {
          method: "POST",
          headers: { "Authorization": `Bearer ${newToken}` },
          body: formData,
          credentials: "include",
        });
      }
    }

    if (!response.ok) {
      let errorData = {};
      try {
        errorData = await response.json();
      } catch {}
      throw {
        status: response.status,
        message: errorData?.message || "이미지 업로드에 실패했습니다.",
        data: errorData,
      };
    }

    const data = await response.json();
    console.log("이미지 업로드 성공:", data);
    return data;
  }
};