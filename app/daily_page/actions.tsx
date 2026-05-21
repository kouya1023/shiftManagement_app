'use server' 

import { createClient } from '@/utils/server'
import { revalidatePath } from 'next/cache'






export async function updateShiftAction(formData: FormData) {
  const supabase = await createClient()

  //  フォームからデータを取り出す
  const idsString = formData.get('ids') as string
  const ids = idsString ? idsString.split(',') : [];
  

  const date = formData.get('date') as string
  const worker_id = formData.get('worker_id') as string
  const task_id = formData.get('task_id') as string
  const start_time = `${formData.get('start_time')}:00`;
  const end_time = `${formData.get('end_time')}:00`;
  
  if(start_time >= end_time){
    console.error("不正な時間設定です。");
    return {success:false,message:"不正な時間設定です。"}
  }
  

  // ① 対象シフトが入る新しい時間帯に完全に含まれるシフトを全部消す
  await supabase
    .from('シフトデータ')
    .delete()
    .in('id',ids)


  // ② 【完全被りを消す】自分の新しい範囲に完全に含まれるシフトを削除
  await supabase
    .from('シフトデータ')
    .delete()
    .match({ worker_id, date })
    .gte('start_time', start_time)  
    .lte('end_time', end_time);    
    
  
  // ③ 【左側の調整】後ろが「自分の新しい開始」より食い込んでるバーを縮める
    await supabase
    .from('シフトデータ')
    .update({end_time:start_time})
    .match({worker_id,date})
    .lt('start_time',start_time)
    .gt('end_time',start_time);

  // ④ 【右側の調整】頭が「自分の新しい終了」より食い込んでるバーを後ろにずらす
  await supabase
    .from('シフトデータ')
    .update({start_time:end_time})
    .match({worker_id,date})
    .lt('start_time',end_time)
    .gt('end_time',end_time)


  //⑤ 空いた場所に追加する
  const {error:insertError} = await supabase
    .from('シフトデータ')
    .insert({
      date : date,
      worker_id: worker_id,
      task_id:task_id,
      start_time:start_time,
      end_time:end_time,

    });
  if (insertError){
    console.error('追加失敗:',insertError.message);
    return {success:false}
  }


  return { success: true }
}






export async function saveShiftsAction(shifts: any[], targetDate: string) {
    const supabase = await createClient();
    
    const { error: deleteError } = await supabase
        .from('シフトデータ')
        .delete()
        .eq('date', targetDate); // その日のデータを全消去

    if (deleteError) {
        console.error("削除失敗:", deleteError);
        return { success: false };
    }

    if (shifts.length === 0) return { success: true }; // 全消しして終了の場合

    // フロントから届いた「最新の全従業員のシフト」を一括挿入
    const { error: insertError } = await supabase
        .from('シフトデータ')
        .insert(shifts.map(s => ({
            worker_id: s.worker_id,
            date: s.date,
            task_id: s.task_id,
            start_time: s.start_time,
            end_time: s.end_time
        })));

    if (insertError) {
        console.error("挿入失敗:", insertError);
        return { success: false };
    }

    revalidatePath('/');
    return { success: true };
}

export async function createTaskAction({name,color}:{name:string,color:string}){
  const supabase =  await createClient()
  const {data,error} = await supabase
    .from('業務')
    .insert([{name,color}])
    .select()
    .single();
  if(error){
    console.error('インサートエラー:', error);
    return { success:false,error:error.message};
  }
  
  return {success:true,data};
}