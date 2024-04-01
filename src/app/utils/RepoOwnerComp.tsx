import React, { useEffect, useState } from "react";
import { getCookiesMgr } from "./cookiesMgr";
import { githubIsRepoOwner, githubValidateToken } from "../github";

export type RepoOwnerComponentPropsType = {
    isOwner: React.ReactNode;
    isGuest: React.ReactNode;
    notLogin: React.ReactNode;
}
export default function RepoOwnerComponent(props: RepoOwnerComponentPropsType) {

    const [repoOwner, setRepoOwner] = useState(false);
    const [isLogin, setIsLogin] = useState(false);

    useEffect(() => {
        let updateLoginState = async () => {
            const [cookies, setCookies] = getCookiesMgr();
            const logined = cookies.has("access_token") && await githubValidateToken();
            if(logined) {
                const isOwner = await githubIsRepoOwner();
                setRepoOwner(isOwner);
            } 
            else {
                setRepoOwner(false);
            }
            setIsLogin(logined);
        };
        updateLoginState();
    },[])

    if(isLogin) {
        return repoOwner ? props.isOwner : props.isGuest;
    }
    else {
        return props.notLogin;
    }
}