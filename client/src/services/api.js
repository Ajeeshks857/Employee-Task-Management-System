const API_BASE = import.meta.env.VITE_API_URL || '/api';
const API_SECURITY_TOKEN = import.meta.env.VITE_API_SECURITY_TOKEN || 'roots-secret-token-2026';

class ApiClient {
  constructor() {
    this.inFlightRequests = new Map();
  }

  async request(endpoint, options = {}) {
    const url = new URL(`${API_BASE}${endpoint}`, window.location.origin);

    if (options.params) {
      Object.entries(options.params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          url.searchParams.append(key, val);
        }
      });
    }

    const method = (options.method || 'GET').toUpperCase();
    const cacheKey = `${method}:${url.toString()}`;

    // Deduplicate identical in-flight GET requests
    if (method === 'GET' && this.inFlightRequests.has(cacheKey)) {
      return this.inFlightRequests.get(cacheKey);
    }

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_SECURITY_TOKEN}`,
        'x-api-key': API_SECURITY_TOKEN,
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    const requestPromise = (async () => {
      try {
        const response = await fetch(url.toString(), config);
        const data = await response.json();

        if (!response.ok) {
          const error = new Error(data.message || `Request failed with status ${response.status}`);
          error.status = response.status;
          error.details = data.errors || null;
          throw error;
        }

        return data;
      } catch (err) {
        if (!err.status) {
          err.message = 'Network error or server unreachable. Please check backend connection.';
        }
        throw err;
      } finally {
        if (method === 'GET') {
          this.inFlightRequests.delete(cacheKey);
        }
      }
    })();

    if (method === 'GET') {
      this.inFlightRequests.set(cacheKey, requestPromise);
    }

    return requestPromise;
  }

  // Dashboard
  getDashboardMetrics() {
    return this.request('/dashboard');
  }

  // Employees
  getEmployees(params = {}) {
    return this.request('/employees', { params });
  }

  getAllEmployees(params = {}) {
    return this.request('/employees', { params: { ...params, all: 'true' } });
  }

  getEmployeeById(id) {
    return this.request(`/employees/${id}`);
  }

  getAssignableEmployees() {
    return this.request('/employees/assignable');
  }

  createEmployee(payload) {
    return this.request('/employees', {
      method: 'POST',
      body: payload,
    });
  }

  updateEmployee(id, payload) {
    return this.request(`/employees/${id}`, {
      method: 'PUT',
      body: payload,
    });
  }

  deleteEmployee(id) {
    return this.request(`/employees/${id}`, {
      method: 'DELETE',
    });
  }

  // Tasks
  getTasks(params = {}) {
    return this.request('/tasks', { params });
  }

  getAllTasks(params = {}) {
    return this.request('/tasks', { params: { ...params, all: 'true' } });
  }

  getTaskById(id) {
    return this.request(`/tasks/${id}`);
  }

  createTask(payload) {
    return this.request('/tasks', {
      method: 'POST',
      body: payload,
    });
  }

  updateTask(id, payload) {
    return this.request(`/tasks/${id}`, {
      method: 'PUT',
      body: payload,
    });
  }

  updateTaskStatus(id, status) {
    return this.request(`/tasks/${id}/status`, {
      method: 'PUT',
      body: { status },
    });
  }

  deleteTask(id) {
    return this.request(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  // CSV Export URL helper with security token
  getExportCsvUrl(params = {}) {
    const url = new URL(`${API_BASE}/tasks/export/csv`, window.location.origin);
    url.searchParams.append('token', API_SECURITY_TOKEN);
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        url.searchParams.append(key, val);
      }
    });
    return url.toString();
  }
}

export const api = new ApiClient();
export default api;
export { ApiClient };
