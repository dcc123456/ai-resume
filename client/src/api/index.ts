import axios from 'axios';

const api = axios.create({ baseURL: '/api/v1', timeout: 600000 });

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
  download: (resumeId: number, format: string, template_id?: number, include_photo?: boolean) =>
    api.post(`/generate/${resumeId}/download`, { format, template_id, include_photo }, { responseType: 'blob' }),
  history: (jdId?: number) => api.get('/generate/history', { params: jdId ? { jd_id: jdId } : {} }),
  delete: (resumeId: number) => api.delete(`/generate/${resumeId}`),
};

export const profileAPI = {
  get: () => api.get('/profile'),
  update: (data: { name?: string; avatar_base64?: string }) => api.put('/profile', data),
};

export const templateAPI = {
  list: () => api.get('/templates'),
  getPreference: () => api.get('/templates/preference'),
  setPreference: (templateId: number, includePhoto: boolean) =>
    api.put('/templates/preference', { template_id: templateId, include_photo: includePhoto }),
  preview: (templateKey: string, data: any, includePhoto: boolean) =>
    api.post('/templates/preview', { template_key: templateKey, data, include_photo: includePhoto }),
};

export default api;
