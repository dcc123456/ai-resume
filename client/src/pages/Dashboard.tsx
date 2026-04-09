import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { FileText, Briefcase, Wand2, History } from 'lucide-react';

const steps = [
  { title: '上传基础简历', desc: '上传你的真实简历，系统将自动解析结构化信息', icon: FileText, to: '/resume' },
  { title: '输入职位描述', desc: '粘贴目标职位的JD，查看关键词匹配度', icon: Briefcase, to: '/jd' },
  { title: '生成定制简历', desc: '一键生成高度匹配的定制化简历', icon: Wand2, to: '/generate' },
  { title: '查看历史记录', desc: '管理已生成的简历和JD', icon: History, to: '/history' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">欢迎回来，{user?.email}</h2>
      <p className="text-gray-500 mb-8">按照以下步骤，快速生成定制化简历</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {steps.map(({ title, desc, icon: Icon, to }, i) => (
          <Card key={to} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(to)}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><Icon className="w-5 h-5" /></div>
                <div><span className="text-sm text-gray-400">步骤 {i + 1}</span><CardTitle className="text-lg">{title}</CardTitle></div>
              </div>
            </CardHeader>
            <CardContent><p className="text-gray-500 text-sm">{desc}</p></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
