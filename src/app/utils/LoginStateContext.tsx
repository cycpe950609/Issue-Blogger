"use client"
import React, { useEffect, useState } from "react"
import { getCookiesMgr } from "./cookiesMgr";
import { procResponse } from "./errorHandlerClient";
import { useRouter } from "next/navigation";
import { githubIsRepoOwner, githubValidateToken } from "./github";


export const LoginStateContext = React.createContext({
    isLogin: false,
    setIsLogin: (val:boolean) => {},
    isOwner: false,
    setIsOwner: (val:boolean) => {},
})

export default function LoginStateProvider(props: {children: React.ReactNode}) {
    const [isLogin, setIsLogin] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    
    const router = useRouter();
    useEffect(() => {
        const [cookies, setCookies] = getCookiesMgr();
        let check = async () => {
            if (cookies.has("access_token")) {
                //TODO: Check if token is valid
                // console.log(cookies.get("access_token"));
                let valid = procResponse(await githubValidateToken(), router);
                return valid;
                // router.push("/list");
            }
            return false;
        }

        check()
        .then((logined) => {
            if(logined) {
                // console.log("Already logged in");
                setIsLogin(true);
                githubIsRepoOwner()
                .then((res) => {
                    let isOwner = procResponse(res, router);
                    setIsOwner(isOwner);
                    router.push("/");
                })
            }
        })
        .catch((e: any) => {
            console.error(e.message);
            const [cookies, setCookies] = getCookiesMgr();
            setCookies("access_token");
            setIsLogin(false);
            setIsOwner(false);
        })
    },[])//Check if login at first time

    return  <LoginStateContext.Provider value={{
        isLogin: isLogin,
        setIsLogin: setIsLogin,
        isOwner: isOwner,
        setIsOwner: setIsOwner,
    }}>
        {props.children}
    </LoginStateContext.Provider>
}