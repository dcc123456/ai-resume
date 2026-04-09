import { useState, useEffect } from 'react';
import { resumeAPI } from '../api';
import FileUpload from '../components/FileUpload';
import ResumeForm from '../components/ResumeForm';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Download, AlertTriangle } from 'lucide-react';

// 将 LLM 返回的各种格式统一转换为 ResumeForm 期望的格式
function normalizeResumeData(raw: any): any {
  if (!raw) return null;
  const d = { ...raw };

  // 工作经历字段映射
  const workKey = d.work_experiences || d.workExperience || d.work_experience;
  if (Array.isArray(workKey)) {
    d.work_experiences = workKey.map((exp: any) => ({
      company: exp.company || '',
      title: exp.title || exp.position || '',
      start_date: exp.start_date || exp.startDate || '',
      end_date: exp.end_date || exp.endDate || '',
      responsibilities: Array.isArray(exp.responsibilities)
        ? exp.responsibilities
        : exp.description
          ? exp.description.split(/[-•]\s*/).filter(Boolean)
          : [''],
    }));
  } else {
    d.work_experiences = [{ company: '', title: '', start_date: '', end_date: '', responsibilities: [''] }];
  }

  // 教育背景字段映射
  const eduKey = d.education;
  if (eduKey) {
    if (Array.isArray(eduKey)) {
      d.education = {
        school: eduKey[0]?.school || '',
        degree: eduKey[0]?.degree || '',
        major: eduKey[0]?.major || '',
        start_date: eduKey[0]?.start_date || eduKey[0]?.startDate || '',
        end_date: eduKey[0]?.end_date || eduKey[0]?.endDate || '',
      };
    } else {
      d.education = {
        school: eduKey.school || '',
        degree: eduKey.degree || '',
        major: eduKey.major || '',
        start_date: eduKey.start_date || eduKey.startDate || '',
        end_date: eduKey.end_date || eduKey.endDate || '',
      };
    }
  } else {
    d.education = { school: '', degree: '', major: '', start_date: '', end_date: '' };
  }

  // 技能字段映射
  if (!Array.isArray(d.skills)) d.skills = [];
  d.skills = d.skills.map((s: any) => (typeof s === 'string' ? s : String(s)));

  return d;
}

export default function ResumeUpload() {
  const [parsedData, setParsedData] = useState<any>(null);
  const [rawText, setRawText] = useState('');
  const [filePath, setFilePath] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [warning, setWarning] = useState('');

  useEffect(() => {
    (async () => {
      try { const res = await resumeAPI.get(); if (res.data.structured_json) setParsedData(normalizeResumeData(res.data.structured_json)); } catch {}
    })();
  }, []);

  const handleFileSelect = async (selectedFile: File) => {
    setError(''); setWarning(''); setLoading(true);
    try {
      const res = await resumeAPI.upload(selectedFile);
      setParsedData(normalizeResumeData(res.data.structured_json));
      setRawText(res.data.raw_text);
      setFilePath(res.data.file_path);
      if (res.data.warning) setWarning(res.data.warning);
    } catch (err: any) { setError(err.response?.data?.error || '简历解析失败'); }
    finally { setLoading(false); }
  };

  const handleSave = async (formData: any) => {
    setSaving(true); setError(''); setSuccess('');
    try { await resumeAPI.save(formData, rawText, filePath); setSuccess('简历保存成功！'); }
    catch (err: any) { setError(err.response?.data?.error || '保存失败'); }
    finally { setSaving(false); }
  };

  const handleDownloadRaw = async () => {
    try {
      const res = await resumeAPI.downloadRaw();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = '原始简历'; a.click();
      window.URL.revokeObjectURL(url);
    } catch { setError('下载失败'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">基础简历</h2><p className="text-gray-500 text-sm mt-1">上传你的真实简历作为唯一事实来源</p></div>
        {parsedData && <Button variant="outline" onClick={handleDownloadRaw}><Download className="w-4 h-4 mr-2" />下载原始文件</Button>}
      </div>
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      {warning && <Alert className="bg-yellow-50 border-yellow-200"><AlertTriangle className="w-4 h-4 text-yellow-600" /><AlertDescription className="text-yellow-700">{warning}</AlertDescription></Alert>}
      {success && <Alert className="bg-green-50 border-green-200"><AlertDescription className="text-green-700">{success}</AlertDescription></Alert>}
      <Card><CardHeader><CardTitle>上传简历文件</CardTitle></CardHeader><CardContent><FileUpload onFileSelect={handleFileSelect} accept=".pdf,.docx" label="简历文件（PDF/Word）" />{loading && <p className="text-sm text-gray-500 mt-2 text-center">正在解析简历，请稍候...</p>}</CardContent></Card>
      {parsedData && <Card><CardHeader><CardTitle>简历信息确认</CardTitle><p className="text-sm text-gray-500">请核对以下信息，如有误可手动修正</p></CardHeader><CardContent><ResumeForm data={parsedData} onChange={handleSave} /></CardContent></Card>}
    </div>
  );
}
