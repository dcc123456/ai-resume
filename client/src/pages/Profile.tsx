import { useState, useEffect, useRef } from 'react';
import { profileAPI } from '../api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useAuth } from '../hooks/useAuth';
import { User, Mail, Save, Upload } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const res = await profileAPI.get();
      setName(res.data.name || '');
      setAvatar(res.data.avatar_base64);
      setEmail(res.data.email);
    } catch (err: any) {
      setMessage({ type: 'error', text: '加载资料失败' });
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      await profileAPI.update({ name, avatar_base64: avatar || undefined });
      setMessage({ type: 'success', text: '保存成功' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || '保存失败' });
    } finally {
      setSaving(false);
    }
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // 限制文件大小 2MB
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: '图片大小不能超过 2MB' });
      return;
    }

    // 限制文件类型
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: '请选择图片文件' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setAvatar(base64);
    };
    reader.readAsDataURL(file);
  }

  function handleRemoveAvatar() {
    setAvatar(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">个人资料</h1>
        <p className="text-gray-500 mt-1">管理你的头像和名字</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>基本信息</CardTitle>
          <CardDescription>这些信息将用于你的简历模板</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {message && (
            <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message.text}
            </div>
          )}

          {/* 头像 */}
          <div className="flex items-center gap-6">
            <div className="relative">
              {avatar ? (
                <img
                  src={avatar}
                  alt="头像"
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="w-10 h-10 text-gray-400" />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                上传头像
              </Button>
              {avatar && (
                <Button
                  variant="ghost"
                  onClick={handleRemoveAvatar}
                  className="text-red-500 hover:text-red-600"
                >
                  移除头像
                </Button>
              )}
              <p className="text-xs text-gray-500">支持 JPG、PNG 格式，最大 2MB</p>
            </div>
          </div>

          {/* 名字 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">名字</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入你的名字"
              maxLength={100}
            />
          </div>

          {/* 邮箱（只读） */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">邮箱</label>
            <Input value={email} disabled />
            <p className="text-xs text-gray-500">邮箱无法修改</p>
          </div>

          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? '保存中...' : '保存修改'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
