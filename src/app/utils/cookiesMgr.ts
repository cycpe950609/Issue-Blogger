"use client"
const parseCurrentCookies = () => {
    let cookies = document.cookie.split(';');
    let result: Map<string,string> = new Map<string,string>();
    cookies.forEach((cookie) => {
        let sp = cookie.split('=');
        if(sp.length == 2)
            result.set(sp[0].trim(), sp[1].trim());
    });
    return result;
}

export const getCookiesMgr: ()=>[Map<string,string>, (name:string,value:string)=> void] = () => {
    let result = parseCurrentCookies();
    return [
        result,
        (name: string, value: string) => {
            let cur = parseCurrentCookies();
            cur.set(name, value);
            let newCookie = "";
            cur.forEach((value, key) => {
                newCookie += `${key}=${value};`;
            });
            newCookie += " SameSite=Strict; Secure"
            document.cookie = newCookie;
        }
    ];
}