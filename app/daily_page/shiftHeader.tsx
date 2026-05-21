'use client'; 
import * as Holidays from 'japanese-holidays';
import {useState,useEffect, useRef} from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useShift } from './shiftContext';
import { useLayout } from './layoutContext';
import { saveShiftsAction } from './actions';
import NorthIcon from '@mui/icons-material/North';
import SouthIcon from '@mui/icons-material/South';
import SendAndArchiveIcon from '@mui/icons-material/SendAndArchive';
import HomeIcon from '@mui/icons-material/Home';
import { Tooltip } from '@mui/material';
import {DatePicker} from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/ja';




export function ShiftHeader({  prevStr, nextStr }: any) {
  const router = useRouter();
  const {isDirty,setIsDirty,isSaving,setIsSaving,localShifts,initialReqHolWorkers,sortOption,setSortOption,absentWorkers,
        filteredIDNAWorkers,setLocalShifts,setIsLoading,targetDate} = useShift()
  console.log('date',targetDate)
  console.log('希望休者',initialReqHolWorkers)
  const dateObj = new Date(targetDate);
  const dayOfWeek = dateObj.getDay();
  const dayNames = ['日', '月', '火', '水', '木', '金', '土']
  const holidayName = Holidays.isHoliday(dateObj);

  const isSunday = dayOfWeek === 0;
  const isSaturday = dayOfWeek === 6;
  const isHoliday = !!holidayName;

  
  const {setHeaderHeight} = useLayout()
  const headerRef = useRef<HTMLDivElement>(null)
  const [mounted,setMounted] = useState(false);
  

  useEffect(() => {
    setMounted(true);
  },[]);


  

  
  

  let dayColor = "text-gray-600";
  if(isSunday || isHoliday) dayColor = "text-red-600";
  else if(isSaturday) dayColor = "text-blue-600"


  //トースト通知
  const [toast,setToast] = useState<{message:string;visible:boolean}>({
    message:'',
    visible:false,
  });

  //通知が出てから3秒後に自動で閉じる
  useEffect(() => {
    if(toast.visible){
        const timer = setTimeout(() => {
            setToast(prev => ({...prev,visible:false}));
        }, 5000);
        return () => clearTimeout(timer);
    }
  },[toast.visible])

  useEffect(() => {

  
  if(!headerRef.current){
    return;
  }
  const observer = new ResizeObserver((entries) => {
    for (let entry of entries) {
      const height = entry.target.clientHeight
      setHeaderHeight(height)
    }
  })
  observer.observe(headerRef.current)

  return () => observer.disconnect()
  
  },[setHeaderHeight])

  
  

  if(!mounted) return 

  return (
    <div className="flex  gap-5 m-0 bg-sky-50 p-6 shadow-sm border border-gray-200 w-full">
      {/*日付*/}
      <div className='flex items-center mr-1 pt-2'>
        <h1 className="text-4xl font-black text-gray-600 text-center">
          {new Date(targetDate).getMonth() + 1}/{new Date(targetDate).getDate()}
        </h1>
      
        <span className={`text-3xl font-bold ${dayColor} relative -top-0.5`}>
          ({dayNames[dayOfWeek]})
        </span>
      </div>

      {/* 垂直の仕切り線 */}
      
      <div className="flex flex-col items-center gap-4 border-gray-200">
        {/* カレンダー選択 */}
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ja">
          <DatePicker
            label="日付選択"
            // targetDate（文字列）を dayjs オブジェクトに変換して渡す
            value={dayjs(targetDate)} 
            onChange={(newValue) => {
              if (newValue) {
                //dayjs オブジェクトを 'YYYY-MM-DD' 形式の文字列に戻して push
                const formattedDate = newValue.format('YYYY-MM-DD');
                router.push(`/daily_page?date=${formattedDate}`);
              }
            }}
            // デザインの微調整
            slotProps={{
              textField: { 
                size: 'small', 
                variant: 'outlined',
                // 前の className のエッセンス（太字など）を継承
                InputProps: { style: { fontWeight: 'bold', fontSize: '0.875rem' } }
              }
            }}
          />
        </LocalizationProvider>

        <div className='flex items-center gap-x-4 w-full'>
          {/* 前後ボタン */}
          <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200">
            <Link 
              href={`/daily_page?date=${prevStr}`}
              onClick={(e) => {
                if (isDirty && !window.confirm('未保存の変更があります。移動しますか？')) {
                    e.preventDefault(); // 遷移をキャンセル
                    return;
                }
                setIsLoading(true);
              }}
              className="px-3 py-1.5 hover:bg-white rounded-md text-sm font-bold text-gray-600"
            >
              ← 前日
            </Link>
            <div className="w-px bg-gray-300 my-1 mx-1"></div>
            <Link 
              href={`/daily_page?date=${nextStr}`}
              onClick={(e) => {
                if (isDirty && !window.confirm('未保存の変更があります。移動しますか？')) {
                    e.preventDefault(); // 遷移をキャンセル
                    return;
                }
                setIsLoading(true);

              }}
              className="px-3 py-1.5 hover:bg-white rounded-md text-sm font-bold text-gray-600"
            >
              翌日 →
            </Link>
          </div>

          

        </div>
      
      </div>

      
      {/* 保存ボタン */}
      <div>
        <div className="z-50 self-start pt-1">
          <Tooltip title="シフトを保存します" arrow placement='top'>
            <button 
            disabled = {isSaving}
            onClick={async () => {
                setIsSaving(true);
                //  全データを送る（または特定の人・日のデータに絞る）
                if (!targetDate) return;
                const result = await saveShiftsAction(localShifts,targetDate);
                if(result.success) {
                    
                    //justSavedRef.current = true;
                    setIsDirty(false); // 保存できたらフラグを下ろす
                    setLocalShifts(localShifts); 
                    //router.refresh();
                    setToast({message:"変更を記録しました",visible:true})
                }
            setTimeout(() => {setIsSaving(false)
                
            }, 500);
            }}
            className={`p-2 transition-all active:scale-100 flex justify-center
            ${isDirty 
              ? 'text-blue-600 cursor-pointer hover:scale-110' // 変更あり
              : 'text-blue-300 cursor-pointer hover:scale-110' // 変更なし
            }`}
            >
                {isSaving ? (
                    <>
                    {/*ローディングアイコン */}
                    <svg className="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                        
                    </>
                ) : (
                    <SendAndArchiveIcon sx={{ fontSize: 30 }}/>
                )}
            </button>
          </Tooltip>
        </div>

        <div className='ml-auto flex items-center gap-1 bg-gray-50 p-1 rounded-lg border border-gray-100'>
      
        <button 
            onClick={() => setSortOption('earliest')}
            className={`px-2 py-1 text-[10px] rounded font-bold ${sortOption === 'earliest' ? 'bg-blue-400 text-white' : 'bg-white text-gray-500'}`}
        >
            <NorthIcon/>
        </button>
        <button 
            onClick={() => setSortOption('latest')}
            className={`px-2 py-1 text-[10px] rounded font-bold ${sortOption === 'latest' ? 'bg-red-400 text-white' : 'bg-white text-gray-500'}`}
        >
            <SouthIcon/>
        </button>
      </div>




      </div>    

      
      {/*休日者表示エリア*/}
      <div className='flex flex-col items-start w-250 overflow-hidden'>
        <div className='flex items-start gap-8 py-3 px-0 bg-white rounded-2xl w-full pr-5'>


          {/*公休者*/}
          <div className='basis-3/5 flex flex-col gap-1 pl-6 border-gray-100 min-w-0 '>
            <p className='text-lg font-black text-gray-500 tracking-tighter'>
              公休者
            </p>
            <div className='flex  gap-1.5 overflow-x-auto no-scrollbar whitespace-nowrap pr-2 '>
              {absentWorkers?.map((emp: any) => (
              <span 
                key={emp.id} 
                className='px-2 py-0.5 bg-emerald-50 text-emerald-600 text-base font-black rounded border border-emerald-100 whitespace-nowrap'
              >
                {emp.name} 
              </span>
              ))}
              {(!absentWorkers || absentWorkers.length === 0) && (
                <span className='text-base text-gray-600'>なし</span>
              )}
            </div>
          </div>


          {/* --- 欠勤・不可グループ（統合） --- */}
          <div className='basis-2/5 flex flex-col gap-1 '>
            <p className='text-lg font-black text-gray-500 tracking-tighter'>
              希望休者・固定休者
            </p>
            <div className='flex gap-1.5 overflow-x-auto no-scrollbar whitespace-nowrap  pr-4'>
              {/*希望休者*/}
              {initialReqHolWorkers.map((name:any) => (
                <span key={`h-${name}`} className='px-2 py-0.5 bg-red-50 text-red-600 text-base font-black rounded border border-red-100  whitespace-nowrap'>
                  {name}
                </span>
              ))}

              {/*固定休者*/}
              {filteredIDNAWorkers.map((name:any) => (
                <span key={`f-${name}`} className="px-2 py-0.5 bg-orange-50 text-orange-500 text-base font-black rounded border border-orange-100 whitespace-nowrap">
                  {name}
                </span>
              ))}
              {/*誰もいない場合*/}
              {initialReqHolWorkers.length === 0 && filteredIDNAWorkers.length === 0 && (
                <span className='text-base text-gray-600'>なし</span>
              )}
            </div>
          </div>
          

          


        </div>
      
        

      </div>

      <div className="flex self-start ml-auto gap-2">
        {/*  ホームへ戻るボタン */}
        <Link 
          href="/" 
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-xl"
          title="ホームに戻る"
        >
          <HomeIcon  color="primary" sx={{ fontSize: 32 }}/>
        </Link>
        
      </div>


      


      

      

      {/* トースト通知 */}
      {toast.visible && (
      <div className="fixed top-5 right-5 z-100 animate-in fade-in slide-in-from-top-5 duration-300">
          <div className="bg-gray-900 text-white px-6 py-4 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-3 backdrop-blur-md bg-opacity-90">
          <span className="text-xl"></span>
          <p className="font-black tracking-tight">{toast.message}</p>
          </div>
      </div>
      )}

    </div>
  );
}