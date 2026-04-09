import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/button';
import { LayoutDashboard, FileText, Briefcase, Wand2, History, LogOut, Trash2 } from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: '首页', icon: LayoutDashboard },
  { to: '/resume', label: '基础简历', icon: FileText },
  { to: '/jd', label: '职位描述', icon: Briefcase },
  { to: '/generate', label: '生成简历', icon: Wand2 },
  { to: '/history', label: '历史记录', icon: History },
];

export default function Layout() {
  const { logout, deleteAccount } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-blue-600">智能简历助手</h1>
          <p className="text-sm text-gray-500 mt-1">提升面试邀约率</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t space-y-2">
          <Button variant="outline" className="w-full" onClick={() => { logout(); navigate('/login'); }}>
            <LogOut className="w-4 h-4 mr-2" />退出登录
          </Button>
          <Button variant="ghost" className="w-full text-red-500 hover:text-red-600" onClick={async () => { if (window.confirm('确定要删除账号吗？所有数据将被永久删除。')) { await deleteAccount(); navigate('/login'); } }}>
            <Trash2 className="w-4 h-4 mr-2" />删除账号
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-8"><Outlet /></div>
      </main>
    </div>
  );
}
