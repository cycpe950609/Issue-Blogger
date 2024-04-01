"use server"
// Status code :
// 200 : Success
// 303 : Redirection
// 400 : Bad Request
// 500 : Internal Error
export type ResponseType = {
    status: 200|303|400|500;
    message: string;
    data?: any;
}

export const successResponse = (data?: any ) => {
    return {
        status: 200,
        message: "Success",
        data
    } as ResponseType;
}

export const redirectResponse = (url: string, message?: string) => {
    return {
        status: 303,
        message: message ? message : "Redirection",
        data: url,
    } as ResponseType;
}

export const badRequestResponse = (message: string) => {
    return {
        status: 400,
        message: message,
    } as ResponseType;
}

export const serverErrorResponse = () => {
    return {
        status: 500,
        message: "Something went wrong.",
    } as ResponseType;
}

export const processCommentError = (e: any) => {
    const GITHUB_OAUTH_REDIRECT_URI = process.env.GITHUB_OAUTH_REDIRECT_URI;
    if(GITHUB_OAUTH_REDIRECT_URI === undefined)
        return serverErrorResponse();
    if(e.message === "ACCESS_TOKEN_IS_MISSING")
        return redirectResponse(GITHUB_OAUTH_REDIRECT_URI);
    if(e.message === "TITLE_IS_REQUIRED" || e.message === "CONTENT_TOO_SHORT")
        return badRequestResponse(e.message);
    return serverErrorResponse();
}