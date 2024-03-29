"use client"
import { useRouter } from "next/navigation";
import React from "react"

export type ModalPropsType = {
    title: string;
    children: React.ReactNode;
}
export default function Modal(props: ModalPropsType) {
    const router = useRouter()

    return <div className="w-full h-full pointer-events-auto dialog-bg">
        <div className="dialog">
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