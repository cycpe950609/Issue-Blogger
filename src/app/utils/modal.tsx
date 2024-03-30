"use client"
import { useRouter } from "next/navigation";
import React, { useReducer, useRef, useState } from "react"

export type ModalPropsType = {
    title: string;
    children: React.ReactNode;
}
export default function Modal(props: ModalPropsType) {
    const router = useRouter()

    const dialogRef = useRef<HTMLDivElement>(null);

    const [isMouseDown, setIsMouseDown] = useState(false);

    const dialogBGMouseDown = (e: any) => {
        const ele = dialogRef.current;
        if(ele != null) {
            const rect = ele.getBoundingClientRect();
            if(e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
                // console.log("Outside of Dialog")
                setIsMouseDown(true);
            }
        }
    }

    const dialogBGMouseUp = (e: any) => {
        const ele = dialogRef.current;
        if(ele != null) {
            const rect = ele.getBoundingClientRect();
            if(e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
                // console.log("Outside of Dialog")
                if(isMouseDown) {
                    setIsMouseDown(false);
                    router.back();
                }
            }
        }
    }

    return <div className="pointer-events-auto dialog-bg" /*onMouseDown={dialogBGMouseDown} onMouseUp={dialogBGMouseUp}*/ >
        <div className="dialog" ref={dialogRef}>
            <div className="dialog-header">
                <div className="dialog-title">{props.title}</div>
                <div className="dialog-close" onClick={() => {router.back()}}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </div>
            </div>
            <div className="dialog-body">
                {props.children}
            </div>
        </div>
    </div>
}