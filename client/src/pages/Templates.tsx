import { useState, useEffect } from 'react';
import { templateAPI } from '../api';
import { sampleResume } from '../data/sampleResume';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Image, ImageOff, Check, Loader2, Eye } from 'lucide-react';

interface Template {
  id: number;
  name: string;
  template_key: string;
  has_photo: boolean;
}

interface TemplatePreference {
  template_id: number;
  include_photo: boolean;
}

export default function Templates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [preference, setPreference] = useState<TemplatePreference | null>(null);
  const [includePhoto, setIncludePhoto] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setMessage(null);
    try {
      // Load templates list
      const templatesRes = await templateAPI.list();
      setTemplates(templatesRes.data.templates || []);

      // Load user preference
      try {
        const prefRes = await templateAPI.getPreference();
        if (prefRes?.data) {
          setPreference(prefRes.data);
          setIncludePhoto(prefRes.data.include_photo ?? true);
        }
      } catch {
        // No preference saved yet, use defaults
        if (templatesRes.data.templates?.length > 0) {
          const firstTemplate = templatesRes.data.templates[0];
          setPreference({
            template_id: firstTemplate.id,
            include_photo: firstTemplate.has_photo,
          });
          setIncludePhoto(firstTemplate.has_photo);
        }
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || '加载失败' });
    } finally {
      setLoading(false);
    }
  }

  async function handleSetDefault(templateId: number) {
    setSaving(true);
    setMessage(null);
    try {
      const template = templates.find(t => t.id === templateId);
      if (!template) return;

      // If template doesn't support photo, force includePhoto to false
      const photoSetting = template.has_photo ? (includePhoto ?? true) : false;

      await templateAPI.setPreference(templateId, photoSetting);
      setPreference({ template_id: templateId, include_photo: photoSetting });

      if (!template.has_photo) {
        setIncludePhoto(false);
      }

      setMessage({ type: 'success', text: '默认模板已更新' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || '设置失败' });
    } finally {
      setSaving(false);
    }
  }

  async function handleIncludePhotoChange(checked: boolean) {
    if (!preference) return;

    setSaving(true);
    setMessage(null);
    try {
      await templateAPI.setPreference(preference.template_id, checked);
      setIncludePhoto(checked);
      setPreference({ ...preference, include_photo: checked });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || '设置失败' });
    } finally {
      setSaving(false);
    }
  }

  async function handlePreview(template: Template) {
    setPreviewTemplate(template);
    setPreviewLoading(true);
    setShowPreview(true);
    try {
      const usePhoto = template.has_photo && includePhoto;
      const res = await templateAPI.preview(template.template_key, sampleResume, usePhoto);
      setPreviewHtml(res.data.html || '');
    } catch (err: any) {
      setPreviewHtml('<p class="text-red-500">预览加载失败</p>');
    } finally {
      setPreviewLoading(false);
    }
  }

  const currentTemplate = templates.find(t => t.id === preference?.template_id);
  const canShowPhoto = currentTemplate?.has_photo !== false;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-500">加载中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">简历模板</h1>
        <p className="text-gray-500 mt-1">选择默认模板和头像设置</p>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {/* Include Photo Toggle */}
      {canShowPhoto && preference && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">包含头像</p>
                <p className="text-sm text-gray-500">在简历中显示你的头像</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={includePhoto}
                  onChange={(e) => handleIncludePhotoChange(e.target.checked)}
                  disabled={saving}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Templates Grid */}
      <Card>
        <CardHeader>
          <CardTitle>选择模板</CardTitle>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <p className="text-gray-500 text-sm">暂无可用模板</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`relative p-4 rounded-lg border-2 transition-all ${
                    preference?.template_id === template.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {preference?.template_id === template.id && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{template.name}</span>
                    {template.has_photo ? (
                      <Image className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ImageOff className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {template.has_photo ? '支持头像' : '无头像模板'}
                  </p>
                  {preference?.template_id === template.id && (
                    <p className="text-xs text-blue-600 mt-2 font-medium">当前默认</p>
                  )}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); handlePreview(template); }}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      预览
                    </button>
                    <button
                      onClick={() => handleSetDefault(template.id)}
                      className="flex-1 px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
                    >
                      选择
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Modal */}
      {showPreview && previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">模板预览 - {previewTemplate.name}</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                关闭
              </button>
            </div>
            <div className="p-4">
              {previewLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                  <span className="ml-2 text-gray-500">加载中...</span>
                </div>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
