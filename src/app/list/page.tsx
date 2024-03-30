"use client"
import { useEffect, useRef, useState } from "react"
import useOnScreen from "../utils/useOnScreen";
import { githubIsRepoOwner, githubListBlogger } from "../github";
import Link from "next/link";
import LinkButton from "../utils/button";

const PAGE_SIZE = 10

export type BloggerListItemType = {
    title: string;
    id: number;
    content: string;
}
type BloggerListItemProps = BloggerListItemType & {}

const BloggerListItem = (props: BloggerListItemProps) => {
    const CONTENT_MAX_SIZE = 8;
    return <tr className="w-full h-10 lstItem">
        <th>{props.id}</th>
        <th colSpan={2}>
            <div className="flex flex-col">
                <span>{props.title}</span>
                <span className="font-thin text-xs">{props.content.length > CONTENT_MAX_SIZE-3 ? `${props.content.slice(0,CONTENT_MAX_SIZE-3)}...` : props.content}</span>
            </div>
        </th>
    </tr>
}

const testBlogLst = [
    {title: "Test01", id: 0},
    {title: "Test02", id: 1},
    {title: "Test03", id: 2},
    {title: "Test04", id: 3},
    {title: "Test05", id: 4},
    {title: "Test06", id: 5},
    {title: "Test07", id: 6},
    {title: "Test08", id: 7},
    {title: "Test09", id: 8},
    {title: "Test10", id: 9},
    {title: "Test11", id:10},
    {title: "Test12", id:11},
    {title: "Test13", id:12},
    {title: "Test14", id:13},
    {title: "Test15", id:14},
    {title: "Test16", id:15},
]


export default function List() {
    const [blogLst, setBlogLst] = useState([] as BloggerListItemType[]);
    const [blogIdx, setBlogIdx] = useState(1);
    const [canLoading, setCanLoading] = useState(true);
    const [repoOwner, setRepoOwner] = useState(false);

    const refOverflow = useRef(null)
    const isVisible = useOnScreen(refOverflow);

    useEffect(() => {
        let updateRepoOwner = async () => {
            const isOwner = await githubIsRepoOwner();
            setRepoOwner(isOwner);
        };
        updateRepoOwner();
    },[])

    useEffect(() => {
        if(isVisible) {
            let updateLst = async () => {
                let newLstItem = await githubListBlogger(blogIdx);
                if(newLstItem.length < PAGE_SIZE) {
                    setCanLoading(false);
                }
                let newBlogLst = [...blogLst,...newLstItem];
                setBlogLst(newBlogLst);
                setBlogIdx(blogIdx+1);
            }
            updateLst()
        }
    }, [isVisible])

    return <div className="w-full h-full flex flex-col overflow-scroll">
        <table className="w-full text-left">
            <thead className="h-10 lstHeader">
                <tr>
                    <th className="w-12">ID</th>
                    <th>Title</th>
                    <th className="w-24">{repoOwner ? <LinkButton href="/editor?mode=create">Create</LinkButton> : ""}</th>
                </tr>
            </thead>
            <tbody>
                {blogLst.map((blog) => <BloggerListItem key={blog.id} title={blog.title} id={blog.id} content={blog.content} />)}
                <tr className="w-full h-10 text-center" ref={refOverflow}>
                    <td colSpan={3}>{canLoading ? "Loading ..." : "No more article."}</td>
                </tr>
            </tbody>
        </table>
    </div>
}