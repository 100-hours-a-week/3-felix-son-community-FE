window.FileUploadService = class {
  constructor() {
    this.apiService = window.apiService;
    this.apiGatewayUrl = "https://j9cutt34d2.execute-api.ap-northeast-2.amazonaws.com/presign";
    console.log("FileUpload - API Gateway URL:", this.apiGatewayUrl);
  }

  getToken() {
    return sessionStorage.getItem("token");
  }

  async getPresignedUrl(file, requireAuth = true) {
    
    const headers = {
      'Content-Type': 'application/json'
    };
    
    const requestBody = {
      fileName: file.name,
      contentType: file.type,
      fileSize: file.size 
    };
    
    if (requireAuth) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    } else {
      requestBody.purpose = 'signup'; 
    }
    
    const response = await fetch(this.apiGatewayUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBody)
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

  async uploadImages(files, requireAuth = true) {
    const uploadResults = [];

    for (const file of files) {
      try {
        
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
          throw new Error('파일 크기는 10MB 이하여야 합니다.');
        }
        
        const presignData = await this.getPresignedUrl(file, requireAuth);

        await this.uploadToS3(presignData.uploadUrl, file);

        const imageUrl = presignData.imageUrl;
        uploadResults.push(imageUrl);
        console.log('업로드 완료:', imageUrl);

      } catch (error) {
        console.error('업로드 에러:', error);
        alert(`이미지 업로드 실패: ${error.message || '알 수 없는 오류'}`);
        throw error;
      }
    }

    return { urls: uploadResults };
  }

  async uploadToS3(presignedUrl, file) {
    
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