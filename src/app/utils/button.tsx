import Link from "next/link";
import React from "react";

export type ButtonPropsType = {
    href: string;
    children?: React.ReactNode;
}

const LinkButton = (props: ButtonPropsType) => {
    return <Link className="button" href={props.href}>
        {props.children}
    </Link>
}

export default LinkButton;