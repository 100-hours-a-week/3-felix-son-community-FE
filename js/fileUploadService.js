window.FileUploadService = class {
  constructor() {
    this.apiService = window.apiService;
    // 환경 변수 우선, 없으면 apiService의 baseUrl 사용, 최종 기본값
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || this.apiService?.baseUrl || "http://localhost:8080/api";
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