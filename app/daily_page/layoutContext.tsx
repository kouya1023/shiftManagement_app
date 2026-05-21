'use client'
import React,{createContext,useContext,useState} from "react"

const LayoutContext = createContext<{
    headerHeight : number;
    setHeaderHeight : (h:number) => void;
} | null>(null)

export function LayoutProvider({children} : {children:React.ReactNode}) {
    const [headerHeight,setHeaderHeight]  = useState(200)

    return (
        <LayoutContext.Provider value = {{headerHeight,setHeaderHeight}}>
            {children}
        </LayoutContext.Provider>
    )
}

export const useLayout = () => {
    const context = useContext(LayoutContext)
    if (!context) throw new Error("useLayout must be used within layoutProvider")
    return context
}

