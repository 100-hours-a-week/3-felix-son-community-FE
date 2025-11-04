window.UserService = class {
  constructor(apiService, fileUploadService) {
    this.apiService = window.apiService;
    this.fileUploadService = window.fileUploadService;
  }

  getUserProfile() {
    return this.apiService.get("/users/me");
  }

  async updateUserProfile(nickname, profileImageFile = null) {
    let profileImageUrl = null;
    if (profileImageFile) {
      const uploadResponse = await this.fileUploadService.uploadImages([profileImageFile]);
      profileImageUrl = uploadResponse.urls[0];
    }
    const data = { nickname };
    if (profileImageUrl) data.profileImageUrl = profileImageUrl;
    return this.apiService.patch("/users/me", data);
  }

  deleteAccount() {
    return this.apiService.patch("/users/me/deactivate");
  }

  changePassword(newPassword, confirmPassword) {
    return this.apiService.patch("/users/me/password", { newPassword, confirmPassword });
  }
};


