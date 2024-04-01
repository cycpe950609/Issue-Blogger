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

export const getCookiesMgr: ()=>[Map<string,string>, (name:string,value?:string)=> void] = () => {
    let result = parseCurrentCookies();
    return [
        result,
        (name: string, value?: string) => {
            let cur = parseCurrentCookies();
            if(value === undefined){
                cur.delete(name);
                const date = new Date();
                // Set it expire in -1 days
                date.setTime(date.getTime() + (-1 * 24 * 60 * 60 * 1000));
                // Set it
                document.cookie = name+"=; expires="+date.toUTCString()+"; path=/";
            }
            else {
                cur.set(name, value);
            }
            let newCookie = "";
            // console.log("SetCookie", cur);
            cur.forEach((value, key) => {
                if(key !== "SameSite")
                newCookie += `${key}=${value};`;
            });
            if(newCookie.length > 0){
                newCookie += "path=/; SameSite=Strict; Secure";
                document.cookie = newCookie;
            }
        }
    ];
}