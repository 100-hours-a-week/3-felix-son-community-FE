window.PostService = class {
  constructor() {
    this.apiService = window.apiService;
  }

  getPosts(page = 0, size = 10) {
    return this.apiService.get(`/posts?page=${page}&size=${size}`);
  }

  getPost(postId) {
    return this.apiService.get(`/posts/${postId}`);
  }

  createPost(title, body, imageUrls = []) {
    return this.apiService.post(`/posts`, { title, body, imageUrls });
  }

  updatePost(postId, title, body, imageUrls = []) {
    return this.apiService.put(`/posts/${postId}`, { title, body, imageUrls });
  }

  deletePost(postId) {
    return this.apiService.delete(`/posts/${postId}`);
  }

  likePost(postId) {
    return this.apiService.post(`/posts/${postId}/like`);
  }
};

