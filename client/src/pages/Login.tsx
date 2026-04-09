import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) await register(email, password);
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) { setError(err.response?.data?.error || '操作失败'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">智能简历定制助手</CardTitle>
          <CardDescription>{isRegister ? '创建账号，开始优化你的简历' : '登录你的账号'}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
            <div className="space-y-2"><Label htmlFor="email">邮箱</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required /></div>
            <div className="space-y-2"><Label htmlFor="password">密码</Label><Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="至少6位" minLength={6} required /></div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? '处理中...' : isRegister ? '注册' : '登录'}</Button>
            <p className="text-center text-sm text-gray-500">
              {isRegister ? '已有账号？' : '没有账号？'}
              <button type="button" className="text-blue-600 hover:underline ml-1" onClick={() => { setIsRegister(!isRegister); setError(''); }}>{isRegister ? '去登录' : '去注册'}</button>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
