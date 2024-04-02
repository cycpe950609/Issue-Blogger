"use client"
import React, { useState } from "react";
import { procResponse } from "./errorHandlerClient";
import { githubCreateIssue, githubDeleteIssue, githubListIssue, githubUpdateIssue } from "./github";
import { useRouter } from "next/navigation";
import { LOAD_PAGE_SIZE } from "./globalParams";

export type BloggerListItemType = {
    title: string;
    id: number;
    create: Date;
    update: Date;
}
type BloggerListItemProps = BloggerListItemType & {}

export const BloggerListContext = React.createContext({
    blogList: () => [] as BloggerListItemType[],
    lastLoadIdx: 1,
    lastLoadedBlogIdx: 1,
    canLoading: true,
    loadNextPage: async () => true,
    createPost: async (title: string, content: string) => true,
    updatePost: async (id: number, title: string, content: string) => true,
    deletePost: async (id: number) => true,
});

export default function BloggerListProvider(props: {children: React.ReactNode}) {

    const router = useRouter();

    const [blogList, setBlogList] = useState({} as {[idx:number]:BloggerListItemType[]});
    const [ID2List, setID2List] = useState({} as {[idx:number]:{lstID:number, idx:number}});
    const [lastLoadedBlogIdx, setLastLoadedBlogIdx] = useState(1);
    const [canLoading, setCanLoading] = useState(true);

    const loadNextPage = async () => {
        console.log("loadNextPage", lastLoadedBlogIdx)
        if(canLoading) {
            let newLstItem = procResponse(await githubListIssue(lastLoadedBlogIdx),router);
            // console.log("newLstItem",newLstItem);
            if(newLstItem.length < LOAD_PAGE_SIZE) {
                setCanLoading(false);
            }
            let newBlogLst = {...blogList};
            newBlogLst[lastLoadedBlogIdx] = newLstItem;
            setBlogList(newBlogLst);
            setLastLoadedBlogIdx(lastLoadedBlogIdx+1);

            let newID2List = {...ID2List};
            newLstItem.forEach((item:BloggerListItemType, idx:number) => {
                newID2List[item.id] = {lstID: lastLoadedBlogIdx, idx: idx};
            });
            setID2List(newID2List);
            return true;
        }
        return false;
    }

    const flattenBlogList = () => {
        let rtv = [] as BloggerListItemType[];
        Object.values(blogList).forEach((lst:BloggerListItemType[]) => {
            console.log("lst",lst);
            rtv = rtv.concat(lst);
        });
        console.log("flattenBlogList", rtv);
        return rtv;
    }

    const createPost = async (title: string, content: string) => {
        let post = procResponse(await githubCreateIssue(title, content),router);
        if(post !== undefined && !canLoading) {
            let newBlogLst = {...blogList};
            if(newBlogLst[lastLoadedBlogIdx-1].length < LOAD_PAGE_SIZE) {
                let len = newBlogLst[lastLoadedBlogIdx-1].length
                newBlogLst[lastLoadedBlogIdx-1].push(post);
                setBlogList(newBlogLst);

                let newID2List = {...ID2List};
                newID2List[post.id] = {lstID: lastLoadedBlogIdx-1, idx: len}
                setID2List(newID2List);
            }
            else {
                setCanLoading(true);
            }
            return true;
        }
        return false;
    }

    const updatePost = async (id: number, title: string, content: string) => {
        let success = procResponse(await githubUpdateIssue(id, title, content),router);
        if(success) {
            let lstID = ID2List[id].lstID;
            let idx = ID2List[id].idx;
            let newBlogLst = {...blogList};
            newBlogLst[lstID][idx].title = title;
            newBlogLst[lstID][idx].update = new Date();
            setBlogList(newBlogLst);
            return true;
        }
        return false;
    }

    const deletePost = async (id: number) => {
        let success = procResponse(await githubDeleteIssue(id), router)
        if(success) {
            let lstID = ID2List[id].lstID;
            let idx = ID2List[id].idx;
            let newBlogLst = {...blogList};
            newBlogLst[lstID].splice(idx, 1);
            setBlogList(newBlogLst);

            let newID2List = {...ID2List};
            delete newID2List[id];
            newBlogLst[lstID].forEach((item:BloggerListItemType, idx:number) => {
                newID2List[item.id] = {lstID: lstID, idx: idx};
            });
            setID2List(newID2List);
            return true;
        }
        return false;
    }

    return <BloggerListContext.Provider value={{
        blogList: flattenBlogList,
        lastLoadIdx: lastLoadedBlogIdx,
        lastLoadedBlogIdx: lastLoadedBlogIdx,
        canLoading: canLoading,
        loadNextPage: loadNextPage,
        createPost: createPost,
        updatePost: updatePost,
        deletePost: deletePost
    }}>
        {props.children}
    </BloggerListContext.Provider>
}