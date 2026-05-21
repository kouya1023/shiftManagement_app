import { useShift } from '../shiftContext';
import { mergeContinuousShifts,getMinutesFromStart,getShiftBounds} from '../../utils';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import DeleteIcon from '@mui/icons-material/Delete';
import React,{ memo, useMemo } from 'react';


export const StaffRow = memo(({empData,empShifts,handleCanvasRightClick}:{empData:any,empShifts:any,handleCanvasRightClick:any}) => {

    const {initialReqHolWorkers,staffAnalysys,filteredIDNAWorkers,handleOpenExchange,handleDeleteWorker,TOTAL_MINUTES,resizing,containerRef,setHoveredIds,setMenuAnchor,setResizing,startResizing,allWorkers, activeGridIndex,availabilityMap} = useShift()

    
    
    const workerObj = allWorkers.find((s:any) => String(s.id) === String(empData.id));//新規バー追加用判別変数
    
    const mergedShifts = useMemo(() => {
       return mergeContinuousShifts(empShifts);
    },[empShifts]) 
    
    const isReqestHoliday = initialReqHolWorkers.some((w:any) => String(w) === String(empData.name))
    const isDayNotAvailable = filteredIDNAWorkers.some((w:any) => String(w) === String(empData.name))
    if (!workerObj) return null;
    const analysys = staffAnalysys.get(String(workerObj.id));
    const displayAvailability = availabilityMap[workerObj.id]?.text || "未設定";

    let statusBgColor = "bg-gray-100";
    let statusLabel = "";

    if (isReqestHoliday){
        statusBgColor = "bg-red-100";
        statusLabel = '⚠️希望休';
    } else if(isDayNotAvailable) {
        statusBgColor = "bg-orange-100"; 
        statusLabel = "⚠️固定休";
    }
    
    const  empAvailability = availabilityMap[workerObj.id]
    
    const isInvalidRange = () => {

        if(empAvailability?.type === 1 || isReqestHoliday) return true
        if(empAvailability?.type === 2) {
            const bounds = getShiftBounds(empShifts);
            console.log(bounds?.minStart,empAvailability.start)
            if(!bounds) return false;



            return getMinutesFromStart(bounds.minStart) < getMinutesFromStart(empAvailability.start) || 
                    getMinutesFromStart(bounds.maxEnd) > getMinutesFromStart(empAvailability.end);
            
        }
        return false;
    };

    const flagIsInvalidRange = isInvalidRange();

    


    

    return (
        
        <div key={empData.id} className="grid grid-cols-[280px_1fr] border-b border-gray-600 h-16 group hover:bg-blue-50/40 transition-colors worker-row"
            data-worker-name = {workerObj?.name}
            data-worker-id={workerObj?.id}
            
        >
            
            <div className={`left-0 min-w-50 shrink-0 h-full flex w-full items-stretch  pr-3 justify-between bg-clip-padding transition-colors  ${statusBgColor} shadow-[2px_0_5px_rgba(0,0,0,0.05)]`}>
                {/* 名前エリア  */}
                <div className="flex flex-col min-w-0 flex-1 ">
                    <div className="pl-4 font-black text-gray-900 flex items-center  truncate min-w-0 flex-1  " >
                        {workerObj.name}
                        
                    </div>
                    

                    {/* 🚩 休日ラベル（小さな文字で補足） */}
                    {statusLabel && (
                    <span className={`text-sm text-black font-bold uppercase leading-none opacity-70 relative -top-1.5 pl-2`}>
                        {statusLabel}
                    </span>
                    )}


                </div>
                {/* 2. 右側：動的切り替えエリア */}
                <div className="group/actions relative flex items-center  justify-end w-50 shrink-0  h-full ">
                    
                    {/*  非ホバー時：労働時間などの情報 */}
                    <div className="block group-hover/actions:hidden text-right ">
                        <div className="grid grid-cols-[2.5fr_1fr] gap-x-3 gap-y-0.5">
                            {/* 左列：勤務時間・労働可能時間 */}
                            <div className='flex flex-col items-end border-r border-gray-200 pr-2'>
                            
                                <div className="leading-none text-right mt-1">
                                    <p className={`text-[19px] font-mono font-medium ${flagIsInvalidRange ? 'text-red-600' : 'text-indigo-600'}`}>
                                        {analysys?.range || '割り当てなし'}
                                    </p>
                                    
                                </div>
                                
                                <div className="leading-none text-start mt-1">
                                    
                                    <p className="text-[14px] font-mono font-bold text-gray-500">{displayAvailability}</p>
                                </div>
                            </div>
                            
                            
                            {/* 右列：日労働時間・月労働時間 */}
                            <div className="flex flex-col items-end">
                                <div className="leading-none text-right">
                                    <p className="text-[10px] text-gray-600 font-bold pt-1">TODAY</p>
                                    <p className="text-lg font-mono font-bold text-emerald-600">
                                        {analysys?.hours || 0}h
                                    </p>
                                </div>

                                <div className="leading-none text-right">
                                    {/*<p className="text-[10px] text-gray-600 font-bold">MONTH</p>*/}
                                    <p className="text-sm font-mono font-bold text-gray-500">120.50h</p>
                                </div>
                                
                            </div>
                        </div>
                    </div>

                    {/*  ホバー時：変更・削除ボタン（group-hover で出す） */}
                    <div className="hidden group-hover/actions:flex items-center gap-1">
                        <button 
                            onClick={(e) => handleOpenExchange(e,String(workerObj.id),workerObj.name)}
                            className="p-1 hover:bg-white rounded shadow-sm text-blue-500 bg-gray-100 transition-all cursor-pointer"
                            title="従業員を変更"
                        >
                            <SwapHorizIcon fontSize="small" />
                            
                        </button>
                        <button 
                            onClick={() => handleDeleteWorker(workerObj.id)}
                            className="p-1 hover:bg-white rounded shadow-sm text-red-500 bg-gray-100 transition-all cursor-pointer"
                            title="行を削除"
                        >
                            <DeleteIcon fontSize="small" />
                        </button>
                    
                    </div>

                </div>
            
            
            
            </div>
            
            {/* バー表示エリア */}
            <div 
            className="relative w-full h-full"
            onContextMenu={(e) => {
                if(workerObj) {
                    e.stopPropagation()
                    e.preventDefault()
                    handleCanvasRightClick(e,workerObj);
                }
            }}
            >
                
                
                
                {/* 背景のグリッド線（19分割） */}
                <div 
                className="absolute inset-0 grid pointer-events-none"
                style={{ gridTemplateColumns: 'repeat(38, minmax(0, 1fr))'}}
                >
                {Array.from({ length: 38 }).map((_, i) => {
                    const isActive = activeGridIndex === i;
                    return(
                    <div 
                        key={i} 
                        className={`
                            h-full border-r 
                            ${isActive
                            ? 'border-red-500 border-solid z-40 opacity-100'
                            : (i % 2 === 1 
                                ? 'border-gray-500' // 🚩 （30分）は「点線」で「薄く」
                                : 'border-gray-300 border-dashed'// （00分）は「実線」で「濃く」
                            )
                            }
                        `}
                        style={{
                        // 赤い線の時は少し太く（2px）するとより見やすいです
                        borderRightWidth: isActive ? '2px' : '1px'
                        }} 
                    />
                    );
                })}
                </div>

                {/* 結合済みのシフトバー */}
                
                {mergedShifts.map(shift => {
                const startMin = getMinutesFromStart(shift.start_time);
                const endMin = getMinutesFromStart(shift.end_time);

                let leftPercent = (startMin / TOTAL_MINUTES) * 100
                let widthPercent = ((endMin - startMin)/ TOTAL_MINUTES) * 100
                

                const isResizingThis = resizing?.shift.ids.join('-') === shift.ids.join('-')
                const deltaY = isResizingThis && resizing ? resizing.currentY - resizing.initialY:0;

                if(isResizingThis && resizing) {
                    //マウスが動いた距離を計算
                    const deltaX = resizing?.currentX - resizing?.initialX;

                    const chartAreaWidth = (containerRef.current?.offsetWidth || 0) - 280;

                    if(chartAreaWidth > 0){
                        const deltaPercent = (deltaX / chartAreaWidth) * 100;

                        if(resizing.direction === 'right'){
                            //右端を伸ばす
                            widthPercent = Math.max(2,widthPercent + deltaPercent);
                        } else if(resizing.direction === 'left'){
                            //左端を伸ばす
                            leftPercent = leftPercent + deltaPercent;
                            widthPercent = Math.max(2,widthPercent - deltaPercent)
                        }else if(resizing.direction === 'move'){
                            leftPercent = leftPercent + deltaPercent;
                        }
                        }
                    }
                
                const isReallyMoving = isResizingThis && resizing && (Math.abs(resizing?.currentX - resizing?.initialX) > 5 || Math.abs(resizing.currentY - resizing.initialY) > 5);

                
                return (
                    <div
                        key={shift.ids.join('-')}

                        //マウスが乗った時、離れた時の処理
                        onMouseEnter={() => setHoveredIds(shift.ids)}
                        onMouseLeave={() => setHoveredIds(null)}
                        onContextMenu={(e) =>{
                            e.preventDefault();
                            e.stopPropagation();
                            setMenuAnchor({ x:e.clientX,y:e.clientY,shift:shift});
                        }}
                        onMouseDown={(e) => {
                            e.stopPropagation();
                            setResizing({
                                shift:shift,
                                direction:'move',
                                initialX: e.clientX,
                                initialY:e.clientY,
                                currentX:e.clientX,
                                currentY:e.clientY
                            });
                        }}
                        className={`
                            absolute h-10 top-3 rounded-md px-2 text-[13px] flex flex-col justify-center text-black shadow-md border border-white/20 z-20 hover:z-30 cursor-pointer overflow-hidden hover:ring-2
                            ${isReallyMoving ? 'pointer-events-none opacity-60 z-50' : 'transition-all duration-200'}
                            `}
                        style={{
                            left: `${leftPercent}%`,
                            width: `${widthPercent}%`,
                            backgroundColor: shift.業務?.color || '#3b82f6',
                            transform: isResizingThis ? `translateY(${deltaY}px)` : 'none',
                            pointerEvents: isReallyMoving ? 'none' : 'auto',
                            zIndex: isResizingThis ? 100 : 20,
                            transition: resizing ? 'none' : 'all 0.2s',
                        }}
                        title={`${shift.業務?.name || '業務'}: ${shift.start_time}-${shift.end_time}`}
                        >


                        

                        
                        {/* 左側のハンドル */}
                        <div 
                            className="absolute left-0 top-0 w-4 h-full cursor-ew-resize hover:bg-black/20 z-30"
                            onMouseDown={(e) => {
                                e.stopPropagation();
                                startResizing(e, shift, 'left')
                            }}
                        />

                        {/* バーの中身（業務名など） */}
                        <div className="font-bold truncate pointer-events-none select-none">
                            {shift.業務?.name}
                        </div>

                        {/* 右側のハンドル */}
                        <div 
                            className="absolute right-0 top-0 w-4 h-full cursor-ew-resize hover:bg-black/20 z-30"
                            onMouseDown={(e) => {
                                e.stopPropagation();
                                startResizing(e, shift, 'right')
                            }}
                        />
                    
                    
                    </div>
                );
                })}
            </div>
        </div>
    )});