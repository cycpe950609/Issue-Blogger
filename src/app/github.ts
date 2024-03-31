"use server"
import React from "react"
import qs from "qs";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { BloggerListItemType } from "./list/page";
import { Octokit } from "@octokit/core";
import { createOAuthUserAuth } from "@octokit/auth-oauth-user";
import { BloggerPostType } from "./@modal/viewer/page";

const PAGE_SIZE = 10

export const githubDeleteIssue = async (id: number) => {
    const cookieStore = cookies();
    if(cookieStore.has("access_token")) {
        console.log("===========================CLOSE ISSUE============================");
        const GITHUB_ISSUE_BLOGGER_USERNAME   = process.env.GITHUB_ISSUE_BLOGGER_USERNAME
        const GITHUB_ISSUE_BLOGGER_REPO_NAME  = process.env.GITHUB_ISSUE_BLOGGER_REPO_NAME
        if(GITHUB_ISSUE_BLOGGER_USERNAME === undefined || GITHUB_ISSUE_BLOGGER_REPO_NAME === undefined)
            throw new Error("USERNAME/REPO should not be undefined");

        let token = cookieStore.get("access_token")?.value;
        const github = new Octokit({
            auth: token
        })

        const rtv = await github.request('PATCH /repos/{owner}/{repo}/issues/{issue_number}', {
            owner: GITHUB_ISSUE_BLOGGER_USERNAME,
            repo: GITHUB_ISSUE_BLOGGER_REPO_NAME,
            issue_number: id,
            state: "closed",
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            },
        })
        if(rtv.status >= 200 && rtv.status < 300)
            return true;
        console.log(rtv)
        console.log("=========================CLOSE ISSUE END==========================");
    }
    else {
        throw new Error("AccessToken is not found");
    }
    return false;
}

export const githubViewIssue = async (id: number) => {
    const cookieStore = cookies();
    if(cookieStore.has("access_token")) {
        console.log("===========================LIST ISSUE============================");
        const GITHUB_ISSUE_BLOGGER_USERNAME   = process.env.GITHUB_ISSUE_BLOGGER_USERNAME
        const GITHUB_ISSUE_BLOGGER_REPO_NAME  = process.env.GITHUB_ISSUE_BLOGGER_REPO_NAME
        if(GITHUB_ISSUE_BLOGGER_USERNAME === undefined || GITHUB_ISSUE_BLOGGER_REPO_NAME === undefined)
            throw new Error("USERNAME/REPO should not be undefined");

        let token = cookieStore.get("access_token")?.value;
        const github = new Octokit({
            auth: token
        })

        const rtv = await github.request('GET /repos/{owner}/{repo}/issues/{issue_number}', {
            owner: GITHUB_ISSUE_BLOGGER_USERNAME,
            repo: GITHUB_ISSUE_BLOGGER_REPO_NAME,
            issue_number: id,
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            },
        })

        let post: BloggerPostType = {
            title: rtv.data.title,
            id: rtv.data.id,
            content: rtv.data.body || ""
        }
        
        console.log(post)
        console.log("=========================LIST ISSUE END==========================");
        return post;
    }
    else {
        throw new Error("AccessToken is not found");
    }
}

export const githubCreateIssue = async (title: string, content: string) => {
    const cookieStore = cookies();
    if(cookieStore.has("access_token")) {
        let token = cookieStore.get("access_token")?.value;
        if(token === undefined || token === null)
            throw new Error("Access token is not exist")

        if(title.length === 0)
            throw new Error("Title is required.");
        if(content.length < 30)
            throw new Error("Content too short. Must longer than 30 words.");

        const github = new Octokit({
            auth: token
        })
        
        const GITHUB_ISSUE_BLOGGER_USERNAME = process.env.GITHUB_ISSUE_BLOGGER_USERNAME
        const GITHUB_ISSUE_BLOGGER_REPO_NAME = process.env.GITHUB_ISSUE_BLOGGER_REPO_NAME
        if(GITHUB_ISSUE_BLOGGER_USERNAME === undefined || GITHUB_ISSUE_BLOGGER_REPO_NAME === undefined)
            throw new Error("USERNAME/REPO should not be undefined");
            
        const rtv = await github.request('POST /repos/{owner}/{repo}/issues', {
            owner: GITHUB_ISSUE_BLOGGER_USERNAME,
            repo: GITHUB_ISSUE_BLOGGER_REPO_NAME,
            title: title,
            body: content,
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
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
        const github = new Octokit({
            auth: token
        })
        const rtvUser = await github.request('GET /user', {
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
        })
        // console.log("Get user",rtvUser.data);
        const userID = rtvUser.data.id;
        if( !( rtvUser.status >= 200 && rtvUser.status < 300 ) )
            return false;

        // Get repo's owner id
        const GITHUB_ISSUE_BLOGGER_USERNAME   = process.env.GITHUB_ISSUE_BLOGGER_USERNAME
        const GITHUB_ISSUE_BLOGGER_REPO_NAME  = process.env.GITHUB_ISSUE_BLOGGER_REPO_NAME
        if(GITHUB_ISSUE_BLOGGER_USERNAME === undefined || GITHUB_ISSUE_BLOGGER_REPO_NAME === undefined)
            throw new Error("USERNAME/REPO should not be undefined");

        const rtvRepo = await github.request('GET /repos/{owner}/{repo}',{
            owner: GITHUB_ISSUE_BLOGGER_USERNAME,
            repo: GITHUB_ISSUE_BLOGGER_REPO_NAME,
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
        })
        // console.log("Get repo",rtvRepo.data);
        const repoOwnerID = rtvRepo.data.owner.id;

        return userID === repoOwnerID;
    }
    return false;
}

export const githubListBlogger: (pageIdx: number) => Promise<BloggerListItemType[]> = async (pageIdx: number) => {
    const cookieStore = cookies();
    if(cookieStore.has("access_token")) {
        console.log("===========================LIST ISSUES===========================");
        const GITHUB_ISSUE_BLOGGER_USERNAME   = process.env.GITHUB_ISSUE_BLOGGER_USERNAME
        const GITHUB_ISSUE_BLOGGER_REPO_NAME  = process.env.GITHUB_ISSUE_BLOGGER_REPO_NAME
        if(GITHUB_ISSUE_BLOGGER_USERNAME === undefined || GITHUB_ISSUE_BLOGGER_REPO_NAME === undefined)
            throw new Error("USERNAME/REPO should not be undefined");

        let token = cookieStore.get("access_token")?.value;
        const github = new Octokit({
            auth: token
        })

        const rtv = await github.request('GET /repos/{owner}/{repo}/issues', {
            owner: GITHUB_ISSUE_BLOGGER_USERNAME,
            repo: GITHUB_ISSUE_BLOGGER_REPO_NAME,
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            },
            per_page: PAGE_SIZE,
            page: pageIdx,
            direction: "asc"
        })

        let itemLst:BloggerListItemType[] = [];
        rtv.data.forEach((item:any) => {
            itemLst.push({
                title: item.title,
                id: item.number,
                create: new Date(item.created_at),
                update: new Date(item.updated_at),
            } as BloggerListItemType)
        })
        // console.log(rtv.data[0])
        console.log("=========================LIST ISSUES END=========================");
        return itemLst;
    }
    else {
        throw new Error("AccessToken is not found");
    }
}

export const githubValidateToken = async () => {
    const cookieStore = cookies();
    if(cookieStore.has("access_token")) {
        let token = cookieStore.get("access_token")?.value;
        // console.log("token: ", token);
        if(token === undefined || token === null)
            return false;
        const github = new Octokit({
            auth: token
        })
        let rtv = await github.request('GET /user', {})
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

    const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
    const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

    if(CLIENT_ID === undefined || CLIENT_SECRET === undefined)
        throw new Error("ID/SECRET should not be undefined");

    const auth = createOAuthUserAuth({
        clientId: CLIENT_ID,
        clientSecret:  CLIENT_SECRET,
        code: code,
    });
    // Exchanges the code for the user access token authentication on first call
    // and caches the authentication for successive calls
    const { token: access_token } = await auth();

    if(access_token === undefined)
        return "";
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