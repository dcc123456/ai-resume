import { useState } from 'react';
import { jdAPI } from '../api';
import FileUpload from '../components/FileUpload';
import KeywordMatch from '../components/KeywordMatch';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Send, Save, Briefcase } from 'lucide-react';

export default function JDInput() {
  const [jdText, setJdText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [parsedResult, setParsedResult] = useState<any>(null);
  const [matchData, setMatchData] = useState<{ matchRate: number; missingKeywords: string[]; totalKeywords: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleParse = async () => {
    setError(''); setLoading(true);
    try {
      let res;
      if (file) res = await jdAPI.upload(file);
      else if (jdText.trim()) res = await jdAPI.parseText(jdText);
      else { setError('请上传JD文件或粘贴JD文本'); return; }
      setParsedResult(res.data);
    } catch (err: any) { setError(err.response?.data?.error || 'JD解析失败'); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!parsedResult) return;
    setSaving(true); setError(''); setSuccess('');
    try {
      const res = await jdAPI.save(parsedResult.original_text, parsedResult.parsed_json);
      setMatchData({ matchRate: res.data.keyword_match_rate, missingKeywords: res.data.missing_keywords, totalKeywords: parsedResult.parsed_json.hard_skills?.length || 0 });
      setSuccess(`JD已保存（ID: ${res.data.jd_id}）`);
    } catch (err: any) { setError(err.response?.data?.error || '保存失败'); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold">职位描述（JD）</h2><p className="text-gray-500 text-sm mt-1">输入目标职位的JD，系统将提取关键词并计算匹配度</p></div>
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      {success && <Alert className="bg-green-50 border-green-200"><AlertDescription className="text-green-700">{success}</AlertDescription></Alert>}
      <Card><CardHeader><CardTitle>输入JD</CardTitle></CardHeader><CardContent className="space-y-4">
        <Tabs defaultValue="text"><TabsList><TabsTrigger value="text">粘贴文本</TabsTrigger><TabsTrigger value="file">上传文件</TabsTrigger></TabsList>
          <TabsContent value="text"><Textarea value={jdText} onChange={(e) => setJdText(e.target.value)} placeholder="在此粘贴职位描述..." rows={10} className="mt-2" /></TabsContent>
          <TabsContent value="file"><div className="mt-2"><FileUpload onFileSelect={setFile} label="JD文件" /></div></TabsContent>
        </Tabs>
        <Button onClick={handleParse} disabled={loading} className="w-full">{loading ? '解析中...' : <><Send className="w-4 h-4 mr-2" />解析JD</>}</Button>
      </CardContent></Card>
      {parsedResult && <Card><CardHeader><CardTitle className="flex items-center gap-2"><Briefcase className="w-5 h-5" />{parsedResult.parsed_json?.title || 'JD解析结果'}</CardTitle></CardHeader><CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2"><span className="text-sm text-gray-500">硬技能：</span>{parsedResult.parsed_json?.hard_skills?.map((skill: string, i: number) => (<Badge key={i} variant="secondary">{skill}</Badge>))}</div>
        {parsedResult.parsed_json?.exp_years && <p className="text-sm text-gray-500">经验要求：{parsedResult.parsed_json.exp_years}年</p>}
        {parsedResult.parsed_json?.edu_level && <p className="text-sm text-gray-500">学历要求：{parsedResult.parsed_json.edu_level}</p>}
        {!matchData && <Button onClick={handleSave} disabled={saving} className="w-full">{saving ? '保存中...' : <><Save className="w-4 h-4 mr-2" />保存JD并查看匹配度</>}</Button>}
      </CardContent></Card>}
      {matchData && <Card><CardHeader><CardTitle>关键词匹配分析</CardTitle></CardHeader><CardContent><KeywordMatch {...matchData} /></CardContent></Card>}
    </div>
  );
}
