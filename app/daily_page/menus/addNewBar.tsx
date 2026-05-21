'use client'

import {useState} from "react";
import { applyBulldozer} from "@/app/utils";
import { createTaskAction} from '../actions';
import { useShift } from "../shiftContext";




interface AddNewBarProps {
    tasks:any[];
    newShiftPicker:any;
    setNewShiftPicker:any;
    targetDate:any
}

export const  AddNewBar = ({
    tasks,
    newShiftPicker,
    setNewShiftPicker,
    targetDate
}:AddNewBarProps) => {

    const [showNewTaskForm,setShowNewTaskForm] = useState(false);
    const [newTaskName,setNewTaskName] = useState('');
    const [newTaskColor,setNewTaskColor] = useState('#3b82f6');
    const {localShifts,setLocalShifts,setIsDirty} = useShift();
    
     
    if (!newShiftPicker) return null;
    return (
        <>
        {/*背景をクリックしたら閉じる透明カバー*/}
        <div className="fixed inset-0 z-60" onClick={() => setNewShiftPicker(null)}/>

        {/*業務選択バー*/}
        <div
            className='fixed z-70 bg-white shadow-2xl rounded-2xl border-gray-200 p-2 flex flex-col gap-1 min-w-40 animate-in fade-in zoom-in duration-100 max-h-75 overflow-y-auto custom-scrollbar'
            style={{top:newShiftPicker.y, left:newShiftPicker.x,transform: newShiftPicker.y > window.innerHeight - 350 ? 'translateY(-100%)' : 'none',}}
        >
            <p className='text-base font-black text-gray-400 px-2 py-1 uppercase tracking-widest'>業務を選択</p>
            {tasks.map(task => (
                <button
                    key={task.id}
                    onClick={() =>{
                        const timestamp = Date.now();
                        const newId = `new-${timestamp}`;

                        
                        //選んだ瞬間にブルドーザー
                        const nextState = applyBulldozer(localShifts, {
                            id: newId,
                            ids:[newId],
                            worker_id : newShiftPicker.worker.id,
                            date:targetDate,
                            start_time : newShiftPicker.startTime,
                            end_time : newShiftPicker.endTime,
                            task_id:task.id,
                            業務:task,
                            従業員:newShiftPicker.worker
                        });
                        console.log('nextstate',nextState)
                    
                    setLocalShifts(nextState);
                    setIsDirty(true);
                    setNewShiftPicker(null);//メニューを閉じる
                    }}
                    className='flex items-center gap-2 px-3 hover:bg-gray-50 rounded-lg transition-colors group text-left'
                >
                    <div className='w-3 h-3 rounded-full' style={{backgroundColor:task.color}}/>
                    <span className='font-bold text-gray-700 group-hover:text-blue-600'>{task.name}</span>
                </button>
            ))}


            <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                            onClick={() => setShowNewTaskForm(true)}
                            className='w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'
                            >
                                ＋ 新しい業務を追加    
                        </button>
            </div>  


            {showNewTaskForm && (
                <div className='border-t border-gray-100 p-2 flex flex-col gap-2'>
                    <input
                        type='text'
                        placeholder='業務名'
                        value={newTaskName}
                        onChange={e => setNewTaskName(e.target.value)}
                        className='w-full p-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 outline-none focus:border-blue-400'
                    />
                    {/* カラーピッカー */}
                    <div className='flex items-center gap-2'>
                        <label className='text-xs font-bold text-gray-400'>色</label>
                        <input
                            type='color'
                            value={newTaskColor}
                            onChange={e => setNewTaskColor(e.target.value)}
                            className='w-8 h-8 rounded cursor-pointer border-none'
                        />
                        {/* デフォルトカラーの候補 */}
                            {['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6'].map(color => (
                            <button
                            key={color}
                            onClick={() => setNewTaskColor(color)}
                            className="w-6 h-6 rounded-full border-2 border-white shadow"
                            style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>
                    <button
                        onClick={async () => {
                            if(!newShiftPicker) return;
                            
                            const {startTime,endTime,worker} = newShiftPicker;
                            const targetId = `new-${Date.now()}`;
                            const result = await createTaskAction({name:newTaskName,color:newTaskColor});
                            
                            if(!result.success || !result.data){
                                alert("業務の追加に失敗しました");
                                return;
                            }
                            const createdTask = result.data;
                            
                            //返ってきたtask_idでバーを追加
                            const nextState = applyBulldozer(localShifts, {
                                id:targetId,
                                ids:[targetId],
                                worker_id: worker.id,
                                date: targetDate,
                                start_time: startTime,
                                end_time : endTime,
                                task_id : createdTask.id,
                                業務:createdTask,
                                従業員:worker,

                            });
                            setLocalShifts(nextState);
                            setIsDirty(true);
                            setNewShiftPicker(null);
                            setShowNewTaskForm(false);
                            setNewTaskName('');
                            setNewTaskColor('#3b82f6');
                            setShowNewTaskForm(false);


                        }}
                        className='bg-blue-600 text-white font-bold py-2 rounded-lg text-sm'
                    >
                        追加する
                    </button>
                </div>
            )}

        </div>
            
        </>
            
            
            


               
        );
    
    }
    