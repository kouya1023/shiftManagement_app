import { createClient } from "@/utils/server";
import LoginView from "./Login_page/Loginview";
import LogoutButton from "./Login_page/LogoutButton";
import  Link  from "next/link";

export default async function Homepage() {
  const supabase = await createClient();
  const {data:{user}} = await supabase.auth.getUser();


  if(!user) return <LoginView/>
  
  const avatarUrl = user.user_metadata.avatar_url;
  const fullName = user.user_metadata.full_name;

  const menuItems = [
    { title: '日次チャート', desc: '今日の業務別シフトを確認・編集', icon: '📅', href: './daily_page', color: 'bg-blue-500' },
    { title: '月間シフト(未実装)', desc: '1ヶ月の全体像を確認', icon: '🗓️', href: '#', color: 'bg-green-500' },
    
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-white border-b shadow-sm mb-8">
        <div className="max-w-5xl mx-auto px-6 py-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="flex flex-col ">
              <div className="flex items-center gap-3">               
                <h2 className="text-2xl font-bold text-gray-800">
                  お疲れ様です、{user.user_metadata.full_name || 'ゲストユーザー'} さん
                </h2>
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt="Manager Profile" 
                    className="w-10 h-10 rounded-full border-2 border-blue-100 shadow-sm transition-transform hover:scale-110 "
                  />
                  ) : (
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    {fullName?.charAt(0)}
                  </div>
                      )}
              </div>
  
                
              <p className="text-gray-600">今日の店舗運営を最適化しましょう。</p>
            </div>
            
          </div>

          

          {/*ログアウトボタン */}
          <div className="flex items-center">
            <LogoutButton />
            
          </div>

        </div>
      </header>
      
      <main className="max-w-5xl mx-auto p-6">
        

        {/*  メニューカード一覧 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <Link 
              key={item.title} 
              href={item.href}
              className="group p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all duration-300"
            >
              <div className={`w-12 h-12 ${item.color} text-white rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                {item.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </Link>
          ))}
        </div>

        
      
        
      </main>
      
    </div>
  );

}
