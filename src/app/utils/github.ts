"use server"
import React from "react"
import qs from "qs";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { BloggerListItemType } from "../page";
import { Octokit } from "@octokit/core";
import { createOAuthUserAuth } from "@octokit/auth-oauth-user";
import { BloggerCommentType, BloggerPostType } from "../@modal/viewer/page";
import { LOAD_PAGE_SIZE } from "./globalParams";
import { badRequestResponse, processCommentError, redirectResponse, serverErrorResponse, successResponse } from "./errorHandlerServer";

const getNonLoginGithubAuth = () => {
    const GITHUB_UNAUTHENTICATED_TOKEN = process.env.GITHUB_UNAUTHENTICATED_TOKEN;
    if(GITHUB_UNAUTHENTICATED_TOKEN === undefined || GITHUB_UNAUTHENTICATED_TOKEN === null)
        return new Octokit({})
    // console.log("Requests using Fine-grained personal access tokens.")
    return new Octokit({
        auth: GITHUB_UNAUTHENTICATED_TOKEN
    })
}

const getGithubAuth = (mustLogin: boolean) => {
    const cookieStore = cookies();
    if(cookieStore.has("access_token")) {
        let token = cookieStore.get("access_token")?.value;
        if(token === undefined || token === null){
            if(!mustLogin)
                return getNonLoginGithubAuth();
            throw new Error("ACCESS_TOKEN_IS_MISSING");
        }
        const github = new Octokit({
            auth: token
        })
        return github;
    }
    else if(mustLogin) {
        throw new Error("ACCESS_TOKEN_IS_MISSING");
    }
    return getNonLoginGithubAuth();
}

const getGithubRepo = () => {
    const GITHUB_ISSUE_BLOGGER_USERNAME   = process.env.GITHUB_ISSUE_BLOGGER_USERNAME
    const GITHUB_ISSUE_BLOGGER_REPO_NAME  = process.env.GITHUB_ISSUE_BLOGGER_REPO_NAME
    if(GITHUB_ISSUE_BLOGGER_USERNAME === undefined || GITHUB_ISSUE_BLOGGER_REPO_NAME === undefined)
        throw new Error("USERNAME/REPO should not be undefined");
    return [GITHUB_ISSUE_BLOGGER_USERNAME, GITHUB_ISSUE_BLOGGER_REPO_NAME]
}

const validateTitle = (title: string) => {
    if(title.length === 0)
        throw new Error("TITLE_IS_REQUIRED");
}

const validateContent = (content: string) => {
    if(content.length < 30)
        throw new Error("CONTENT_TOO_SHORT");
}

export const githubUpdateIssue = async (id: number, title: string, content: string) => {
    try {
        const client = getGithubAuth(true);
        const [username, repo] = getGithubRepo();
    
        validateTitle(title);
        validateContent(content);
    
        const rtv = await client.request('PATCH /repos/{owner}/{repo}/issues/{issue_number}', {
            owner: username,
            repo: repo,
            issue_number: id,
            title: title,
            body: content,
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            },
        })
        if(rtv.status >= 200 && rtv.status < 300)
            return successResponse();
        return serverErrorResponse();
    }
    catch (e: any) {
        return processCommentError(e);
    }
}

export const githubDeleteIssue = async (id: number) => {
    try {
        const client = getGithubAuth(true);
        const [username, repo] = getGithubRepo();

        const rtv = await client.request('PATCH /repos/{owner}/{repo}/issues/{issue_number}', {
            owner: username,
            repo: repo,
            issue_number: id,
            state: "closed",
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            },
        })
        if(rtv.status >= 200 && rtv.status < 300)
            return successResponse();
        return serverErrorResponse();
    }
    catch (e: any) {
        return processCommentError(e);
    }
}

export const githubViewIssue = async (id: number) => {

    try {
        const client = getGithubAuth(false);
        const [username, repo] = getGithubRepo();
        
        // console.log("===========================LIST ISSUE============================");
        const rtv = await client.request('GET /repos/{owner}/{repo}/issues/{issue_number}', {
            owner: username,
            repo: repo,
            issue_number: id,
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            },
        })

        if(rtv.data.state === "closed")
            return redirectResponse("","route://back");

        let post: BloggerPostType = {
            title: rtv.data.title,
            id: rtv.data.id,
            content: rtv.data.body || ""
        }
        
        // console.log(post)
        // console.log("=========================LIST ISSUE END==========================");
        return successResponse(post);
    }
    catch (e: any) {
        return processCommentError(e);
    }
}

export const githubViewIssueComments = async (id: number) => {
    try {
        const client = getGithubAuth(false);
        const [username, repo] = getGithubRepo();
        
        // console.log("===========================LIST ISSUE COMMENT==========================");
        const rtv = await client.request('GET /repos/{owner}/{repo}/issues/{issue_number}/comments', {
            owner: username,
            repo: repo,
            issue_number: id,
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            },
        })
        
        let comments = rtv.data.map(comment => {
            return {
                user: comment.user?.login || "NoBody",
                content: comment.body
            } as BloggerCommentType
        })
    
        // console.log(rtv.data)
        // console.log("=========================LIST ISSUE COMMENT END==========================");
        return successResponse(comments);
    }
    catch(e: any) {
        return processCommentError(e);
    }
}

export const githubCreateIssue = async (title: string, content: string) => {
    try {     
        const client = getGithubAuth(true);
        const [username, repo] = getGithubRepo();

        validateTitle(title);
        validateContent(content);

        const rtv = await client.request('POST /repos/{owner}/{repo}/issues', {
            owner: username,
            repo: repo,
            title: title,
            body: content,
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
        })
        if(rtv.status >= 200 && rtv.status < 300)
            return successResponse();
        return serverErrorResponse();
    }
    catch (e: any) {
        return processCommentError(e);
    }
}

export const githubIsRepoOwner = async () => {
    try {
        const client = getGithubAuth(true);
        const [username, repo] = getGithubRepo();
    
        const rtvUser = await client.request('GET /user', {
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
        })
        // console.log("Get user",rtvUser.data);
        const userID = rtvUser.data.id;
        if( !( rtvUser.status >= 200 && rtvUser.status < 300 ) )
            return successResponse(false);
    
        const rtvRepo = await client.request('GET /repos/{owner}/{repo}',{
            owner: username,
            repo: repo,
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
        })
        if( !( rtvRepo.status >= 200 && rtvRepo.status < 300 ) )
            return successResponse(false);
        const repoOwnerID = rtvRepo.data.owner.id;
    
        return successResponse(userID === repoOwnerID);
    }
    catch (e: any) {
        return processCommentError(e);
    }
}

export const githubListIssue = async (pageIdx: number) => {
    try {

        const client = getGithubAuth(false);
        const [username, repo] = getGithubRepo();
        
        // console.log("===========================LIST ISSUES===========================");
        const rtv = await client.request('GET /repos/{owner}/{repo}/issues', {
            owner: username,
            repo: repo,
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            },
            per_page: LOAD_PAGE_SIZE,
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
        // console.log("=========================LIST ISSUES END=========================");
        return successResponse(itemLst);
    }
    catch(e: any) {
        return processCommentError(e);
    }
}

export const githubValidateToken = async () => {
    try {
        const client = getGithubAuth(true);
        let rtv = await client.request('GET /user', {})
        // console.log("Get user test",rtv.status);
        if(rtv.status >= 200 && rtv.status < 300)
            return successResponse(true);
        return successResponse(false);
    }
    catch (e: any) {
        return processCommentError(e);
    }
}

export const getGithubToken = async (code: string) => {
    try {
        // console.log(req.body.data);
        if(code === undefined)
            return badRequestResponse("CODE_IS_EMPTY");

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
            return serverErrorResponse();
        return successResponse(access_token)
    }
    catch (e: any) {
        return processCommentError(e);
    }
}

export const githubLogin = async () => {
    try {
        const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
        // console.log(CLIENT_ID);
        if(CLIENT_ID === undefined) {
            console.error("Cant get client id of GitHub app");
            throw new Error("Cant get client id of GitHub app");
        }

        const GITHUB_AUTH_URL = "https://github.com/login/oauth/authorize";
        const GITHUB_CLIENT_ID = CLIENT_ID;
        const GITHUB_OAUTH_REDIRECT_URI = process.env.GITHUB_OAUTH_REDIRECT_URI;
        if(GITHUB_OAUTH_REDIRECT_URI === undefined)
            throw new Error("OAUTH_REDIRECT_URI_IS_MISSING");
            
        const GITHUB_AUTH_SCOPE = ["user", "repo"];

        const queryOption = {
            client_id : GITHUB_CLIENT_ID,
            scope : GITHUB_AUTH_SCOPE,
            redirect_uri : GITHUB_OAUTH_REDIRECT_URI,
        }
        const qstring = qs.stringify(queryOption,{ arrayFormat: 'comma' });

        const loginUri = `${GITHUB_AUTH_URL}?${qstring}`
        // console.log(loginUri);
        return redirectResponse(loginUri);
    }
    catch (e: any) {
        return processCommentError(e);
    }
}