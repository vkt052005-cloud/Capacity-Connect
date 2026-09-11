import React from "react";
import { Link } from "react-router-dom";
import { Mail, MapPin } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-white/[0.08] bg-black/90 backdrop-blur-2xl mt-auto relative z-0">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand & Description */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Capacity Connect" className="w-12 h-12 object-contain drop-shadow-[0_0_15px_rgba(41,151,255,0.5)]" />
              <div>
                <span className="font-extrabold text-base text-white tracking-tight block">CAPACITY CONNECT</span>
                <span className="text-[10px] text-slate-400 block -mt-0.5">Continuous Learning & Certification Platform</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Digital Capacity Building & Learning Management Portal
            </p>
          </div>

          {/* Portals */}
          <div className="space-y-2.5 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider text-[10px]">Portals</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li><Link to="/trainee/dashboard" className="hover:text-white transition">Trainee Learning Suite</Link></li>
              <li><Link to="/trainer/dashboard" className="hover:text-white transition">Trainer Console</Link></li>
              <li><Link to="/admin/dashboard" className="hover:text-white transition">Executive Dashboard</Link></li>
              <li><Link to="/trainee/courses" className="hover:text-white transition">Course Catalog</Link></li>
            </ul>
          </div>

          {/* Features */}
          <div className="space-y-2.5 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider text-[10px]">Features</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li><Link to="/admin/competency" className="hover:text-white transition">Competency Mapping Engine</Link></li>
              <li><Link to="/trainee/assessments" className="hover:text-white transition">Proctored MCQ Assessment Engine</Link></li>
              <li><Link to="/trainee/certificates" className="hover:text-white transition">Verifiable Digital Certificates</Link></li>
              <li><Link to="/trainer/dashboard" className="hover:text-white transition">Live Classroom Sessions</Link></li>
            </ul>
          </div>

          {/* Official Contact & Support */}
          <div className="space-y-2.5 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider text-[10px]">Official Contact & Campus</h4>
            <div className="space-y-3 text-slate-400">
              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-[#2997ff] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Official Support Email</span>
                  <a
                    href="mailto:capacityconnect.org@gmail.com"
                    className="text-white hover:text-[#2997ff] transition break-all font-medium"
                  >
                    capacityconnect.org@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#2997ff] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Campus Location</span>
                  <p className="text-slate-300 leading-snug">
                    <strong className="text-white">GGSIPU EDC BOYS HOSTEL</strong><br />
                    <span className="text-[11px] text-slate-400">Guru Gobind Singh Indraprastha University<br />East Delhi Campus, Surajmal Vihar, Delhi - 110092</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© 2026 CAPACITY CONNECT. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
