import type { Metadata } from "next";
import "./globals.css";
import React, { Suspense } from "react";
import LoginStateContext from "./utils/LoginStateContext";
import LoginStateProvider from "./utils/LoginStateContext";
import BloggerListProvider from "./utils/BloggerListContext";

export const metadata: Metadata = {
  title: "Issue-Blogger",
  description: "Blogger based on GitHub Issue",
};

type LayerProps = {
  children: React.ReactNode;
}
const Layer = (props: LayerProps) => {
  return <>
    {/* <Suspense> */}
      <div className="fixed left-0 top-0 w-full h-full pointer-events-none">
        {props.children}
      </div>
    {/* </Suspense> */}
  </>
}

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  modal: React.ReactNode;
  children: React.ReactNode;
}>) {


  return (
    <html lang="en">
      <body className="w-full h-full">
        <LoginStateProvider>
          <BloggerListProvider>
            <Layer><div className="w-full h-full pointer-events-auto">{children}</div></Layer>
            <Layer>{modal}</Layer>
          </BloggerListProvider>
        </LoginStateProvider>
      </body>
    </html>
  );
}
