window.FileUploadService = class {
  constructor() {
    this.apiService = window.apiService;
    
    const isLocal = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1';
    const defaultUrl = isLocal 
      ? 'http://localhost:8080/api'
      : `/api`;
    
    this.baseUrl = this.apiService?.baseUrl || defaultUrl;
    
    // ✅ API Gateway URL (실제 URL로 변경하세요)
    this.apiGatewayUrl = 'https://j9cutt34d2.execute-api.ap-northeast-2.amazonaws.com/presign';
    
    console.log("FileUpload Base URL:", this.baseUrl);
    console.log("API Gateway URL:", this.apiGatewayUrl);
  }

  // ✅ Presigned URL 요청 (JWT 토큰 포함)
  async getPresignedUrl(file) {
    console.log('🔑 Presigned URL 요청 중...');
    
    // ✅ 토큰 가져오기
    const token = this.apiService.getToken();
    
    if (!token) {
      console.error('❌ 토큰 없음 - 로그인 필요');
      throw new Error('로그인이 필요합니다.');
    }
    
    console.log('✅ 토큰 확인:', token.substring(0, 20) + '...');
    
    // ✅ Authorization 헤더에 토큰 포함
    const response = await fetch(this.apiGatewayUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`  // ✅ JWT 토큰!
      },
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
        console.error('에러 응답 파싱 실패:', e);
      }
      
      console.error('❌ Presigned URL 요청 실패:', response.status, errorData);
      
      // ✅ 401 에러 처리
      if (response.status === 401) {
        throw new Error(errorData.error || '로그인이 필요합니다. 다시 로그인해주세요.');
      }
      
      throw new Error(errorData.error || errorData.message || 'Presigned URL 생성 실패');
    }

    const data = await response.json();
    console.log('✅ Presigned URL 받음');
    
    return data;
  }

  // S3 직접 업로드
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
      console.error('❌ S3 업로드 실패:', response.status);
      throw new Error('S3 업로드 실패');
    }

    console.log('✅ S3 업로드 완료');
  }

  // 메인 업로드 함수
  async uploadImages(files) {
    if (!files || files.length === 0) {
      throw new Error('업로드할 파일이 없습니다.');
    }

    console.log('📤 업로드 시작:', files.length, '개 파일');

    const uploadResults = [];

    for (const file of files) {
      try {
        // 1. Presigned URL 요청 (JWT 인증 포함)
        const presignData = await this.getPresignedUrl(file);
        
        // 2. S3에 직접 업로드
        await this.uploadToS3(presignData.uploadUrl, file);
        
        // 3. 처리된 이미지 URL 저장
        uploadResults.push(presignData.imageUrls.large);
        
        console.log(`✅ ${file.name} 업로드 완료`);
        
      } catch (error) {
        console.error(`❌ ${file.name} 업로드 실패:`, error);
        throw error;
      }
    }

    console.log('🎉 모든 파일 업로드 완료');
    
    return {
      urls: uploadResults
    };
  }
};