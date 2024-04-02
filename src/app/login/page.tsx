"use client"
import { useSearchParams } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { githubLogin, getGithubToken, githubValidateToken, githubIsRepoOwner } from "@/app/utils/github";
import { getCookiesMgr } from "../utils/cookiesMgr";
import { useRouter } from "next/navigation";
import { LoginStateContext } from "../utils/LoginStateContext";
import { procResponse } from "../utils/errorHandlerClient";
import { ResponseType } from "../utils/errorHandlerServer";

export default function LoginPage() {
    const router = useRouter();
    const params = useSearchParams();
    const loginState = useContext(LoginStateContext);

    const [time, setTime] = useState(2)
    useEffect(() => {
        if(!loginState.isLogin)
            var timeout = setInterval(()=>{
                if(time > 0)
                    setTime(time - 1)
                if(time === 0)
                    clearInterval(timeout)
                // window.location.reload()
            },1000)
        return () => {
            if(!loginState.isLogin)
                clearInterval(timeout)
        }
    })

    useEffect(() => {
        const [cookies, setCookies] = getCookiesMgr();
        let check = async () => {
            if (cookies.has("access_token")) {
                //TODO: Check if token is valid
                // console.log(cookies.get("access_token"));
                let valid = procResponse(await githubValidateToken(), router);
                return !valid;
                // router.push("/list");
            }
            else if (params.has("code")) {
                // Loginned
                const authCode = params.get("code");
                // console.log("GetAuthCode", authCode);
                if (authCode === null)
                    throw new Error("Something Error when getting authorication");
    
                let newParams = new URLSearchParams(params);
                newParams.delete("code");
                router.replace(`/?${newParams.toString()}`);
                const get_access_token = async (authCode: string) => {
                    let access_token = procResponse(await getGithubToken(authCode), router);
                    if(access_token === "")
                        throw new Error("AccessToken is invalid");
                        
                    // console.log("authToken", access_token);
                    setCookies("access_token", access_token as string);
    
                }
                
                await get_access_token(authCode);
                return false;
                // githubClient.GetAccessToken(authCode)
                // .then(() => {
                //     currentUrlParams.delete("code");
                //     setCurrentUrlParams(currentUrlParams);
                //     navigate("/tasks");
                // })
            }
            return true;
        }

        check()
        .then((shouldLogin) => {
            if(shouldLogin) {
                // console.log("Should login");
                setTimeout(() => {
                    githubLogin()
                    .then((res: ResponseType) => {
                        procResponse(res, router)
                    })
                
                }, 2000)
            }
            else {
                // console.log("Already logged in");
                loginState.setIsLogin(true);
                githubIsRepoOwner()
                .then((res) => {
                    let isOwner = procResponse(res, router);
                    loginState.setIsOwner(isOwner);
                    router.push("/");
                })
            }
        })
        .catch((e: any) => {
            console.error(e.message);
            const [cookies, setCookies] = getCookiesMgr();
            setCookies("access_token");
            loginState.setIsLogin(false);
            loginState.setIsOwner(false);
            // console.log("githubLogin")
            githubLogin()
            .then((res: ResponseType) => {
                procResponse(res, router)
            })
        })
    })
    return <div className="h-full w-full flex flex-col items-center justify-center">
                {
                    loginState.isLogin ? 
                    <div className="flex flex-col">
                        <span>Login Sucess</span>
                        <span className="text-green-600">Wait a moment</span>
                    </div>
                    :
                    <div className="flex">Login in<span className="text-red-600 ml-2">{time} secs</span></div>
                }
            </div>
}
