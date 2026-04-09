import axios from 'axios';

const api = axios.create({ baseURL: '/api/v1', timeout: 120000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('email');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (email: string, password: string) => api.post('/auth/register', { email, password }),
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  deleteAccount: () => api.delete('/auth/account'),
};

export const resumeAPI = {
  upload: (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post('/resume/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  save: (structuredJson: any, rawText: string, filePath: string) => api.put('/resume', { structured_json: structuredJson, raw_text: rawText, file_path: filePath }),
  get: () => api.get('/resume'),
  downloadRaw: () => api.get('/resume/download/raw', { responseType: 'blob' }),
};

export const jdAPI = {
  upload: (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post('/jd/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  parseText: (text: string) => api.post('/jd/upload', { text }),
  save: (originalText: string, parsedJson: any) => api.post('/jd/save', { original_text: originalText, parsed_json: parsedJson }),
  list: (page = 1, size = 10) => api.get('/jd/list', { params: { page, size } }),
  delete: (jdId: number) => api.delete(`/jd/${jdId}`),
};

export const generateAPI = {
  fromJd: (jdId: number) => api.post(`/generate/from-jd/${jdId}`),
  updateMarkdown: (resumeId: number, markdownText: string) => api.put(`/generate/${resumeId}`, { markdown_text: markdownText }),
  download: (resumeId: number, format: string) => api.post(`/generate/${resumeId}/download`, { format }, { responseType: 'blob' }),
  history: (jdId?: number) => api.get('/generate/history', { params: jdId ? { jd_id: jdId } : {} }),
  delete: (resumeId: number) => api.delete(`/generate/${resumeId}`),
};

export default api;
