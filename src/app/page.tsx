"use client"
import { useContext, useEffect, useRef, useState } from "react"
import LinkButton, { BUTTON_CSS_CLASS } from "./utils/button";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { TIME_FORMAT } from "./utils/globalParams";
import { getCookiesMgr } from "./utils/cookiesMgr";
import RepoOwnerComponent from "./utils/RepoOwnerComp";
import { twMerge } from "tailwind-merge";
import { LoginStateContext } from "./utils/LoginStateContext";
import { BloggerListContext, BloggerListItemType } from "./utils/BloggerListContext";



const BloggerListItem = (props: BloggerListItemType) => {
    const router = useRouter()
    return <tr 
        className="w-full h-10 lstItem hover:bg-gray-100 cursor-pointer select-none" 
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

const BtnLogout = () => {
    const router = useRouter();
    const loginState = useContext(LoginStateContext);
    return <button className={twMerge(BUTTON_CSS_CLASS, "bg-amber-500 border-amber-900")}
        onClick={() => {
            const [cookies, setCookies] = getCookiesMgr();
            setCookies("access_token");
            loginState.setIsLogin(false);
            loginState.setIsOwner(false);
            router.push("/");
        }}
    >Logout</button>
}

export default function HomeList() {
    const route = useRouter(); 

    // const [blogLst, setBlogLst] = useState([] as BloggerListItemType[]);
    // const [blogIdx, setBlogIdx] = useState(1);
    // const [canLoading, setCanLoading] = useState(true);

    const refScroll = useRef<HTMLDivElement>(null)
    // const refWindowSize = useRef<HTMLDivElement>(null)
    const refOverflow = useRef<HTMLTableRowElement>(null)

    const [isVisible, setIsVisible] = useState(false);

    const isLoadingVisible = () => {
        let refLoading = refOverflow.current;
        if(refLoading === null) return false;
        let refWindow = refScroll.current;
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

    const blogState = useContext(BloggerListContext);

    useEffect(() => {
        let checkVisible = isLoadingVisible();
        if(checkVisible && blogState.canLoading) {
            blogState.loadNextPage();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[blogState.lastLoadIdx, isVisible])

    return <div className="w-full h-full flex flex-col overflow-scroll" ref={refScroll}>
        <table className="w-full text-left">
            <thead className="h-10 lstHeader">
                <tr>
                    <th className="w-12">ID</th>
                    <th>Title</th>
                    <th className="w-24">
                        <RepoOwnerComponent 
                            isOwner={<>
                                <BtnLogout/>
                                <LinkButton href="/editor?mode=create">Create</LinkButton>
                            </>} 
                            isGuest={<>
                                <BtnLogout/>
                            </>} 
                            notLogin={<LinkButton className="bg-blue-500 border-blue-900" href="/login">Login</LinkButton>}
                        />
                    </th>
                </tr>
            </thead>
            <tbody>
                {blogState.blogList().map( blog =>  <BloggerListItem key={blog.id} {...blog} /> )}
                <tr className="w-full h-10 text-center" ref={refOverflow}>
                    <td colSpan={3}>{blogState.canLoading ? "Loading ..." : "No more article."}</td>
                </tr>
            </tbody>
        </table>
        {/* <div ref={refWindowSize} className="w-full h-full pointer-events-none fixed top-0 left-0"></div> */}
    </div>
}