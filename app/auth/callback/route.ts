// app/auth/callback/route.ts
import { createClient } from '@/utils/server'; 
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code'); 

  if (code) {
    const supabase = await createClient();
   
    const { data,error } = await supabase.auth.exchangeCodeForSession(code);
    console.log(" Data:", data);   
    console.log(" Error:", error);
    if (!error) {
      
      
      return NextResponse.redirect(`${origin}`);
    }
  }
  // 失敗した場合はログイン画面へ
  
  return NextResponse.redirect(`${origin}/Login_page`);
  
}