import React from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";
import { ToastContainer } from "../common/ToastContainer";
import { LiveMeetClassroom } from "../live/LiveMeetClassroom";
import { GlobalLiveClassBanner } from "./GlobalLiveClassBanner";

interface DashboardLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
  breadcrumbs?: { label: string; to?: string }[];
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  pageTitle,
  breadcrumbs = []
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#000000] text-[#f5f5f7] relative selection:bg-[#0071e3] selection:text-white">
      {/* Ambient Apple Glow Orbs */}
      <div className="glow-orb-primary" />
      <div className="glow-orb-secondary" />

      <Header />
      <GlobalLiveClassBanner />

      <div className="flex-1 flex w-full relative z-10">
        <Sidebar />

        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Breadcrumb Trail */}
          {breadcrumbs.length > 0 && (
            <nav className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
              {breadcrumbs.map((b, i) => (
                <React.Fragment key={i}>
                  {b.to ? (
                    <a href={b.to} className="hover:text-[#2997ff] transition">{b.label}</a>
                  ) : (
                    <span className="text-slate-200 font-semibold">{b.label}</span>
                  )}
                  {i < breadcrumbs.length - 1 && <span className="text-slate-600">/</span>}
                </React.Fragment>
              ))}
            </nav>
          )}

          {pageTitle && (
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {pageTitle}
            </h1>
          )}

          {children}
        </main>
      </div>

      <Footer />
      <ToastContainer />
      <LiveMeetClassroom />
    </div>
  );
};
