import { API_BASE_URL } from './apiConfig';
import AuthService from './authService';

class MysqlService {
  // low-level request helper that attaches auth if present
  async request(path, options = {}) {
    const url = `${API_BASE_URL}${path}`;
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    const opts = { credentials: 'include', ...options, headers };

    if (opts.body && typeof opts.body !== 'string') {
      opts.body = JSON.stringify(opts.body);
    }

    const res = await fetch(url, opts);

    // Try to parse JSON, but handle empty/no-content
    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (e) {
      data = text;
    }

    if (!res.ok) {
      const err = new Error((data && data.message) ? data.message : `Request failed: ${res.status}`);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  }

  // Generic helpers
  get(path) { return this.request(path, { method: 'GET' }); }
  post(path, body) { return this.request(path, { method: 'POST', body }); }
  put(path, body) { return this.request(path, { method: 'PUT', body }); }
  delete(path) { return this.request(path, { method: 'DELETE' }); }

  // Notifications - these endpoints assume your backend provides /notifications
  async fetchNotifications(userEmail) {
    const q = userEmail ? `?email=${encodeURIComponent(userEmail)}` : '';
    return this.get(`/notifications${q}`);
  }

  async createNotification(payload) {
    return this.post('/notifications', payload);
  }

  async markAsRead(notificationId) {
    // backend route: PUT /notifications/:id/read
    return this.put(`/notifications/${notificationId}/read`);
  }

  async markAllAsRead(userEmail) {
    const q = userEmail ? `?email=${encodeURIComponent(userEmail)}` : '';
    // backend route: PUT /notifications/mark-all-read?email=<email>
    return this.put(`/notifications/mark-all-read${q}`);
  }

  async deleteNotification(notificationId) {
    return this.delete(`/notifications/${notificationId}`);
  }
}

export default new MysqlService();
