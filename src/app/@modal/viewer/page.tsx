"use client"
import { githubDeleteIssue, githubIsRepoOwner, githubViewIssue } from "@/app/github";
import LinkButton, { BUTTON_CSS_CLASS } from "@/app/utils/button";
import Modal from "@/app/utils/modal"
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react"
import Markdown from "react-markdown";
import { twMerge } from "tailwind-merge";

export type BloggerPostType = {
    title: string;
    id: number;
    content: string;
}

export default function Viewer() {

    const router = useRouter();

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
    
    const [repoOwner, setRepoOwner] = useState(false);
    useEffect(() => {
        let updateRepoOwner = async () => {
            const isOwner = await githubIsRepoOwner();
            setRepoOwner(isOwner);
        };
        updateRepoOwner();
    },[])
    
    const isDelete = params.has("del");

    return <Modal title="Viewer">
        <div className="w-[80vw] h-[65vh] overflow-y-auto overflow-x-clip relative float">
            <div className="flex flex-row py-2">
                <span className="text-nowrap justify-center align-middle">Title : </span>
                <span className="text-nowrap flex-grow pl-2">{title}</span>
                {repoOwner ? <>
                    <LinkButton className="px-4 bg-red-500 border-red-900" href={`/viewer?del=true&id=${id}`}>Delete</LinkButton>
                    <LinkButton className="px-4" href={`/editor?mode=edit&id=${id}`}>Edit</LinkButton>
                </> : null}
            </div>
            <div className="p-2 border-black border-solid border-4 rounded m-1">
                <Markdown>
                    {content}
                </Markdown>
            </div>
            <div className="w-full flex flex-row h-10 pt-2">
                A lots of comments...
            </div>
            {isDelete && repoOwner ? <div className="absolute top-0 left-0 w-full h-full">
                <Modal title={`Do you want to delete post ${id} ?`}>
                    <div className="w-full h-full flex flex-row">
                        <button 
                            className={twMerge(BUTTON_CSS_CLASS, "flex-grow bg-red-500 border-red-900")}
                            onClick={() => {
                                const deletePost = async () => {
                                    return await githubDeleteIssue(id);
                                }
                                deletePost().then(() => { router.back(); router.back(); router.refresh();});
                            }}
                        >
                            Delete
                        </button>
                        <button 
                            className={twMerge(BUTTON_CSS_CLASS, "flex-grow")} 
                            onClick={()=> router.back()}>
                                Cancel
                        </button>
                    </div>
                </Modal>
            </div> : null}
        </div>

    </Modal>
}