import type { Metadata } from "next";
import "./globals.css";
import Modal from "./utils/modal";

export const metadata: Metadata = {
  title: "Issue-Blogger",
  description: "Blogger based on GitHub Issue",
};

type LayerProps = {
  children: React.ReactNode;
}
const Layer = (props: LayerProps) => {
  return <div className="fixed left-0 top-0 w-full h-full pointer-events-none">
    {props.children}
  </div>;
}

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  modal: React.ReactNode;
  children: React.ReactNode;
}>) {
  console.log("modal : ",modal);
  return (
    <html lang="en">
      <body className="w-full h-full">
        <Layer><div className="w-full h-full pointer-events-auto">{children}</div></Layer>
        <Layer>{modal}</Layer>
      </body>
    </html>
  );
}
