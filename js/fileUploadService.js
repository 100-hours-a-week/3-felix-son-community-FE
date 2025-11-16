window.FileUploadService = class {
  constructor() {
    this.apiService = window.apiService;
    this.apiGatewayUrl = "https://j9cutt34d2.execute-api.ap-northeast-2.amazonaws.com/presign";
    console.log("FileUpload - API Gateway URL:", this.apiGatewayUrl);
  }

  getToken() {
    return sessionStorage.getItem("token");
  }

  /**
   * Presigned URL 받기
   */
  async getPresignedUrl(file, requireAuth = true) {
    console.log('🔑 Presigned URL 요청 중...');
    
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (requireAuth) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('🔐 인증 토큰 포함');
      }
    } else {
      console.log('🔓 인증 없이 요청 (회원가입)');
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
   * 이미지 업로드
   */
  async uploadImages(files, requireAuth = true) {
    const uploadResults = [];

    for (const file of files) {
      try {
        console.log('📤 업로드 시작:', file.name, file.size, 'bytes');
        
        const presignData = await this.getPresignedUrl(file, requireAuth);
        console.log('✅ Presigned Data:', presignData);

        await this.uploadToS3(presignData.uploadUrl, file);
        console.log('✅ S3 업로드 완료');

        // ✅ 인증 여부에 따라 다른 필드 사용
        let imageUrl;
        if (presignData.isAuthenticated) {
          // 인증 사용자: imageUrls.large
          imageUrl = presignData.imageUrls.large;
          console.log('🔐 인증 사용자 - large URL 사용:', imageUrl);
        } else {
          // 미인증 사용자: imageUrl (단일)
          imageUrl = presignData.imageUrl;
          console.log('🔓 미인증 사용자 - 원본 URL 사용:', imageUrl);
        }
        
        uploadResults.push(imageUrl);
        console.log('🎉 업로드 완료:', presignData.fileName);

      } catch (error) {
        console.error('❌ 업로드 에러:', error);
        alert(`이미지 업로드 실패: ${error.message || '알 수 없는 오류'}`);
        throw error;
      }
    }

    return { urls: uploadResults };
  }

  /**
   * S3 직접 업로드
   */
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