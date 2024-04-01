"use client"
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { githubLogin, getGithubToken, githubValidateToken, githubIsRepoOwner } from "../github";
import { cookies } from 'next/headers'
import { getCookiesMgr } from "../utils/cookiesMgr";
import { useRouter } from "next/navigation";
import QueryString from "qs";
import { LoginStateContext } from "../utils/LoginStateContext";

export default function Home() {
    const router = useRouter();
    const params = useSearchParams();
    const loginState = useContext(LoginStateContext);
    useEffect(() => {
        const [cookies, setCookies] = getCookiesMgr();
        let check = async () => {
            if (cookies.has("access_token")) {
                //TODO: Check if token is valid
                console.log(cookies.get("access_token"));
                let valid = await githubValidateToken();
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
                    let access_token = await getGithubToken(authCode);
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
                setTimeout(() => githubLogin(), 2000)
            }
            else {
                console.log("Already logged in");
                loginState.setIsLogin(true);
                githubIsRepoOwner()
                .then((isOwner) => {
                    loginState.setIsOwner(isOwner);
                    router.push("/");
                })
            }
        })
    })
    return <>
        <div className="flex">Login in <span className="text-red-600">2 secs</span></div>
    </>
}
