'use client'
import { useShift } from "../shiftContext";


interface AddNewWorkerProps {
    showWorkerAddMenu:any
    setShowWorkerAddMenu:any;
    availableWorkers:any
    setManualWorkers:any
}

export const  AddNewWorker = ({
    showWorkerAddMenu,
    setShowWorkerAddMenu,
    availableWorkers,
    setManualWorkers
    
}:AddNewWorkerProps) => {

    const {setdisplayOrder} = useShift();
    
     
    if (!showWorkerAddMenu) return null;
    return (
        <>
                <div className='fixed inset-0 z-90' onClick={() => setShowWorkerAddMenu(null)} />   
                <div    
                    className='fixed z-90 bg-white shadow-2xl rounded-xl border border-gray-200 p-2 min-w-48 max-h-60 overflow-y-auto animate-in fade-in zoom-in duration-100'
                    style={{
                        top:showWorkerAddMenu.y + 5,
                        left:showWorkerAddMenu.x
                    }}
                >
                    <p className='text-xs font-black text-gray-400 px-2 py-1 uppercase tracking-widest border-b mb-1'>追加するスタッフを選択</p>   
                    {availableWorkers.length === 0 ? (
                        <p className='p-2 text-xs text-gray-400 italic'>追加できるスタッフはいません</p>
                    ) : (
                        availableWorkers.map((worker:any) => (
                            <button
                                key = {worker.id}
                                onClick={() => {
                                    setManualWorkers((prev:any) => [...prev,worker]);
                                    setShowWorkerAddMenu(null);
                                    setdisplayOrder((prev:any) => {
                                        const workerIdStr = String(worker.id);
                                        if(prev.some((item:any) => String(item.id) === workerIdStr)){
                                            return prev
                                        }
                                        return [{
                                            id:workerIdStr,
                                            name:worker.name
                                        },...prev];
                                    });
                                }}
                                className='w-full text-left px-3 py-2 text-base font-bold text-gray-700 hover:bg-blue-50 rounded-lg transition-colors'
                            >
                                 {worker.name}
                            </button>
                        ))
                    )}
                    </div>       
            </>
            
            
            


               
        );
    
    }
    