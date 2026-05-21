'use client'

import { useShift } from "../shiftContext"

interface ChangeWorkerMenuProps {
    editingWorkerId:any
    setEditingWorkerId:any
    handleChangeWorker:any
}

export const ChangeWorkerMenu  = ({
    editingWorkerId,
    setEditingWorkerId,
    handleChangeWorker

}:ChangeWorkerMenuProps) => {

    const {absentWorkers,displayOrder} = useShift()

    if(!editingWorkerId) return null
    return (
    
    <>
        <div className="fixed inset-0 z-100" onClick={() => setEditingWorkerId(null)}>
            <div 
                className="fixed z-100 bg-white rounded-xl shadow-2xl w-72 overflow-hidden animate-in fade-in zoom-in duration-150"
                style={{
                    left: Math.min(editingWorkerId.x, window.innerWidth - 280), 
                    
                    top: editingWorkerId.y > window.innerHeight - 600
                    ? 'auto' 
                    : editingWorkerId.y + 5,
                    bottom: editingWorkerId.y > window.innerHeight - 600
                    ? window.innerHeight - (editingWorkerId.y - 45) 
                    : 'auto',
                }}
            
                >
                <div className="p-4 border-b bg-white flex flex-col gap-1">
                    {/* 小さなラベル */}
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Change Employee
                    </span>
                    {/* 強調された名前 */}
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
                            <span className="w-1 h-5 bg-blue-600 rounded-full"></span> 
                            {editingWorkerId.name}
                        </h3>
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full border border-blue-100">
                            現在の選択
                        </span>
                    </div>
                </div>

                <div className="p-4 max-h-96 overflow-y-auto">

                    {/* 未配置 */}
                    <div className="mb-4">
                        <h4 className="text-lg font-bold text-green-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> 未配置
                        </h4>
                        <div className="space-y-1">
                            {absentWorkers.map((w:any) => (
                            <button
                                key={w.id}
                                onClick={() => { handleChangeWorker(editingWorkerId.id, w); setEditingWorkerId(null); }}
                                className="w-full text-left p-2 rounded-md hover:bg-green-50 border border-transparent hover:border-green-200 transition-all flex justify-between items-center group"
                            >
                                <span className="text-base text-gray-600 font-bold">{w.name}</span>
                            </button>
                            ))}
                        </div>
                    </div>

                    {/* 配置済み）入れ替え用 */}
                    <div>
                        <h4 className="text-lg font-bold text-blue-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span> 配置済み（ポジション入替）
                        </h4>
                        <div className="space-y-1">
                            {displayOrder.filter((w:any) => String(w.id) !== editingWorkerId.id).map((w:any) => (
                            <button
                                key={w.id}
                                onClick={() => { handleChangeWorker(editingWorkerId.id, w); setEditingWorkerId(null); }}
                                className="w-full text-left p-2 rounded-md hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all flex justify-between items-center group"
                            >
                                <span className="text-base font-bold text-gray-600">{w.name}</span>
                            </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
    )
        }