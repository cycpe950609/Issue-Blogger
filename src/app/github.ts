"use server"
import React from "react"
import qs from "qs";
import axios from "axios";
import { redirect } from "next/navigation";
import QueryString from "qs";
import { cookies, headers } from "next/headers";

export const githubVilidateToken = async () => {
    const cookieStore = cookies();
    if(cookieStore.has("access_token")) {
        let token = cookieStore.get("access_token")?.value;
        // console.log("token: ", token);
        if(token === undefined || token === null)
            return false;
        let rtv = await axios.get("https://api.github.com/user",{ 
            headers: {
                "Authorization" : `Bearer ${token}`,
            }
        })
        // console.log("Get user test",rtv.status);
        if(rtv.status >= 200 && rtv.status < 300)
            return true;
    }
    return false;
}

export const getGithubToken = async (code: string) => {
    // console.log(req.body.data);
    if(code === undefined)
        return "";
    // console.log("Get Code",code);
    // console.log("Get Token invoked");
    // console.log(req.body);
    // console.log(res)
    // console.log("client_id" , process.env.GITHUB_CLIENT_ID)
    // console.log("client_secret", process.env.GITHUB_CLIENT_SECRET)
    // console.log("code" , code)
    const authUrl = "https://github.com/login/oauth/access_token";
    const queryOption = { 
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
    };
    const qstring = qs.stringify(queryOption);
    const tokenUrl = `${authUrl}?${qstring}`
    // console.log(tokenUrl);
    const {data} = await axios.post(tokenUrl);
    const authToken = qs.parse(data);
    let access_token = (authToken as QueryString.ParsedQs)["access_token"];
    if(access_token === undefined)
        return "";
    // console.log(rtv);
    // return res.send("getToken")
    return access_token
}

export const githubLogin = () => {
    const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
    // console.log(CLIENT_ID);
    if(CLIENT_ID === undefined) {
        console.error("Cant get client id of GitHub app");
        throw new Error("Cant get client id of GitHub app");
    }

    const GITHUB_AUTH_URL = "https://github.com/login/oauth/authorize";
    const GITHUB_CLIENT_ID = CLIENT_ID;
    const GITHUB_AUTH_SCOPE = ["user", "repo"];

    const queryOption = {
        client_id : GITHUB_CLIENT_ID,
        scope : GITHUB_AUTH_SCOPE
    }
    const qstring = qs.stringify(queryOption,{ arrayFormat: 'comma' });

    const loginUri = `${GITHUB_AUTH_URL}?${qstring}`
    console.log(loginUri);
    redirect(loginUri);
}