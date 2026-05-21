'use client'
import { totalmem } from 'os'
import React, {createContext,useContext,useMemo,useState,useRef} from 'react'
import { getShiftRange,calculateTotalHoursDay,getMinutesFromStart,getMonthlyRange } from '../utils'



const ShiftContext = createContext<any>(null)

export function ShiftProvider({children,initialShifts,initialReqHolWorkers,availabilityData,allWorkers,taskRequirements,targetDate}: {children:React.ReactNode,initialShifts:any[],initialReqHolWorkers:any[],availabilityData:any[],allWorkers:any[],taskRequirements:any[],targetDate:any}) {
    
    const [localShifts,setLocalShifts] = useState<any[]>(initialShifts)
    const [isDirty,setIsDirty] = useState(false)
    const [isSaving,setIsSaving] = useState(false)
    const [isLoading,setIsLoading] = useState(false);
    
    const [sortOption,setSortOption] = useState<'id' | 'earliest' | 'latest'>('earliest')
    const [displayOrder,setdisplayOrder] = useState<Array<{id:string,name:string}>>([]) 
    const containerRef = useRef<HTMLDivElement>(null);
    const TOTAL_MINUTES = 19 * 60; // 5:00〜24:00 = 1140分
    
    const [editingWorkerId, setEditingWorkerId] = useState<{x:number,y:number,id:string,name:string}| null>(null);
    const [menuAnchor,setMenuAnchor] = useState<{x:number,y:number,shift:any} | null>(null);
    const [hoveredIds,setHoveredIds] = useState<string[] | null>(null);

   
    const justSavedRef = useRef(false);
    const dayNotAvailableWorkers = availabilityData
    ?.filter((d:any) => d.availability_type === 1)
    .map((d: any) => d.worker?.name)
    .filter(Boolean) || [];

    const absentWorkers = allWorkers.filter((worker:any) => 
    !displayOrder?.some((d:any) => String(d.id) === String(worker.id))
  );

  const filteredIDNAWorkers = dayNotAvailableWorkers.filter(
    (name:any) => !initialReqHolWorkers.includes(name)
  );

  const period = useMemo(() => {
      return getMonthlyRange(targetDate);
      }, [targetDate]);
  

  


    //シフトバーを動かすマウスの動きを追跡する
  const startResizing = (e: React.MouseEvent, shift: any, direction: 'left' | 'right') => {
  e.preventDefault();
  e.stopPropagation(); 
  setResizing({ shift, direction, initialX: e.clientX, currentX: e.clientX, initialY:e.clientY ,currentY:e.clientY});
  };

  


  


  const staffAnalysys = useMemo(() => {

    if(!localShifts) return new Map();
    const analysysMap = new Map();

    displayOrder.forEach((staff:any) => {
        const sId = String(staff.id);
        
        const range = getShiftRange(localShifts,sId);
        const hours = calculateTotalHoursDay(localShifts,sId)
        
        analysysMap.set(sId,{
            range:range || '未割り当て',
            hours:hours || 0
        });
        
    });
  
  return analysysMap;
  },[localShifts,displayOrder]);


    const handleOpenExchange = (e:React.MouseEvent,workerId:string,workerName:string) => {
        const rect = e.currentTarget.getBoundingClientRect();
        

        setEditingWorkerId({
            x:rect.left,
            y:rect.bottom,
            id:workerId,
            name:workerName
        });
        };

    //シフトチャート行削除
    const handleDeleteWorker = (workerId: string) => {
    if (!window.confirm("この従業員の行を削除しますか？（入力済みのシフトも消去されます）")) {
        return;
    }

    //  表示リスト（displayOrder）から削除
    setdisplayOrder((prev:any) => prev.filter((emp:any) => String(emp.id) !== String(workerId)));

    // シフトデータ（localShifts）からも削除
    setLocalShifts((prev:any) => prev.filter((shift:any) => String(shift.worker_id) !== String(workerId)));
    setIsDirty(true);
    };


    

    const  [resizing, setResizing] = useState<{
                shift: any;
                direction: 'left' | 'right' | 'move';
                initialX: number;
                currentX: number;
                initialY: number;
                currentY: number;
            } | null>(null);

    const closeMenu = () => setMenuAnchor(null);

    let activeGridIndex: number | null = null;
    if (resizing && containerRef.current) {
    const { shift, direction, initialX, currentX } = resizing;
    const deltaX = currentX - initialX;
    const fullWidth = containerRef.current.offsetWidth - 280;
    const gridWidth = fullWidth / 19 / 2; // 30分あたりのピクセル幅
    const diffSteps = Math.round(deltaX / gridWidth);
  
    // 基準（開始または終了）の時間をインデックスに変換
    const baseTime = direction === 'left' ? shift.start_time : shift.end_time;
    const baseMinutes = getMinutesFromStart(baseTime);
    const baseIndex = baseMinutes / 30;
  
    activeGridIndex = baseIndex + diffSteps - 1;
    }

    //出勤可能時間のマップ化
    const availabilityMap = useMemo(() => {
        const map : Record<string,{type:number;start:string,end:string,text:string}> = {};

        availabilityData?.forEach((d:any) => {
            const start = d.start_time?.slice(0,5) || "00:00";
            const end = d.end_time?.slice(0,5) || "23:59";

            let text = "";

            switch (d.availability_type) {
                case 0:
                    text = "フリー";
                    break;
                case 1:
                    text = " ";
                    break;
                case 2:
                    const start = d.start_time?.slice(0,5) || "--:--";
                    const end = d.end_time?.slice(0, 5) || "--:--";
                    text = `${start} 〜 ${end}`;
                    break;
                default:
                    text = "未設定";
            }
            map[d.worker_id] = {
                type:d.availability_type,
                start,
                end,
                text
            };
        });
        return map;
    },[availabilityData])
    

  
    
    

    return (
        <ShiftContext.Provider value={{localShifts,setLocalShifts,isDirty,setIsDirty,isSaving,setIsSaving,shifts:initialShifts,
        initialReqHolWorkers,dayNotAvailableWorkers,allWorkers,sortOption,setSortOption,displayOrder,setdisplayOrder,absentWorkers,
        filteredIDNAWorkers,taskRequirements,calculateTotalHoursDay,staffAnalysys,editingWorkerId, setEditingWorkerId,handleOpenExchange,
        handleDeleteWorker,containerRef,TOTAL_MINUTES,menuAnchor,setMenuAnchor,targetDate,
        resizing, setResizing,closeMenu,hoveredIds,setHoveredIds,startResizing,isLoading,setIsLoading, activeGridIndex, justSavedRef,availabilityMap}}>
            {children}
        </ShiftContext.Provider>
    )
}

export const useShift = () => useContext(ShiftContext)

