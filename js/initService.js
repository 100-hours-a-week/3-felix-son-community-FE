// 1. 서비스 인스턴스 생성
window.apiService = new window.ApiService();
window.postService = new window.PostService();
window.commentService = new window.CommentService();
window.fileUploadService = new window.FileUploadService();
window.userService = new window.UserService();
window.notificationService = new window.NotificationService();

// 2. 전역 헬퍼 함수
window.showError = (message) => window.notificationService.showError(message);
window.showSuccess = (message) => window.notificationService.showSuccess(message);

// 3. AuthManager 생성 (내부에서 AuthUiManager도 생성됨)
window.authManager = new window.AuthManager();

// 4. Layout 초기화
window.layout = new window.Layout();

console.log("✅ 모든 서비스 초기화 완료");