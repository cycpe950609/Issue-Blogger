"use client"
import React, { useState } from "react"


export const LoginStateContext = React.createContext({
    isLogin: false,
    setIsLogin: (val:boolean) => {},
    isOwner: false,
    setIsOwner: (val:boolean) => {},
})

export default function LoginStateProvider(props: {children: React.ReactNode}) {
    const [isLogin, setIsLogin] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    
    return  <LoginStateContext.Provider value={{
        isLogin: isLogin,
        setIsLogin: setIsLogin,
        isOwner: isOwner,
        setIsOwner: setIsOwner,
    }}>
        {props.children}
    </LoginStateContext.Provider>
}