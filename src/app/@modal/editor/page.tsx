"use client"
import { githubViewIssue } from "@/app/utils/github";
import { procResponse } from "@/app/utils/errorHandlerClient";
import Modal from "@/app/utils/modal"
import { useSearchParams, useRouter } from "next/navigation"
import React, { useContext, useEffect, useRef, useState } from "react"
import { ResponseType } from "@/app/utils/errorHandlerServer";
import { BloggerListContext } from "@/app/utils/BloggerListContext";

export default function Editor() {
    const router = useRouter()
    const contentCounter = (content: string) => {
        const contentLength = content.length || 0;
        const newLineCount = (content.match(new RegExp("\n", "g")) || []).length;
        return contentLength - newLineCount;
    }

    const [title, setTitle] = useState("Title of Post");
    const [content, setContent] = useState("Write some content here ...");
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [contentCount, setContentCount] = useState(contentCounter(content));

    const txtTitleRef = useRef<HTMLInputElement>(null)
    const txtContentRef = useRef<HTMLTextAreaElement>(null)

    const params = useSearchParams();

    const hasID = params.has("id");
    const id = hasID ? parseInt(params.get("id")!) : 0;

    const hasMode = params.has("mode");
    const mode = hasID ? params.get("mode")||"create" : "create";

    useEffect(() => {
        if(mode === "edit" && hasID) {
            let loadPost = async () => {
                let post = procResponse(await githubViewIssue(id), router);
                setTitle(post.title);
                setContent(post.content);
                setContentCount(contentCounter(post.content))
            }
            loadPost();
        }
    }, [id, hasID, mode])

    const blogState = useContext(BloggerListContext);

    const validateForm = () => {
        // console.log("Validate form");
        // console.log(title);
        // console.log(txtContentRef.current?.value.length,content);
        const titleLength = txtTitleRef.current?.value.length || 0;
        const bodyLength = contentCounter(txtContentRef.current?.value || "");
        if(bodyLength >= 30 && titleLength > 0) {
            setShowAlert(false);
            setAlertMessage("");
            const title = txtTitleRef.current!.value;
            const content = txtContentRef.current!.value;
            if(mode === "create") {
                blogState.createPost(title, content)
                .then((success: boolean) => {
                    if(success) {
                        router.back();
                        // router.refresh();
                    }
                })
            } else if(mode === "edit") {
                blogState.updatePost(id, title, content)
                .then((success: boolean) => {
                    if(success) {
                        // console.log("Save Edit Success")
                        router.back();
                    }
                })
            }
        }
        else if(bodyLength < 30 && titleLength > 0) {
            setShowAlert(true);
            setAlertMessage("Please write at least 30 characters of the post.");
        }
        else if(bodyLength >= 30 && titleLength == 0) {
            setShowAlert(true);
            setAlertMessage("Please add a title of the post.");
        }
        else if(bodyLength < 30 && titleLength == 0) {
            setShowAlert(true);
            setAlertMessage("Please add a title and at least 30 characters of the post.");
        }
    }


    return <Modal title={mode !== "create" ? `Edit Blog ${id}` : "Create a post"}>
        <div className="w-[80vw] h-[65vh] flex flex-col">
            <div className="flex flex-row py-2">
                <span className="text-nowrap justify-center align-middle">Title : </span>
                <input type="text" required ref={txtTitleRef} value={title} onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-md px-1 ml-2 outline-black outline invalid:outline-red-600" 
                ></input>
            </div>
            <div className="flex-grow py-2">
                <textarea 
                    className="w-full h-full resize-none rounded-md m-1 p-1 outline-black outline invalid:outline-red-600"
                    placeholder={content} value={content} onChange={(e) => {
                        setContent(e.target.value)
                        setContentCount(contentCounter(e.target.value))
                    }}
                    minLength={30} required
                    ref={txtContentRef}
                ></textarea>
            </div>
            <div className="w-full flex flex-row h-10 pt-2">
                <span className={`text-nowrap w-fit px-2 py-1 rounded-md text-white text-center ${showAlert ? " bg-red-400 border-red-800" : ""}`}>{alertMessage}</span>
                <div className="flex-grow"></div>
                <span className="mx-2">{`${contentCount} character(s)`}</span>
                <button 
                    className="px-2 bg-green-400 border-green-500 border-4 rounded-md hover:border-green-700" 
                    onClick={validateForm}>{mode !== "create" ? `Save` : "Create"}</button>
            </div>
        </div>
    </Modal>
}