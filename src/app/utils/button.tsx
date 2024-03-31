import Link from "next/link";
import React from "react";
import { twMerge } from "tailwind-merge";

export type ButtonPropsType = {
    href: string;
    className?: string;
    children?: React.ReactNode;
}

export const BUTTON_CSS_CLASS = "select-none flex items-center justify-center bg-green-500 border-green-900 border-2 rounded-lg p-1 mx-2"

const LinkButton = (props: ButtonPropsType) => {
    return <Link className={twMerge(BUTTON_CSS_CLASS, props.className||"")} href={props.href}>
        {props.children}
    </Link>
}

export default LinkButton;