import React from "react";

export default function Spinner(props: {children: React.ReactNode}) {
    return <div className="w-full h-full flex flex-row flex-nowrap text-nowrap">
            <div className="w-6 h-6 animate-spin rounded-full border-[5px] border-t-blue-600 border-r-blue-600" />
            <div className="ml-2">{props.children}</div>
        </div>
}