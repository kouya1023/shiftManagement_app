'use client'

import React, { useState,useEffect,useRef,useMemo} from 'react'
import { addMinutesToTime,applyBulldozer,getMinutesFromStart} from '../../utils';
import { useShift } from '../shiftContext';
import { useLayout } from '../layoutContext';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { StaffRow } from './staffRow';
import { AddNewBar } from '../menus/addNewBar';
import { EditBarModal } from '../menus/editBarModal';
import { ChangeWorkerMenu } from '../menus/changeWorkerMenu';
import { AddNewWorker } from '../menus/addNewWorker';
import { MenuAnchor } from '../menus/menuAnchor';



// ---------------------------------------------------------
// チャートコンポーネント
// ---------------------------------------------------------

export function ShiftChart({ tasks}: { tasks: any[]}) {
  
  
  const hours = Array.from({ length: 19 }, (_, i) => i + 5); // 5, 6, ..., 24時までのラベル
  const hoveredWorkerRef = useRef<{id:string | number , name : string} | null>(null); 


  const {localShifts,setLocalShifts,isDirty,setIsDirty,isSaving,shifts,allWorkers,sortOption,displayOrder,setdisplayOrder,
            taskRequirements,editingWorkerId, setEditingWorkerId,
            containerRef,menuAnchor,
        resizing, setResizing,hoveredIds,setHoveredIds,isLoading,setIsLoading,TOTAL_MINUTES,targetDate} = useShift();
  
  
  const {headerHeight} =useLayout()
  const [editingShift, setEditingShift] = useState<any>(null);
  
  const [newShiftPicker,setNewShiftPicker] = useState<{
            x:number,
            y:number,
            worker : any,
            startTime : string,
            endTime : string 
          } | null>(null)
  
  
  

 
   
  useEffect(() => {
    
    if (!shifts || shifts.length === 0) {
        setdisplayOrder([]);
    return;
    }
    const displaryWorkerMap = new Map();
    shifts.forEach((s:any) => {
        const id = String(s.worker_id);
        if(!displaryWorkerMap.has(id)) {
            displaryWorkerMap.set(id,{
                id:id,
                name : String(s.従業員?.name || '不明')
            });
        }
    });
    setdisplayOrder(Array.from(displaryWorkerMap.values()));
  },[shifts,targetDate]);


  const taskColorMap = Object.fromEntries(
    (taskRequirements || []).map((req: any) => [
        req.task_id, 
        {
        name:req.業務?.name,
        color:req.業務?.color|| '#cbd5e1', 
        }
    ])
    );


    //追加可能な従業員リスト
    const availableWorkers = allWorkers.filter((worker:any) => {
    // displayOrder にその人の ID が含まれていない人だけを残す
    return !displayOrder.some((d:any) => String(d.id) === String(worker.id));
    });
  
    const [showWorkerAddMenu,setShowWorkerAddMenu] = useState<{x:number,y:number} | null>(null);//従業員追加メニュー
    const [manualWorkers,setManualWorkers] = useState<any[]>([]);

  //出勤時間の早い順、退勤時間の遅い順で並び替え
  useEffect(() => {
    if(!shifts || shifts.length === 0) return;

    const statsMap = new Map();
    shifts.forEach((s:any) => {
        const id = String(s.worker_id);
        const current = statsMap.get(id) || {
            id,
            name: String(s.従業員?.name || '不明'),
            minStart : '24:00',
            maxEnd : '00:00'
        };
        if (s.start_time < current.minStart) current.minStart = s.start_time;
        if (s.end_time > current.maxEnd) current.maxEnd = s.end_time;
        
        statsMap.set(id,current)
    })

    const workerList = Array.from(statsMap.values());

    workerList.sort((a,b) => {
       if (sortOption === 'earliest') {
        // 第1優先：出勤時間が早い順
        const timeDiff = a.minStart.localeCompare(b.minStart);
        
        // 時間が異なる場合は、その差で決定
        if (timeDiff !== 0) return timeDiff;
        
        // 第2優先：時間が同じならID順
        return a.id.localeCompare(b.id);

    } else {
        //第1優先：退勤時間が遅い順（降順）
        const timeDiff = b.maxEnd.localeCompare(a.maxEnd);
        
        if (timeDiff !== 0) return timeDiff;
        
        //第2優先：時間が同じならID順
        return a.id.localeCompare(b.id);
    }
    });
    setdisplayOrder(workerList.map(w => ({id:w.id,name:w.name})));
  },[shifts,sortOption]);


  //従業員の入れ替え
  const handleChangeWorker = (oldId: string, newWorker: any) => {
  const oldWorker = allWorkers.find((w: any) => String(w.id) === oldId);
  const newId = String(newWorker.id);

  const isAlreadyOnPitch = displayOrder.some((emp:any) => emp.id === newId);

  if (isAlreadyOnPitch) {
    
    // 1. localShifts の worker_id を一時的に退避させて入れ替え
    setLocalShifts((prev:any) => prev.map((shift:any) => {
      if (String(shift.worker_id) === oldId) return { ...shift, worker_id: newId  ,従業員: { ...shift.従業員, id: newId, name: newWorker.name }};
      if (String(shift.worker_id) === newId) return { ...shift, worker_id: oldId ,従業員: { ...shift.従業員, id: oldId, name: oldWorker?.name || '不明' }};
      return shift;
    }));

    // 2. displayOrder の名前部分も入れ替え
    setdisplayOrder((prev:any) => prev.map((emp:any) => {
      if (emp.id === oldId) return { id: newId, name: newWorker.name };
      if (emp.id === newId) {
        const oldWorker = allWorkers.find((w:any) => String(w.id) === oldId);
        return { id: oldId, name: oldWorker?.name || '不明' };
      }
      return emp;
    }));

  } else {
    // 新しい人をシフトに入れる
    setLocalShifts((prev:any) => prev.map((shift:any) => 
      String(shift.worker_id) === oldId ? { ...shift, worker_id: newId, 従業員:{...shift.従業員,id:newId,name:newWorker.name || '不明'}} : shift
    ));
    setdisplayOrder((prev:any) => prev.map((emp:any) => 
      emp.id === oldId ? { id: newId, name: newWorker.name } : emp
    ));
  }
  setIsDirty(true);
    };


    const handleCanvasRightClick = (e:React.MouseEvent,worker:any) => {
        if(!containerRef.current) return;
    
        //クリックした行の横幅と位置を取得
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
    
        const clickPercent = x/rect.width;
        const clickedMinutes = clickPercent * TOTAL_MINUTES;
    
        const snappedMinutes = Math.floor(clickedMinutes / 30) * 30;
    
        const startTime = addMinutesToTime("05:00", snappedMinutes);
        const endTime = addMinutesToTime(startTime,60);
        
        
    
        setNewShiftPicker({
            x:e.clientX,
            y:e.clientY,
            worker,
            startTime,
            endTime
        });
        };


  //シフトバーの削除 
  useEffect(() => {
    const handleKeyDown = async (e:KeyboardEvent) => {
        if (hoveredIds && (e.key === 'Backspace' || e.key === 'Delete')) {
            //入力中は何もしない
            if(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            if(window.confirm(`このシフトを削除しますか？`)){
                await handleDelete(hoveredIds);
                setHoveredIds(null);
            }
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown)
  },[hoveredIds]);


  

  const handleDelete = (idsDelete: string[]) => {
    setLocalShifts((prev:any) => prev.filter((s:any) => !idsDelete.includes(s.id)));
    setIsDirty(true);
  }

  


  //シフトが変わったらローカルシフトへ保存
  useEffect(() =>{
    if(isDirty || isSaving) return;
    setIsLoading(true);
    setLocalShifts(shifts || []);
    setIsLoading(false);
  },[targetDate]);



  useEffect(() => {
    if(!resizing) return;

    const handleMouseMove = (e:MouseEvent) => {
        const elementMouseIsOver = document.elementFromPoint(e.clientX,e.clientY)
        const currentRow = elementMouseIsOver?.closest('.worker-row');

        if(currentRow) {
            const name = currentRow.getAttribute('data-worker-name');
            const id = currentRow.getAttribute('data-worker-id')

            if( id && name){
                hoveredWorkerRef.current = {id, name};
            }
        }
        setResizing((prev:any) => prev ? { ...prev, currentX:e.clientX,currentY:e.clientY} : null); 
    };

    const handleMouseUp = async (e:MouseEvent) => {
        if (!resizing || !containerRef.current) return;
        const {shift:initialShift,direction} = resizing;//oldshiftは掴んだ瞬間の古いデータ

        const currentshift = localShifts.find((s:any) => String(s.id) === String(initialShift.id) ) || initialShift

        if(!currentshift){
            setResizing(null);
            return
        }

        
        
        //  移動距離（px）を計算    
        const deltaX = e.clientX -resizing.initialX;
        
        //距離を「30分単位」に変換
        const fullWidth = containerRef.current?.offsetWidth - 280;
        const gridWidth = fullWidth/19/2;
        const diffSteps = Math.round(deltaX / gridWidth)

        let newStart = initialShift.start_time;
        let newEnd = initialShift.end_time;
        let targetWorker = currentshift.worker_id;
        let targetWorkerObj = currentshift.従業員;
        
        if(direction === 'move'){
            newStart = addMinutesToTime(initialShift.start_time,diffSteps*30);
            newEnd = addMinutesToTime(initialShift.end_time,diffSteps*30);

            if(hoveredWorkerRef.current){
                targetWorker = hoveredWorkerRef.current.id;
                targetWorkerObj = { id:hoveredWorkerRef.current.id,name: hoveredWorkerRef.current.name};
            }   
        }else if(direction === 'right'){
                newEnd = addMinutesToTime(initialShift.end_time,diffSteps*30);
        } else if(direction === 'left') {
                newStart = addMinutesToTime(initialShift.start_time,diffSteps*30)
        }
       
        if (newStart < newEnd) {
            // ① まず、動かしているバー（自分）をリストから完全に消去する
            
            const baseShifts = localShifts.filter((s:any) => !initialShift.ids.includes(s.id));
            // ② 移動先のスタッフのデータだけを抽出する
            const otherWorkersShifts = baseShifts.filter((s:any) => String(s.worker_id) !== String(targetWorker));
            const targetWorkerShifts = baseShifts.filter((s:any) => String(s.worker_id) === String(targetWorker));
            // ③ 移動先の行のデータだけをブルドーザーにかける
            const updatedTargetShifts = applyBulldozer(targetWorkerShifts,{
                ...initialShift,
                worker_id:targetWorker,
                従業員:targetWorkerObj,
                date:currentshift.date,
                task_id:currentshift.task_id,
                start_time:newStart.slice(0, 5),
                end_time: newEnd.slice(0, 5)
            });
            setLocalShifts([...otherWorkersShifts, ...updatedTargetShifts]);
            setIsDirty(true);
            
            
        }
        setResizing(null);
        hoveredWorkerRef.current = null;
    };


    window.addEventListener('mousemove',handleMouseMove);
    window.addEventListener('mouseup',handleMouseUp);
    return () => {
        window.removeEventListener('mousemove',handleMouseMove);
        window.removeEventListener('mouseup',handleMouseUp);
    };
  },[resizing]);

   useEffect(() => {
            if (isDirty) {
                window.onbeforeunload = () => true;
            } else {
                window.onbeforeunload = null;
            }
            return () => { window.onbeforeunload = null; }
        }, [isDirty]);


  const [mounted,setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  },[]);
  if (!mounted) return null;



  {/*---------------------スタイルの開始------------------------*/}
  return (
    
    <div className={`overflow-x-auto border border-gray-300 rounded-lg  ${resizing ? 'select-none' : ''}`}
        style={{height:`calc(100vh - ${headerHeight}px)`}}
    >
        <div
            className="min-w-300 bg-white relative" ref={containerRef} 
            style={{
                display:'grid',
                gridTemplateRows: `70px repeat(${displayOrder.length}, 64px)`,
                //maxHeight:`${maxGridHeight}px`,
            }}
        >
            
            
            {/* --- 時間見出し (19個の枠を作る) --- */}
            <div className="grid grid-cols-[280px_repeat(19,1fr)] border-b bg-gray-100 sticky top-0 z-30 " >

                <div className='flex items-center justify-between p-3 border-r font-bold text-gray-700 bg-gray-200 sticky top-0 left-0 z-50'>
                    <span className='text-sm'>スタッフ</span>
                
                    {/*  スタッフ追加ボタン行 --- */}
                    
                    <div className="p-2  flex items-center justify-center sticky left-0 z-10">
                        <button
                            onClick={(e) =>{
                                const rect = e.currentTarget.getBoundingClientRect();
                                setShowWorkerAddMenu ({x:rect.left,y:rect.bottom})}}
                            className='p-1  text-blue-500 rounded-md hover:border-blue-500 hover:text-blue-600 transition-all active:scale-90 flex items-center justify-center hover:scale-110 cursor-pointer hover:bg-blue-50'
                        >
                            <PersonAddIcon/>
                        </button>
                    </div>
                    
                
                </div>
                {hours.map((h, i) => {

                    const time00 = `${String(h).padStart(2, '0')}:00`;
                    const time30 = `${String(h).padStart(2, '0')}:30`;

                    const requirementsTaskIds = (time:string) => {
                        const required = (taskRequirements || [])
                            .filter((req:any) => time >= req.start_time?.slice(0,5) && time < req.end_time?.slice(0,5))
                            .map((req:any) => req.task_id);

                        const assigned = localShifts
                            .filter((s:any) => time >= s.start_time?.slice(0,5) && time < s.end_time?.slice(0,5))
                            .map((s:any) => s.task_id);

                        return required.filter((id:any) => !assigned.includes(id));
                    };
                    
                    const missingInHour = Array.from(new Set([
                        ...requirementsTaskIds(time00),
                        ...requirementsTaskIds(time30)
                    ]));

                    
                    
                    

                    return i < 19 ? (
                        <div key={h} className="p-2 text-center border-r text-base font-bold text-gray-600 relative flex flex-col items-center justify-between min-w-20 ">
                            {/* 上段：時間表示 */}
                            <div className="leading-tight">
                                {h}:00
                            </div>
                            
                            {/*  下段：不足シンボルエリア */}
                            <div className={`flex gap-1 h-6 mt-1 items-center justify-start  bg-white rounded-md border border-gray-200 px-2 shadow-inner overflow-x-auto  flex-nowrap w-full max-w-23  no-scrollbar`}>
                                
                                {missingInHour.length > 0 ? (
                                    missingInHour.map((tid:any) => (
                                        <div 
                                            key={tid}
                                            className="w-5 h-5 rounded-full  shadow-sm border-2 border-white shrink-0 cursor-pointer"
                                            /*  taskColors[tid] で業務の色を引く */
                                            style={{ backgroundColor: taskColorMap[tid].color || '#cbd5e1' }}
                                            title={`${taskColorMap[tid].name} が不足`}
                                            
                                        />
                                    ))

                                ) :(<div className='bg-black'></div>)
                                }
                            </div>
                        </div>
                    ) : null;
                })}
            </div>   
            
            {/*チャートエリア*/}
            <div ref={containerRef} className='flex-1 '>
                
                {displayOrder.map((empData:any) => {
                    const empShifts = localShifts.filter((s:any) => String((s.従業員?.id)) === String(empData.id));
                    console.log('empshift',empShifts)
                
                    
                    return<StaffRow key={empData.id} empData={empData} empShifts={empShifts} handleCanvasRightClick={handleCanvasRightClick}/>
                    
                    
            })}
            </div>    
    
        </div>

        

        

        
        <>
        {/*メニュー*/}
        <AddNewBar tasks = {tasks} newShiftPicker={newShiftPicker} setNewShiftPicker = {setNewShiftPicker} targetDate={targetDate}/>
        <EditBarModal tasks = {tasks} editingShift={editingShift} setEditingShift = {setEditingShift}/>
        <ChangeWorkerMenu editingWorkerId={editingWorkerId} setEditingWorkerId={setEditingWorkerId} handleChangeWorker = {handleChangeWorker}/>
        <AddNewWorker showWorkerAddMenu={showWorkerAddMenu} setShowWorkerAddMenu={setShowWorkerAddMenu} availableWorkers={availableWorkers} setManualWorkers={setManualWorkers}/>
        <MenuAnchor menuAnchor={menuAnchor} setEditingShift={setEditingShift} handleDelete={handleDelete}/>
        </>

        {isLoading && (
                <div className="fixed inset-0 bg-white/60 z-50 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
                </div>
            )}

    </div>

    
  );
}