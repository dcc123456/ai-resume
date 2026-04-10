import { useState, useEffect } from 'react';
import { generateAPI, jdAPI, resumeAPI, templateAPI } from '../api';
import KeywordMatch from '../components/KeywordMatch';
import MarkdownPreview from '../components/MarkdownPreview';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Wand2, Download, Edit3, Eye, AlertTriangle, Loader2, Image, ImageOff, X } from 'lucide-react';

interface Template {
  id: number;
  name: string;
  template_key: string;
  has_photo: boolean;
}

export default function GenerateResume() {
  const [jdList, setJdList] = useState<any[]>([]);
  const [selectedJdId, setSelectedJdId] = useState<number | null>(null);
  const [hasResume, setHasResume] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [editingMarkdown, setEditingMarkdown] = useState(false);
  const [markdownContent, setMarkdownContent] = useState('');
  const [saving, setSaving] = useState(false);

  // Template modal state
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [includePhoto, setIncludePhoto] = useState(true);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [pendingDownloadFormat, setPendingDownloadFormat] = useState<string | null>(null);

  useEffect(() => {
    (async () => { try { await resumeAPI.get(); setHasResume(true); } catch { setHasResume(false); } })();
    (async () => { try { const res = await jdAPI.list(); setJdList(res.data.items); if (res.data.items.length === 1) setSelectedJdId(res.data.items[0].id); } catch {} })();
  }, []);

  const handleGenerate = async () => {
    if (!selectedJdId) return;
    setError(''); setGenerating(true); setResult(null);
    try { const res = await generateAPI.fromJd(selectedJdId); setResult(res.data); setMarkdownContent(res.data.markdown); }
    catch (err: any) { setError(err.response?.data?.error || '生成失败'); }
    finally { setGenerating(false); }
  };

  const handleSaveMarkdown = async () => {
    if (!result) return;
    setSaving(true);
    try { await generateAPI.updateMarkdown(result.resume_id, markdownContent); setEditingMarkdown(false); }
    catch { setError('保存失败'); }
    finally { setSaving(false); }
  };

  const openTemplateModal = async (format: string) => {
    if (!result) return;
    setPendingDownloadFormat(format);
    setShowTemplateModal(true);
    setLoadingTemplates(true);

    try {
      // Load templates
      const templatesRes = await templateAPI.list();
      setTemplates(templatesRes.data.templates || []);

      // Load user preference to pre-select
      try {
        const prefRes = await templateAPI.getPreference();
        if (prefRes?.data) {
          setSelectedTemplateId(prefRes.data.template_id);
          setIncludePhoto(prefRes.data.include_photo);
        } else if (templatesRes.data.templates?.length > 0) {
          setSelectedTemplateId(templatesRes.data.templates[0].id);
          const firstTemplate = templatesRes.data.templates[0];
          setIncludePhoto(firstTemplate.has_photo);
        }
      } catch {
        if (templatesRes.data.templates?.length > 0) {
          setSelectedTemplateId(templatesRes.data.templates[0].id);
          const firstTemplate = templatesRes.data.templates[0];
          setIncludePhoto(firstTemplate.has_photo);
        }
      }
    } catch (err) {
      console.error('加载模板失败:', err);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleDownloadWithTemplate = async () => {
    if (!result || !selectedTemplateId || !pendingDownloadFormat) return;

    try {
      const res = await generateAPI.download(result.resume_id, pendingDownloadFormat, selectedTemplateId, includePhoto);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = `定制简历_${result.resume_id}.${pendingDownloadFormat}`; a.click();
      window.URL.revokeObjectURL(url);
      setShowTemplateModal(false);
    } catch (err: any) {
      setError(err.response?.data?.error || '下载失败');
      setShowTemplateModal(false);
    }
  };

  const handleTemplateSelect = (templateId: number) => {
    setSelectedTemplateId(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template && !template.has_photo) {
      setIncludePhoto(false);
    }
  };

  const currentTemplate = templates.find(t => t.id === selectedTemplateId);
  const canShowPhoto = currentTemplate?.has_photo !== false;

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold">生成定制简历</h2><p className="text-gray-500 text-sm mt-1">选择一个JD，一键生成高度匹配的定制化简历</p></div>
      {!hasResume && <Alert variant="destructive"><AlertDescription>请先上传基础简历，然后再生成定制简历。</AlertDescription></Alert>}
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      <Card><CardHeader><CardTitle>选择职位描述</CardTitle></CardHeader><CardContent>
        {jdList.length === 0 ? <p className="text-gray-500 text-sm">暂无已保存的JD，请先在"职位描述"页面添加。</p> : (
          <div className="space-y-2">
            {jdList.map((jd: any) => (
              <div key={jd.id} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${selectedJdId === jd.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`} onClick={() => setSelectedJdId(jd.id)}>
                <div><p className="font-medium">{jd.title}</p><p className="text-xs text-gray-400">{new Date(jd.created_at).toLocaleDateString()}</p></div>
                <Badge variant={jd.match_rate >= 70 ? 'default' : jd.match_rate >= 40 ? 'secondary' : 'destructive'}>匹配度 {jd.match_rate}%</Badge>
              </div>
            ))}
          </div>
        )}
        <Button onClick={handleGenerate} disabled={!selectedJdId || !hasResume || generating} className="w-full mt-4">
          {generating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />生成中（约10-20秒）...</> : <><Wand2 className="w-4 h-4 mr-2" />生成定制简历</>}
        </Button>
      </CardContent></Card>

      {result && (<>
        {result.fact_check_report?.hasIssues && <Alert className="bg-yellow-50 border-yellow-200"><AlertTriangle className="w-4 h-4 text-yellow-600" /><AlertDescription className="text-yellow-700"><p className="font-medium">事实校验发现差异：</p>{result.fact_check_report.company_diff?.length > 0 && <p className="text-sm mt-1">公司名差异：{result.fact_check_report.company_diff.map((d: any) => `${d.base} → ${d.generated}`).join('；')}</p>}{result.fact_check_report.title_diff?.length > 0 && <p className="text-sm mt-1">职位名差异：{result.fact_check_report.title_diff.map((d: any) => `${d.base} → ${d.generated}`).join('；')}</p>}</AlertDescription></Alert>}
        <Card><CardHeader><CardTitle>生成后匹配度</CardTitle></CardHeader><CardContent><KeywordMatch matchRate={result.keyword_match_rate} missingKeywords={result.missing_keywords} totalKeywords={result.missing_keywords ? result.missing_keywords.length + result.keyword_match_rate : 0} /></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle>简历预览</CardTitle><div className="flex gap-2"><Button size="sm" variant={editingMarkdown ? 'default' : 'outline'} onClick={() => setEditingMarkdown(!editingMarkdown)}>{editingMarkdown ? <><Eye className="w-4 h-4 mr-1" />预览</> : <><Edit3 className="w-4 h-4 mr-1" />编辑</>}</Button>{editingMarkdown && <Button size="sm" onClick={handleSaveMarkdown} disabled={saving}>{saving ? '保存中...' : '保存修改'}</Button>}</div></CardHeader><CardContent><MarkdownPreview content={markdownContent} editable={editingMarkdown} onChange={setMarkdownContent} /></CardContent></Card>
        <div className="flex gap-4"><Button onClick={() => openTemplateModal('docx')} className="flex-1"><Download className="w-4 h-4 mr-2" />下载 Word</Button><Button onClick={() => openTemplateModal('pdf')} variant="outline" className="flex-1"><Download className="w-4 h-4 mr-2" />下载 PDF</Button></div>
      </>)}

      {/* Template Selection Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">选择简历模板</h3>
              <button onClick={() => setShowTemplateModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {loadingTemplates ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                  <span className="ml-2 text-gray-500">加载中...</span>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    {templates.map((template) => (
                      <div
                        key={template.id}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedTemplateId === template.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => handleTemplateSelect(template.id)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{template.name}</span>
                          {template.has_photo ? (
                            <Image className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ImageOff className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {template.has_photo ? '支持头像' : '无头像'}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Include Photo Toggle */}
                  {canShowPhoto && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                      <input
                        type="checkbox"
                        id="modalIncludePhoto"
                        checked={includePhoto}
                        onChange={(e) => setIncludePhoto(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="modalIncludePhoto" className="text-sm text-gray-700 cursor-pointer">
                        在简历中包含头像
                      </label>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button variant="outline" onClick={() => setShowTemplateModal(false)} className="flex-1">
                      取消
                    </Button>
                    <Button onClick={handleDownloadWithTemplate} disabled={!selectedTemplateId} className="flex-1">
                      <Download className="w-4 h-4 mr-2" />
                      确认下载
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
