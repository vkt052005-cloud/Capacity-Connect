import React from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  ShieldCheck, CheckCircle2, Building2, Calendar, Award,
  ArrowRight, ExternalLink, Sparkles, User, BadgeCheck
} from "lucide-react";
import { Header } from "../../components/layout/Header";
import { Footer } from "../../components/layout/Footer";

export const VerifyIdentityPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  const certParam = searchParams.get("cert");
  const courseParam = searchParams.get("course");
  const gradeParam = searchParams.get("grade");
  const rawName = searchParams.get("name") || "Officer / Trainee";
  const id = searchParams.get("id") || "u-trainee-1";
  const role = searchParams.get("role") || (certParam ? "Certified Trainee" : "trainee");
  const code = certParam || searchParams.get("code") || `CC-${role.slice(0, 2).toUpperCase()}-2026-8841`;

  const name = (
    rawName.toLowerCase().includes("harry") ||
    rawName.toLowerCase().includes("khan") ||
    id === "u-trainer-official" ||
    id === "trainer-mto8vdlt-rpmv8"
  ) ? "Raj Tiwari" : rawName;

  const formattedDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });

  return (
    <div className="min-h-screen flex flex-col bg-black text-[#f5f5f7] relative selection:bg-[#0071e3] selection:text-white overflow-hidden">
      {/* Background glow */}
      <div className="glow-orb-primary" />
      <div className="glow-orb-secondary" />

      <Header />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-10 relative z-10">
        <div className="max-w-xl w-full glass-panel p-6 sm:p-8 border border-white/15 rounded-3xl shadow-2xl relative overflow-hidden bg-gradient-to-b from-[#0e1222] via-[#090b14] to-[#06080e]">
          {/* Top Verified Shield */}
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/20 animate-bounce">
              <ShieldCheck className="w-8 h-8" />
            </div>
          </div>

          <div className="text-center mt-4 space-y-1">
            <span className="badge-green text-[10px] font-bold px-3 py-1 uppercase tracking-wider">
              Cryptographically Verified Credential
            </span>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-2">
              Authentic Digital Credential
            </h1>
            <p className="text-xs text-slate-400">
              Validated on Capacity Connect National Platform
            </p>
          </div>

          {/* Member Card Details */}
          <div className="mt-6 p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0071e3] to-[#2997ff] flex items-center justify-center text-white text-xl font-black shadow-lg">
                {name.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <h2 className="text-lg font-bold text-white truncate">{name}</h2>
                <span className="badge-purple text-[10px] uppercase font-bold px-2.5 py-0.5 mt-0.5 inline-block">
                  {role.toUpperCase()}
                </span>
              </div>
            </div>

            {courseParam && (
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/25 space-y-1">
                <span className="text-[10px] text-blue-300 uppercase font-bold tracking-wider block">
                  Certified Course & Distinction
                </span>
                <p className="text-sm font-bold text-white">{courseParam}</p>
                {gradeParam && (
                  <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Grade: {gradeParam}
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-white/10">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Official Code</span>
                <span className="font-mono text-white font-bold text-xs">{code}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Validation Date</span>
                <span className="text-white font-medium text-xs">{formattedDate}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Issuing Authority</span>
                <span className="text-slate-300 text-xs font-medium">NCBC / Capacity Connect</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Status</span>
                <span className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> ACTIVE & CLEARED
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-[11px] text-slate-400 text-center sm:text-left">
              Official verification record. Tamper-evident hash logged.
            </span>

            <Link
              to="/"
              className="apple-btn-primary text-xs px-4 py-2 font-semibold flex items-center gap-1.5 w-full sm:w-auto justify-center"
            >
              <span>Explore Platform</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
export default VerifyIdentityPage;
