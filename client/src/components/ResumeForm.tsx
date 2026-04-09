import { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Plus, Trash2 } from 'lucide-react';

interface WorkExperience {
  company: string;
  title: string;
  start_date: string;
  end_date: string;
  responsibilities: string[];
}

interface Education {
  degree: string;
  major: string;
  school: string;
  start_date: string;
  end_date: string;
}

interface ResumeFormData {
  name: string;
  phone: string;
  email: string;
  work_experiences: WorkExperience[];
  education: Education;
  skills: string[];
}

interface ResumeFormProps {
  data?: ResumeFormData;
  onChange?: (data: ResumeFormData) => void;
  readonly?: boolean;
}

const emptyExperience: WorkExperience = { company: '', title: '', start_date: '', end_date: '', responsibilities: [''] };
const emptyEducation: Education = { degree: '', major: '', school: '', start_date: '', end_date: '' };

export default function ResumeForm({ data, onChange, readonly = false }: ResumeFormProps) {
  const [form, setForm] = useState<ResumeFormData>(data || {
    name: '', phone: '', email: '',
    work_experiences: [{ ...emptyExperience }],
    education: { ...emptyEducation },
    skills: [''],
  });

  useEffect(() => { if (data) setForm(data); }, [data]);

  const updateField = (path: string, value: string) => {
    setForm((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let obj: any = next;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const addExperience = () => setForm((prev) => ({ ...prev, work_experiences: [...prev.work_experiences, { ...emptyExperience }] }));
  const removeExperience = (index: number) => setForm((prev) => ({ ...prev, work_experiences: prev.work_experiences.filter((_, i) => i !== index) }));
  const updateResponsibility = (expIndex: number, respIndex: number, value: string) => {
    setForm((prev) => { const next = JSON.parse(JSON.stringify(prev)); next.work_experiences[expIndex].responsibilities[respIndex] = value; return next; });
  };
  const addResponsibility = (expIndex: number) => {
    setForm((prev) => { const next = JSON.parse(JSON.stringify(prev)); next.work_experiences[expIndex].responsibilities.push(''); return next; });
  };
  const removeResponsibility = (expIndex: number, respIndex: number) => {
    setForm((prev) => { const next = JSON.parse(JSON.stringify(prev)); next.work_experiences[expIndex].responsibilities.splice(respIndex, 1); return next; });
  };
  const updateSkill = (index: number, value: string) => {
    setForm((prev) => { const next = JSON.parse(JSON.stringify(prev)); next.skills[index] = value; return next; });
  };
  const addSkill = () => setForm((prev) => ({ ...prev, skills: [...prev.skills, ''] }));
  const removeSkill = (index: number) => setForm((prev) => ({ ...prev, skills: prev.skills.filter((_, i) => i !== index) }));

  const handleSave = () => { if (onChange) onChange(form); };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>基本信息</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2"><Label>姓名</Label><Input value={form.name} onChange={(e) => updateField('name', e.target.value)} disabled={readonly} /></div>
          <div className="space-y-2"><Label>电话</Label><Input value={form.phone} onChange={(e) => updateField('phone', e.target.value)} disabled={readonly} /></div>
          <div className="space-y-2"><Label>邮箱</Label><Input value={form.email} onChange={(e) => updateField('email', e.target.value)} disabled={readonly} /></div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between"><CardTitle>工作经历</CardTitle>{!readonly && <Button size="sm" variant="outline" onClick={addExperience}><Plus className="w-4 h-4 mr-1" />添加</Button>}</CardHeader>
        <CardContent className="space-y-6">
          {form.work_experiences.map((exp, expIdx) => (
            <div key={expIdx} className="border rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">经历 {expIdx + 1}</span>
                {!readonly && form.work_experiences.length > 1 && <Button size="sm" variant="ghost" onClick={() => removeExperience(expIdx)} className="text-red-500"><Trash2 className="w-4 h-4" /></Button>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label className="text-xs">公司名称</Label><Input value={exp.company} onChange={(e) => updateField(`work_experiences.${expIdx}.company`, e.target.value)} disabled={readonly} /></div>
                <div className="space-y-1"><Label className="text-xs">职位名称</Label><Input value={exp.title} onChange={(e) => updateField(`work_experiences.${expIdx}.title`, e.target.value)} disabled={readonly} /></div>
                <div className="space-y-1"><Label className="text-xs">开始时间</Label><Input placeholder="2020-03" value={exp.start_date} onChange={(e) => updateField(`work_experiences.${expIdx}.start_date`, e.target.value)} disabled={readonly} /></div>
                <div className="space-y-1"><Label className="text-xs">结束时间</Label><Input placeholder="至今" value={exp.end_date} onChange={(e) => updateField(`work_experiences.${expIdx}.end_date`, e.target.value)} disabled={readonly} /></div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">工作职责</Label>
                {exp.responsibilities.map((resp, respIdx) => (
                  <div key={respIdx} className="flex gap-2">
                    <Textarea value={resp} onChange={(e) => updateResponsibility(expIdx, respIdx, e.target.value)} disabled={readonly} rows={2} className="flex-1" />
                    {!readonly && <Button size="sm" variant="ghost" onClick={() => removeResponsibility(expIdx, respIdx)} className="text-red-500 shrink-0"><Trash2 className="w-4 h-4" /></Button>}
                  </div>
                ))}
                {!readonly && <Button size="sm" variant="outline" onClick={() => addResponsibility(expIdx)}><Plus className="w-4 h-4 mr-1" />添加职责</Button>}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>教育背景</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-1"><Label className="text-xs">学校</Label><Input value={form.education?.school || ''} onChange={(e) => updateField('education.school', e.target.value)} disabled={readonly} /></div>
          <div className="space-y-1"><Label className="text-xs">学历</Label><Input value={form.education?.degree || ''} onChange={(e) => updateField('education.degree', e.target.value)} disabled={readonly} /></div>
          <div className="space-y-1"><Label className="text-xs">专业</Label><Input value={form.education?.major || ''} onChange={(e) => updateField('education.major', e.target.value)} disabled={readonly} /></div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1"><Label className="text-xs">开始时间</Label><Input value={form.education?.start_date || ''} onChange={(e) => updateField('education.start_date', e.target.value)} disabled={readonly} /></div>
            <div className="space-y-1"><Label className="text-xs">结束时间</Label><Input value={form.education?.end_date || ''} onChange={(e) => updateField('education.end_date', e.target.value)} disabled={readonly} /></div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between"><CardTitle>专业技能</CardTitle>{!readonly && <Button size="sm" variant="outline" onClick={addSkill}><Plus className="w-4 h-4 mr-1" />添加</Button>}</CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {form.skills.map((skill, idx) => (
              <div key={idx} className="flex items-center gap-1">
                <Input value={skill} onChange={(e) => updateSkill(idx, e.target.value)} disabled={readonly} className="w-32 h-8 text-sm" />
                {!readonly && <Button size="sm" variant="ghost" onClick={() => removeSkill(idx)} className="text-red-500 h-8 w-8 p-0"><Trash2 className="w-3 h-3" /></Button>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      {!readonly && onChange && <Button onClick={handleSave} className="w-full">保存简历</Button>}
    </div>
  );
}
