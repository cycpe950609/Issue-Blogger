'use client'
import { useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"

export default function Error({
    error,
    reset,
}: {
    error: Error
    reset: () => void
}) {
    const [time, setTime] = useState(2)
    const router = useRouter();
    useEffect(() => {
        let timeout = setInterval(()=>{
            if(time > 0)
                setTime(time - 1)
            if(time === 0)
                router.push("/")
            window.location.reload()
        },1000)
        return () => {
            clearInterval(timeout)
        }
    })
    return (
        <html>
            <body>
                <div className="w-full h-full flex flex-col justify-center items-center">
                    <span className="text-red-600">Something went wrong!</span>
                    <span>{error.message}</span>
                    <span>Reload in {time} secs</span>
                </div>
            </body>
        </html>
    )
}