import React, { useContext, useEffect, useState } from "react";
import { getCookiesMgr } from "./cookiesMgr";
import { githubIsRepoOwner, githubValidateToken } from "../github";
import {LoginStateContext} from "./LoginStateContext";

export type RepoOwnerComponentPropsType = {
    isOwner: React.ReactNode;
    isGuest: React.ReactNode;
    notLogin: React.ReactNode;
}

const HorCNT = (props: {children: React.ReactNode}) => {
    return <div className="flex flex-row">{props.children}</div>
}
export default function RepoOwnerComponent(props: RepoOwnerComponentPropsType) {
    const loginState = useContext(LoginStateContext);

    if(loginState.isLogin) {
        return loginState.isOwner ? <HorCNT>{props.isOwner}</HorCNT> : <HorCNT>{props.isGuest}</HorCNT> ;
    }
    else {
        return <HorCNT>{props.notLogin}</HorCNT>;
    }
}