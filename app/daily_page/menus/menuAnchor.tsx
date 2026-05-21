'use client'
import { useShift } from "../shiftContext";


interface MenuAnchorProps {
    menuAnchor:any
    setEditingShift:any;
    handleDelete:any
    
}

export const  MenuAnchor = ({
    menuAnchor,
    setEditingShift,
    handleDelete,
    
}:MenuAnchorProps) => {

    const {closeMenu} = useShift();
    
     
    if (!menuAnchor) return null;
    return (
        <>
                {/* 背景をクリックしたら閉じるための透明なカバー */}
                <div className="fixed inset-0 z-40" onClick={closeMenu} />
        
                {/* 選択メニュー本体 */}
                <div 
                className="fixed z-50 bg-white shadow-2xl rounded-xl border border-gray-200 p-1 min-w-30"
                style={{ top: menuAnchor.y, left: menuAnchor.x }}
                >
                    {/* 編集ボタン */}
                    <button
                    onClick={() => {
                        setEditingShift(menuAnchor.shift);
                        closeMenu();
                    }}
                    className="w-full flex items-center px-3 py-2 text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                    >
                    ✏️ 編集する
                    </button>
        
                    {/* 削除ボタン */}
                    <button
                        onClick={async () => {
                            const ids = menuAnchor.shift.ids || [menuAnchor.shift.id];
                            await handleDelete(ids)
                            
                            closeMenu()
                        }}
                        className="w-full flex items-center px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                    🗑️ 削除する
                    </button>
                </div>
                </>
            
            
            


               
        );
    
    }
    