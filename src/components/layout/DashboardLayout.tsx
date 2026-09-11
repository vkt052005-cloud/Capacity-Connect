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
    <div className="min-h-screen min-h-[100dvh] flex flex-col bg-[#000000] text-[#f5f5f7] relative selection:bg-[#0071e3] selection:text-white">
      {/* Ambient Apple Glow Orbs */}
      <div className="glow-orb-primary" />
      <div className="glow-orb-secondary" />

      <Header />
      <GlobalLiveClassBanner />

      <div className="flex-1 flex w-full relative z-10">
        <Sidebar />

        <main className="flex-1 min-w-0 px-3.5 py-4 sm:px-6 sm:py-6 lg:p-8 space-y-5 sm:space-y-6">
          {/* Breadcrumb Trail */}
          {breadcrumbs.length > 0 && (
            <nav className="flex items-center gap-1.5 sm:gap-2 text-[10.5px] sm:text-[11px] text-slate-400 font-medium overflow-x-auto no-scrollbar py-0.5">
              {breadcrumbs.map((b, i) => (
                <React.Fragment key={i}>
                  {b.to ? (
                    <a href={b.to} className="hover:text-[#2997ff] transition shrink-0">{b.label}</a>
                  ) : (
                    <span className="text-slate-200 font-semibold shrink-0">{b.label}</span>
                  )}
                  {i < breadcrumbs.length - 1 && <span className="text-slate-600 shrink-0">/</span>}
                </React.Fragment>
              ))}
            </nav>
          )}

          {pageTitle && (
            <h1 className="text-lg sm:text-2xl font-extrabold text-white tracking-tight">
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
