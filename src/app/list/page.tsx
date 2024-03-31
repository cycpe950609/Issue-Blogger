"use client"
import { useEffect, useRef, useState } from "react"
import useOnScreen from "../utils/useOnScreen";
import { githubIsRepoOwner, githubListBlogger } from "../github";
import Link from "next/link";
import LinkButton from "../utils/button";
import { useRouter } from "next/navigation";
import dayjs, { Dayjs } from "dayjs";
import { LOAD_PAGE_SIZE, TIME_FORMAT } from "../utils/globalParams";

export type BloggerListItemType = {
    title: string;
    id: number;
    create: Date;
    update: Date;
}
type BloggerListItemProps = BloggerListItemType & {}

const BloggerListItem = (props: BloggerListItemProps) => {
    const router = useRouter()
    return <tr 
        className="w-full h-10 lstItem hover:bg-gray-100" 
        onClick={(e) => {router.push(`/viewer?id=${props.id}`)}}
    >   
        <th>{props.id}</th>
        <th colSpan={2}>
            <div className="flex flex-col">
                <span>{props.title}</span>
                <span className="font-light text-gray-800 text-xs">
                    {`Create : ${dayjs(props.create).format(TIME_FORMAT)}, Update : ${dayjs(props.update).format(TIME_FORMAT)}`}
                </span>
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

    const refScroll = useRef<HTMLDivElement>(null)
    const refWindowSize = useRef<HTMLDivElement>(null)
    const refOverflow = useRef<HTMLDivElement>(null)

    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        let updateRepoOwner = async () => {
            const isOwner = await githubIsRepoOwner();
            setRepoOwner(isOwner);
        };
        updateRepoOwner();
    },[])

    const isLoadingVisible = () => {
        let refLoading = refOverflow.current;
        if(refLoading === null) return false;
        let refWindow = refWindowSize.current;
        if(refWindow === null) return false;
    
        const xLoading = refLoading.getBoundingClientRect().top;
        const hWindow = refWindow.getBoundingClientRect().height;
        // console.log(xLoading, hWindow)
        let visible = xLoading < hWindow;
        return visible;
    }

    useEffect(() => {
        let scrollHandler = (e?: any) => {
            if(e !== undefined)
                e.preventDefault();
            let visible = isLoadingVisible();
            setIsVisible(visible);
        }
        let ref = refScroll.current;
        if(ref === null) return;
        ref.addEventListener("scroll", scrollHandler);
        scrollHandler();
        return () => {
            if(ref === null) return;
            ref.removeEventListener("scroll", scrollHandler);
        }
    },[])

    useEffect(() => {
        let checkVisible = isLoadingVisible();
        if(checkVisible && canLoading) {
            // console.log("Load more at ", blogIdx);
            let updateLst = async () => {
                let newLstItem = await githubListBlogger(blogIdx);
                if(newLstItem.length < LOAD_PAGE_SIZE) {
                    setCanLoading(false);
                }
                let newBlogLst = [...blogLst,...newLstItem];
                setBlogLst(newBlogLst);
                setBlogIdx(blogIdx+1);
            }
            updateLst()
        }
    },[isVisible, blogIdx])

    return <div className="w-full h-full flex flex-col overflow-scroll" ref={refScroll}>
        <table className="w-full text-left">
            <thead className="h-10 lstHeader">
                <tr>
                    <th className="w-12">ID</th>
                    <th>Title</th>
                    <th className="w-24">{repoOwner ? <LinkButton href="/editor?mode=create">Create</LinkButton> : ""}</th>
                </tr>
            </thead>
            <tbody>
                {blogLst.map((blog) => <BloggerListItem key={blog.id} {...blog} />)}
                <tr className="w-full h-10 text-center" ref={refOverflow}>
                    <td colSpan={3}>{canLoading ? "Loading ..." : "No more article."}</td>
                </tr>
            </tbody>
        </table>
        <div ref={refWindowSize} className="w-full h-full pointer-events-none fixed top-0 left-0"></div>
    </div>
}