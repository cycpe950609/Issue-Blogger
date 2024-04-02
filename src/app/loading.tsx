import React from "react";
import Spinner from "./utils/Spinner";

export default function Loading() {
    return <div className="w-full h-full flex flex-row justify-center items-center">
    <div className="h-8 w-fit"><Spinner>Wait a moment...</Spinner> </div>
</div>
}