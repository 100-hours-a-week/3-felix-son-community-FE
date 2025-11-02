window.CommentService = class {
  constructor() {
    this.apiService = window.apiService;
  }

  getComments(postId) {
    return this.apiService.get(`/comments/post/${postId}`);
  }

  createComment(postId, body) {
    return this.apiService.post(`/comments/post/${postId}`, { body });
  }

  updateComment(commentId, body) {
    return this.apiService.put(`/comments/${commentId}`, { body });
  }

  deleteComment(commentId) {
    return this.apiService.delete(`/comments/${commentId}`);
  }
};

