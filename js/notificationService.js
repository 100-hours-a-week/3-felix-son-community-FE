window.NotificationService = class {
  constructor() {
    this.createNotificationContainer();
    this.currentMessage = null; 
    this.currentTimeout = null;
  }

  createNotificationContainer() {
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

    if (this.currentTimeout) {
      clearTimeout(this.currentTimeout);
      this.currentTimeout = null;
    }

    if (this.currentMessage) {
      this.currentMessage.remove();
      this.currentMessage = null;
    }

    const messageDiv = document.createElement("div");
    messageDiv.className = `notification-message ${className}`;
    messageDiv.textContent = message;

    container.appendChild(messageDiv);
    this.currentMessage = messageDiv;

    setTimeout(() => {
      messageDiv.classList.add('show');
    }, 10);

    this.currentTimeout = setTimeout(() => {
      messageDiv.classList.remove('show');
      setTimeout(() => {
        messageDiv.remove();
        if (this.currentMessage === messageDiv) {
          this.currentMessage = null;
        }
      }, 300);
    }, duration);
  }
};