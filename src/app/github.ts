"use server"
import React from "react"
import qs from "qs";
import axios from "axios";
import { redirect } from "next/navigation";
import QueryString from "qs";
import { cookies, headers } from "next/headers";
import { BloggerListItemType } from "./list/page";

const PAGE_SIZE = 10

export const githubCreateIssue = async (title: string, content: string) => {
    const GITHUB_ISSUE_BLOGGER_USERNAME   = process.env.GITHUB_ISSUE_BLOGGER_USERNAME
    const GITHUB_ISSUE_BLOGGER_REPO_NAME  = process.env.GITHUB_ISSUE_BLOGGER_REPO_NAME
    const GITHUB_CREATE_ISSUE_URL = `https://api.github.com/repos/${GITHUB_ISSUE_BLOGGER_USERNAME}/${GITHUB_ISSUE_BLOGGER_REPO_NAME}/issues`

    const cookieStore = cookies();
    if(cookieStore.has("access_token")) {
        let token = cookieStore.get("access_token")?.value;
        if(token === undefined || token === null)
            throw new Error("Access token is not exist")

        if(title.length === 0)
            throw new Error("Title is required.");
        if(content.length < 30)
            throw new Error("Content too short. Must longer than 30 words.");

        const createOption = {
            title       : title,
            body        : content,
        }

        const rtv = await axios.post(GITHUB_CREATE_ISSUE_URL, JSON.stringify(createOption),{
            headers : {
                "Accept" : "application/vnd.github+json",
                "Authorization" : `Bearer ${token}`,
                "X-GitHub-Api-Version" : "2022-11-28",
                'Content-Type':'application/x-www-form-urlencoded'
            },
        })

        console.log(rtv)
    }
}

export const githubIsRepoOwner = async () => {
    let cookieStore = cookies();
    if(cookieStore.has("access_token")) {
        let token = cookieStore.get("access_token")?.value;
        // Get user's id
        if(token === undefined || token === null)
            return false;
        const rtvUser = await axios.get("https://api.github.com/user",{ 
            headers: {
                "Accept" : "application/vnd.github+json",
                "Authorization" : `Bearer ${token}`,
                "X-GitHub-Api-Version" : "2022-11-28"
            }
        })
        // console.log("Get user",rtvUser.data);
        const userID = rtvUser.data.id;
        if( !( rtvUser.status >= 200 && rtvUser.status < 300 ) )
            return false;

        // Get repo's owner id
        const GITHUB_ISSUE_BLOGGER_USERNAME   = process.env.GITHUB_ISSUE_BLOGGER_USERNAME
        const GITHUB_ISSUE_BLOGGER_REPO_NAME  = process.env.GITHUB_ISSUE_BLOGGER_REPO_NAME
        const GITHUB_REPO_URL = `https://api.github.com/repos/${GITHUB_ISSUE_BLOGGER_USERNAME}/${GITHUB_ISSUE_BLOGGER_REPO_NAME}`;

        const rtvRepo = await axios.get(GITHUB_REPO_URL,{
            headers : {
                "Accept" : "application/vnd.github+json",
                "Authorization" : `Bearer ${token}`,
                "X-GitHub-Api-Version" : "2022-11-28"
            }
        })
        // console.log("Get repo",rtvRepo.data);
        const repoOwnerID = rtvRepo.data.owner.id;

        return userID === repoOwnerID;
    }
    return false;
}

export const githubListBlogger: (pageIdx: number) => Promise<BloggerListItemType[]> = async (pageIdx: number) => {
    const GITHUB_ISSUE_BLOGGER_USERNAME   = process.env.GITHUB_ISSUE_BLOGGER_USERNAME
    const GITHUB_ISSUE_BLOGGER_REPO_NAME  = process.env.GITHUB_ISSUE_BLOGGER_REPO_NAME
    const GITHUB_LIST_ISSUE_URL = `https://api.github.com/repos/${GITHUB_ISSUE_BLOGGER_USERNAME}/${GITHUB_ISSUE_BLOGGER_REPO_NAME}/issues`;


    const cookieStore = cookies();
    if(cookieStore.has("access_token")) {
        console.log("===========================LIST ISSUES===========================");
        let token = cookieStore.get("access_token")?.value;

        const queryOption = {
            per_page    : PAGE_SIZE,
            page        : pageIdx,
            direction   : 'asc'
        }
        const qstring = qs.stringify(queryOption,{ arrayFormat: 'comma' });
        
        const selectUri = `${GITHUB_LIST_ISSUE_URL}?${qstring}`
        console.log(selectUri)

        const rtv = await axios.get(selectUri,{
            headers : {
                "Accept" : "application/vnd.github+json",
                "Authorization" : `Bearer ${token}`,
                "X-GitHub-Api-Version" : "2022-11-28"
            }
        })

        let itemLst:BloggerListItemType[] = [];
        rtv.data.forEach((item:any) => {
            itemLst.push({
                title: item.title,
                id: item.number,
                content: item.body
            } as BloggerListItemType)
        })
        // console.log(rtv.data)
        console.log("=========================LIST ISSUES END=========================");
        return itemLst;
    }
    else {
        throw new Error("AccessToken is not found");
    }
}

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