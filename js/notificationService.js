window.NotificationService = class {
  showError(message) {
    this.showMessage(message, "error-message", 5000);
  }

  showSuccess(message) {
    this.showMessage(message, "success-message", 3000);
  }

  showMessage(message, className, duration) {
    const messageDiv = document.createElement("div");
    messageDiv.className = className;
    messageDiv.textContent = message;
    const container = document.querySelector(".container");
    if (container) {
      container.insertBefore(messageDiv, container.firstChild);
      setTimeout(() => messageDiv.remove(), duration);
    } else {
      alert(message);
    }
  }
};

