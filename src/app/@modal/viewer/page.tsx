"use client"
import { githubViewIssue } from "@/app/github";
import Modal from "@/app/utils/modal"
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react"
import Markdown from "react-markdown";

export type BloggerPostType = {
    title: string;
    id: number;
    content: string;
}

export default function Viewer() {

    const params = useSearchParams();
    if(!params.has("id"))
        throw new Error("No id in the url.");
    const id = parseInt(params.get("id")!);

    const [title, setTitle] = useState("Title");
    const [content, setContent] = useState("");

    useEffect(() => {
        const loadPost = async () => {
            let post = await githubViewIssue(id);
            setTitle(post.title);
            setContent(post.content);
        }
        loadPost();
    },[id])


    return <Modal title="Viewer">
        <div className="w-[80vw] h-[65vh] overflow-y-auto overflow-x-clip flex flex-col">
            <div className="flex flex-row py-2">
                <span className="text-nowrap justify-center align-middle">Title : </span>
                <span className="text-nowrap flex-grow pl-2">{title}</span>
            </div>
            <div className="p-2 border-black border-solid border-4 rounded m-1">
                <Markdown>
                    {content}
                </Markdown>
            </div>
            <div className="w-full flex flex-row h-10 pt-2">
                A lots of comments...
            </div>
        </div>

    </Modal>
}