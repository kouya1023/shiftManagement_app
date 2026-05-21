'use client';

import { createClient } from '@/utils/client';
import { useRouter } from 'next/navigation';
import LogoutIcon from '@mui/icons-material/Logout';

export default function LogoutButton() {
  const supabase = createClient();
  const router = useRouter();

  const handleLogout = async () => {
    
    const { error } = await supabase.auth.signOut();
    
    if (!error) {
      // ログアウト後はログイン画面へ即座にリダイレクト
      router.push('/');
      router.refresh(); // ページを最新状態に更新
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-all border border-red-200"
    >
        <LogoutIcon sx={{ fontSize: 20 }} />
        <span>ログアウト</span>
    </button>
  );
}