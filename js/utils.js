// /js/utils.js
class DateFormatter {
  /**
   * ISO 날짜를 상대 시간으로 표시 (한국 시간 기준)
   */
  static formatRelativeTime(isoDate) {
    if (!isoDate) return '';

    // ISO 문자열을 Date 객체로 변환
    const date = new Date(isoDate);
    
    // 현재 시간
    const now = new Date();
    
    // 밀리초 차이 계산
    const diffMs = now - date;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) {
      return '방금 전';
    } else if (diffMinutes < 60) {
      return `${diffMinutes}분 전`;
    } else if (diffHours < 24) {
      return `${diffHours}시간 전`;
    } else if (diffDays < 7) {
      return `${diffDays}일 전`;
    } else {
      // 7일 이상이면 날짜 표시
      return this.formatDate(date);
    }
  }

  /**
   * 날짜를 "YYYY.MM.DD" 형식으로 표시
   */
  static formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  }

  /**
   * 날짜를 "YYYY.MM.DD HH:mm" 형식으로 표시
   */
  static formatDateTime(isoDate) {
    const date = new Date(isoDate);
    const dateStr = this.formatDate(date);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${dateStr} ${hours}:${minutes}`;
  }
}

window.DateFormatter = DateFormatter;

