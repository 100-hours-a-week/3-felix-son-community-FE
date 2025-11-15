window.FileUploadService = class {
  constructor() {
    this.apiService = window.apiService;

    // API Gateway 엔드포인트
    this.apiGatewayUrl =
      "https://j9cutt34d2.execute-api.ap-northeast-2.amazonaws.com/presign";

    console.log("FileUpload - API Gateway URL:", this.apiGatewayUrl);
  }

  window.FileUploadService = class {
  constructor() {
    this.apiService = window.apiService;
    this.apiGatewayUrl = "https://j9cutt34d2.execute-api.ap-northeast-2.amazonaws.com/presign";
    console.log("FileUpload - API Gateway URL:", this.apiGatewayUrl);
  }

  /**
   * Presigned URL 받기 (조건부 인증)
   */
  async getPresignedUrl(file, requireAuth = true) {
    console.log('🔑 Presigned URL 요청 중...');
    
    const headers = {
      'Content-Type': 'application/json'
    };
    
    // ✅ requireAuth가 true일 때만 토큰 추가
    if (requireAuth) {
      const token = sessionStorage.getItem("token");
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('🔐 인증 토큰 포함');
      }
    } else {
      console.log('🔓 인증 없이 요청 (회원가입 등)');
    }
    
    const response = await fetch(this.apiGatewayUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        fileName: file.name,
        contentType: file.type
      })
    });

    if (!response.ok) {
      let errorData = {};
      try {
        errorData = await response.json();
      } catch (e) {
        console.error('에러 파싱 실패:', e);
      }
      throw new Error(errorData.error || errorData.message || 'Presigned URL 생성 실패');
    }

    return await response.json();
  }

  /**
   * 이미지 업로드 (조건부 인증)
   */
  async uploadImages(files, requireAuth = true) {
    const uploadResults = [];

    for (const file of files) {
      try {
        console.log('📤 업로드 시작:', file.name, file.size, 'bytes');
        
        // ✅ requireAuth 전달
        const presignData = await this.getPresignedUrl(file, requireAuth);
        console.log('✅ Presigned URL 받음');

        await this.uploadToS3(presignData.uploadUrl, file);
        console.log('✅ S3 업로드 완료');

        uploadResults.push(presignData.imageUrls.large);
        
        console.log('🎉 업로드 완료:', presignData.fileName);

      } catch (error) {
        console.error('❌ 업로드 에러:', error);
        alert(`이미지 업로드 실패: ${error.message || '알 수 없는 오류'}`);
        throw error;
      }
    }

    return { urls: uploadResults };
  }

  async uploadToS3(presignedUrl, file) {
    console.log('☁️ S3 업로드 중...');
    
    const response = await fetch(presignedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type
      },
      body: file
    });

    if (!response.ok) {
      throw new Error(`S3 업로드 실패: ${response.status} ${response.statusText}`);
    }

    return response;
  }
};

  /**
   * 기존 방식 (Backend 직접 업로드 - 로컬 개발용)
   * ApiService 활용 ✅
   */
  async uploadImagesLegacy(files) {
    const formData = new FormData();
    files.forEach((f) => formData.append("images", f));

    try {
      const data = await this.apiService.request("/images", {
        method: "POST",
        body: formData,
        contentType: null, // FormData는 contentType 자동 설정
        auth: true,
      });

      console.log("이미지 업로드 성공:", data);
      return data;
    } catch (error) {
      console.error("이미지 업로드 실패:", error);
      throw error;
    }
  }
};
