window.NotificationService = class {
  constructor() {
    // ✅ 알림 컨테이너 생성 (한 번만)
    this.createNotificationContainer();
    this.currentMessage = null; // 현재 표시 중인 메시지
    this.currentTimeout = null; // 현재 타이머
  }

  createNotificationContainer() {
    // 이미 존재하면 생성하지 않음
    if (document.getElementById('notification-container')) {
      return;
    }

    const container = document.createElement('div');
    container.id = 'notification-container';
    document.body.appendChild(container);
  }

  showError(message) {
    this.showMessage(message, "error-message", 5000);
  }

  showSuccess(message) {
    this.showMessage(message, "success-message", 3000);
  }

  showMessage(message, className, duration) {
    const container = document.getElementById('notification-container');
    
    if (!container) {
      alert(message);
      return;
    }

    // ✅ 기존 타이머 취소
    if (this.currentTimeout) {
      clearTimeout(this.currentTimeout);
      this.currentTimeout = null;
    }

    // ✅ 기존 메시지가 있으면 제거
    if (this.currentMessage) {
      this.currentMessage.remove();
      this.currentMessage = null;
    }

    // ✅ 새 메시지 요소 생성
    const messageDiv = document.createElement("div");
    messageDiv.className = `notification-message ${className}`;
    messageDiv.textContent = message;

    // ✅ 컨테이너에 추가
    container.appendChild(messageDiv);
    this.currentMessage = messageDiv;

    // ✅ 애니메이션을 위해 약간의 지연 후 show 클래스 추가
    setTimeout(() => {
      messageDiv.classList.add('show');
    }, 10);

    // ✅ 자동 제거
    this.currentTimeout = setTimeout(() => {
      messageDiv.classList.remove('show');
      setTimeout(() => {
        messageDiv.remove();
        if (this.currentMessage === messageDiv) {
          this.currentMessage = null;
        }
      }, 300); // 애니메이션 완료 후 제거
    }, duration);
  }
};