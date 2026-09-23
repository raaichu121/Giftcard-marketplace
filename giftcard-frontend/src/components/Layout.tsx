import React, { ReactNode } from "react";
import SiteHeader from "@/components/SiteHeader";
import NepalFooter from "@/components/Footer";

interface LayoutProps {
  children: ReactNode;
  activePath?: string;
  showFooter?: boolean;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  activePath = "/",
  showFooter = false,
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SiteHeader activePath={activePath} />
      <main className="flex-1 w-full">{children}</main>
      {showFooter && <NepalFooter />}
    </div>
  );
};

export default Layout;
