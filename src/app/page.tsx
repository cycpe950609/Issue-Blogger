"use client"
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { githubLogin, getGithubToken } from "./github";
import { cookies } from 'next/headers'
import { getCookiesMgr } from "./utils/cookiesMgr";
import { useRouter } from "next/navigation";
import QueryString from "qs";

export default function Home() {
    const router = useRouter();
    const params = useSearchParams();
    useEffect(() => {
        const [cookies, setCookies] = getCookiesMgr();
        if (cookies.has("access_token")) {
            //TODO: Check if token is valid
            console.log(cookies.get("access_token"));
            // router.push("/list");
        }
        else if (params.has("code")) {
            // Loginned
            const authCode = params.get("code");
            console.log("GetAuthCode", authCode);
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
            
            get_access_token(authCode);
            // githubClient.GetAccessToken(authCode)
            // .then(() => {
            //     currentUrlParams.delete("code");
            //     setCurrentUrlParams(currentUrlParams);
            //     navigate("/tasks");
            // })
        }
        else {
            setTimeout(() => githubLogin(), 2000)
        }
    })
    return <>
        <div className="flex flex-col">Home</div>
    </>
}
