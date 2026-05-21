

import { request } from 'http';
import { createClient } from '@/utils/server';
import { ShiftProvider } from './shiftContext';
import { LayoutProvider } from './layoutContext';
import { ShiftHeader } from './shiftHeader';
import { ShiftChart } from './Shiftchart/shiftchart';


// ---------------------------------------------------------
// メインページ（Server Component）
// ---------------------------------------------------------

export default async function ShiftPage( {
  searchParams
  }:{
    searchParams: {date?:string}
  }) {
  const supabase = await createClient();

  
  

  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth()+ 1).padStart(2,'0')
  const defaultDate = `2026-01-21`;
  //`${year}-${month}-21`

  const resolveParms = await searchParams;
  const targetDate  = resolveParms.date || defaultDate;

  const current = new Date(targetDate);
  const prevDate = new Date(current);
  prevDate.setDate(current.getDate() - 1)
  const nextDate = new Date (current);
  nextDate.setDate(current.getDate() + 1);
  const dayOfWeek = current.getDay();

  const prevStr = prevDate.toLocaleDateString('sv-SE');
  const nextStr = nextDate.toLocaleDateString('sv-SE');


  // -------------------------------------------------------

  const [
    {data:shifts},
    {data:tasks},
    {data:allWorkers},
    {data:requestHolidayWorkers},
    {data:availabilityData},
    {data:task_requirements}
  ] = await Promise.all([
    supabase.from('シフトデータ').select('*, 業務(*), 従業員(*)').eq('date', targetDate) ,//.order('start_time',{ascending:true}),
    supabase.from('業務').select('*') .order('id',{ascending:true}),
    supabase.from('従業員').select('*'),
    supabase.from('希望休') .select('worker:worker_id(name)').eq('date',targetDate),
    supabase.from('曜日別出勤可能時間') .select('worker_id,worker:worker_id(name),availability_type,start_time,end_time') .eq('day_of_week',dayOfWeek), //.eq('availability_type',1) 
    supabase.from('業務稼動時間') .select('*,業務(color,name)') 
  ])
  
  const requestHolidayWorkers_fixed = requestHolidayWorkers?.map((d:any) => d.worker?.[0]?.name ?? d.worker?.name).filter(Boolean) || [];
  

  
  return (
    <div className=" bg-gray-50 min-h-screen">  
      <ShiftProvider initialShifts={shifts || []} initialReqHolWorkers ={requestHolidayWorkers_fixed} availabilityData = {availabilityData || []} allWorkers = {allWorkers || []} taskRequirements = {task_requirements || []} targetDate = {targetDate}>
        <LayoutProvider>
          <ShiftHeader  prevStr={prevStr} nextStr={nextStr} />
          <ShiftChart tasks={tasks ||[]}   key={targetDate}/>
        </LayoutProvider>
      </ShiftProvider>
    </div>
  );
}


