window.apiService = new window.ApiService();
window.postService = new window.PostService();
window.commentService = new window.CommentService();
window.fileUploadService = new window.FileUploadService();
window.userService = new window.UserService();
window.notificationService = new window.NotificationService();

window.showError = (message) => window.notificationService.showError(message);
window.showSuccess = (message) => window.notificationService.showSuccess(message);

window.authManager = new window.AuthManager();

window.layout = new window.Layout();
