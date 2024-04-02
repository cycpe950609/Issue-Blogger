"use client"

import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { ResponseType } from "./errorHandlerServer";

export const procResponse = (res: ResponseType, route: AppRouterInstance) => {
    // console.log("ProcResponse : ", res)
    switch(res.status) {
        case 200:
            return res.data || true;
        case 303: {
            const routeType = res.message;
            // console.log("Url ", routeType);
            switch(routeType) {
                case 'route://back':{
                    route.back();
                    return;
                }
                case 'route://refresh':{
                    route.refresh();
                    return;
                }
                case 'route://push':{
                    route.push(res.data)
                    return;
                }
            }
            // console.log("Redirect to : ", res.data);
            window.location.href = res.data;
            break;
        }
        case 400:
        case 500:
            throw new Error(`${res.status}: ${res.message}`);
    }
}
