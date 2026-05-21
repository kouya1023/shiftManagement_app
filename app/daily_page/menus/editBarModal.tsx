'use client'

import { applyBulldozer } from "@/app/utils"
import { useShift } from "../shiftContext"

interface EditBarModalProps {
    editingShift:any
    setEditingShift:any
    tasks:any
}

export const  EditBarModal = ({
    editingShift,
    tasks,
    setEditingShift
}:EditBarModalProps) => {

    const {localShifts,setLocalShifts,setIsDirty,} = useShift();
    if(!editingShift) return null;  

    return (


    
    <div className="fixed inset-0 bg-black/60 z-100 flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-gray-200 animate-in fade-in zoom-in duration-200">
        <h2 className="text-xl font-black mb-4 flex items-center gap-2 text-gray-800">
            <span className="text-blue-600">📝</span> シフト編集
        </h2>
        
        <form onSubmit={ (e) => {

            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const start = formData.get('start_time') as string;
            const end = formData.get('end_time') as string;
            const taskId = formData.get('task_id') as string;

            const selectedTask = tasks.find((t:any) => String(t.id) === String(taskId));
            

            if(start >= end){
                alert("⚠️ エラー：不正な時間設定です。")
                return;
            }

            const nextState = applyBulldozer(localShifts, {
            ids: editingShift.ids || [editingShift.id],
            worker_id: editingShift.worker_id,
            date: editingShift.date,
            task_id: taskId,
            start_time: start,
            end_time: end,
            業務:selectedTask
            });
        
            
            setLocalShifts(nextState);
            setIsDirty(true);

            setEditingShift(null);
            }}
        >
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 ">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">スタッフ</p>
                <p className="font-black text-gray-800 text-xl ">
                    {editingShift.従業員?.name}
                </p>
                <label className="block text-base font-bold text-gray-500  ml-1 mb-1">業務の変更</label>
                <select
                    name="task_id"
                    defaultValue={editingShift.task_id}
                    className='w-full p-2 bg-white border-2 text-black border-gray-200 rounded-lg font-bold text-base focus:border-blue-500 outline-none transition-all'
                >
                    {tasks.map((task:any) =>(
                        <option key={task.id} value={task.id}>
                            {task.name}
                        </option>
                    
                    ))}
                    
                </select>  
                
            </div>



            
            {/* 時間設定エリア */}
            <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
                <label className="block text-base font-bold text-gray-500 ml-1">開始時間</label>
                <input 
                name="start_time" 
                type="time" 
                defaultValue={editingShift.start_time.slice(0,5)} 
                className="w-full p-3 border-2 border-gray-500 text-black rounded-xl font-mono font-bold focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                />
            </div>
            <div className="space-y-1">
                <label className="block text-base font-bold text-gray-500 ml-1">終了時間</label>
                <input 
                name="end_time" 
                type="time" 
                defaultValue={editingShift.end_time.slice(0,5)} 
                className="w-full p-3 border-2 border-gray-100 text-black rounded-xl font-mono font-bold focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                />
            </div>
            </div>

            
            <div className="flex gap-3 pt-4">
            <button 
                type="submit" 
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-blue-200 active:scale-95"
            >
                保存する
            </button>
            <button 
                type="button" 
                onClick={() => setEditingShift(null)} 
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-4 rounded-2xl transition-all active:scale-95"
            >
                キャンセル
            </button>
            </div>
        
        </form>
        </div>
                
    </div>
    )
    }
       