import { useState, useEffect } from 'react';
import { jdAPI, generateAPI } from '../api';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Briefcase, FileText, Trash2, Download } from 'lucide-react';

export default function History() {
  const [jdList, setJdList] = useState<any[]>([]);
  const [resumeList, setResumeList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try { const [jdRes, resumeRes] = await Promise.all([jdAPI.list(), generateAPI.history()]); setJdList(jdRes.data.items); setResumeList(resumeRes.data.items); }
      catch { setError('加载失败'); }
      finally { setLoading(false); }
    })();
  }, []);

  const handleDeleteJD = async (id: number) => { if (!window.confirm('确定删除该JD？')) return; await jdAPI.delete(id); /* reload */ };
  const handleDeleteResume = async (id: number) => { if (!window.confirm('确定删除该定制简历？')) return; await generateAPI.delete(id); /* reload */ };
  const handleDownload = async (id: number, format: string) => {
    try { const res = await generateAPI.download(id, format); const url = window.URL.createObjectURL(new Blob([res.data])); const a = document.createElement('a'); a.href = url; a.download = `定制简历_${id}.${format}`; a.click(); window.URL.revokeObjectURL(url); }
    catch { setError('下载失败'); }
  };

  if (loading) return <div className="text-center py-8 text-gray-500">加载中...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">历史记录</h2>
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      <Tabs defaultValue="resumes"><TabsList><TabsTrigger value="resumes">定制简历 ({resumeList.length})</TabsTrigger><TabsTrigger value="jds">职位描述 ({jdList.length})</TabsTrigger></TabsList>
        <TabsContent value="resumes" className="space-y-3 mt-4">
          {resumeList.length === 0 ? <p className="text-gray-500 text-sm">暂无生成的简历</p> : resumeList.map((item: any) => (
            <Card key={item.resume_id}><CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3"><FileText className="w-5 h-5 text-blue-500" /><div><p className="font-medium">{item.jd_title}</p><p className="text-xs text-gray-400">{new Date(item.created_at).toLocaleString()}</p></div></div>
              <div className="flex items-center gap-2"><Badge variant={item.match_rate >= 70 ? 'default' : 'secondary'}>匹配度 {item.match_rate}%</Badge><Button size="sm" variant="outline" onClick={() => handleDownload(item.resume_id, 'docx')}><Download className="w-4 h-4 mr-1" />Word</Button><Button size="sm" variant="outline" onClick={() => handleDownload(item.resume_id, 'pdf')}><Download className="w-4 h-4 mr-1" />PDF</Button><Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDeleteResume(item.resume_id)}><Trash2 className="w-4 h-4" /></Button></div>
            </CardContent></Card>
          ))}
        </TabsContent>
        <TabsContent value="jds" className="space-y-3 mt-4">
          {jdList.length === 0 ? <p className="text-gray-500 text-sm">暂无保存的JD</p> : jdList.map((item: any) => (
            <Card key={item.id}><CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3"><Briefcase className="w-5 h-5 text-green-500" /><div><p className="font-medium">{item.title}</p><p className="text-xs text-gray-400">{new Date(item.created_at).toLocaleString()}</p></div></div>
              <div className="flex items-center gap-2"><Badge variant={item.match_rate >= 70 ? 'default' : 'secondary'}>匹配度 {item.match_rate}%</Badge><Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDeleteJD(item.id)}><Trash2 className="w-4 h-4" /></Button></div>
            </CardContent></Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
