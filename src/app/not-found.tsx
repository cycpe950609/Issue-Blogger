'use client'
import { useEffect } from "react"
import { useRouter, usePathname } from 'next/navigation'

export default function NotFound() {
    const router = useRouter();
    const pathName = usePathname();
    useEffect(() =>{
        setTimeout(() => {
            router.push('/')
        },5000)
    })
    return <div className="h-full w-full flex flex-col items-center justify-center">
        <span>Page <span className="text-red-500 font-bold">{pathName.substring(1)}</span> Not Found</span>
        <span>Jump back to home in <span className="text-red-500">5 secs</span></span>
    </div>
}