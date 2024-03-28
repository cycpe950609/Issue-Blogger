"use client"
import { useEffect, useRef, useState } from "react"
import useOnScreen from "../utils/useOnScreen";
import { githubListBlogger } from "../github";

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
        <th>
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
    const [lastPage, setLastPage] = useState(0);
    const [canLoading, setCanLoading] = useState(false);

    const refOverflow = useRef(null)
    const isVisible = useOnScreen(refOverflow);

    useEffect(() => {
        if(isVisible) {
            let updateLst = async () => {
                let newLstItem = await githubListBlogger(blogIdx);
                if(newLstItem.length < PAGE_SIZE) {
                    setCanLoading(false);
                }
                let newBlogLst = [...blogLst,...newLstItem];
                setBlogLst(newBlogLst);
                setLastPage(lastPage+1);
            }
            updateLst()
        }
    }, [isVisible])

    return <div className="w-full h-full flex flex-col overflow-scroll">
        <table className="w-full text-left">
            <thead className="h-10 lstHeader">
                <tr>
                    <th>ID</th>
                    <th>Title</th>
                </tr>
            </thead>
            <tbody>
                {blogLst.map((blog) => <BloggerListItem key={blog.id} title={blog.title} id={blog.id} content={blog.content} />)}
                <tr className="w-full h-10 text-center" ref={refOverflow}>
                    <td colSpan={2}>{canLoading ? "Loading ..." : "No more article."}</td>
                </tr>
            </tbody>
        </table>
    </div>
}