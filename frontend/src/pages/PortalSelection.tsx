import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, ArrowRight, CheckCircle2, Lock } from 'lucide-react';
import { api } from '../services/api';

export const PortalSelection: React.FC = () => {
  const navigate = useNavigate();
  const [chairmanExists, setChairmanExists] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkBootstrap = async () => {
      try {
        const res = await api.get('/auth/bootstrap-status');
        setChairmanExists(res.data.chairmanExists);
      } catch (err) {
        console.error('Failed to check bootstrap status:', err);
        setChairmanExists(false);
      } finally {
        setLoading(false);
      }
    };
    checkBootstrap();
  }, []);

  const handleChairmanPortalClick = () => {
    if (chairmanExists === false) {
      navigate('/chairman/setup');
    } else {
      navigate('/chairman/login');
    }
  };

  const handleManagementPortalClick = () => {
    navigate('/management/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-brand-500 selection:text-white relative overflow-hidden">
      {/* Subtle Background Glow Accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-brand-700/15 blur-3xl pointer-events-none rounded-full" />

      {/* Top Header */}
      <header className="relative z-10 max-w-7xl w-full mx-auto px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-700 to-brand-500 text-white flex items-center justify-center font-extrabold text-2xl shadow-lg shadow-brand-700/30">
            E
          </div>
          <div>
            <span className="text-xl font-bold text-white tracking-tight block">Elite Invitation</span>
            <span className="text-xs text-brand-400 font-semibold uppercase tracking-wider block">Management System (EIMS)</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 bg-slate-900/80 px-3.5 py-1.5 rounded-full border border-slate-800">
          <Lock className="w-3.5 h-3.5 text-brand-400" /> Enterprise Encrypted
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-5xl w-full mx-auto px-6 py-12 flex-1 flex flex-col justify-center items-center text-center">
        {/* Title */}
        <div className="max-w-2xl mx-auto mb-14">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Elite Invitation Management System
          </h1>
          <p className="text-sm sm:text-base text-slate-400 mt-4 leading-relaxed font-normal">
            Select your authorized portal to proceed to executive governance and event management.
          </p>
        </div>

        {/* TWO Portal Cards ONLY */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          {/* Card 1: Chairman's Portal */}
          <div
            onClick={handleChairmanPortalClick}
            className="group relative bg-gradient-to-b from-slate-900 to-slate-900/90 hover:from-brand-950 hover:to-slate-900 rounded-3xl p-8 border border-slate-800 hover:border-brand-600/60 shadow-xl hover:shadow-2xl hover:shadow-brand-700/20 transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer text-left flex flex-col justify-between"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-brand-700/20 border border-brand-500/30 text-brand-400 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-brand-600 group-hover:text-white transition-all duration-300 shadow-md">
                <Shield className="w-7 h-7" />
              </div>

              <h2 className="text-2xl font-bold text-white tracking-tight group-hover:text-brand-300 transition-colors">
                Chairman's Portal
              </h2>
              <p className="text-sm font-semibold text-brand-400 mt-1 uppercase tracking-wider">
                Executive Control
              </p>

              <p className="text-xs text-slate-400 mt-4 leading-relaxed">
                Full administrative authority, invitation approval engine, member governance, executive reporting, and activity auditing.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-white group-hover:text-brand-300">
              <span>
                {loading ? 'Checking status...' : chairmanExists === false ? 'Initialize System' : 'Access Chairman Portal'}
              </span>
              <div className="w-8 h-8 rounded-full bg-slate-800 group-hover:bg-brand-600 flex items-center justify-center text-white transition-colors">
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>

          {/* Card 2: Management Portal */}
          <div
            onClick={handleManagementPortalClick}
            className="group relative bg-gradient-to-b from-slate-900 to-slate-900/90 hover:from-slate-850 hover:to-slate-900 rounded-3xl p-8 border border-slate-800 hover:border-slate-700 shadow-xl hover:shadow-2xl hover:shadow-slate-800/50 transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer text-left flex flex-col justify-between"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-slate-700 group-hover:text-white transition-all duration-300 shadow-md">
                <Users className="w-7 h-7" />
              </div>

              <h2 className="text-2xl font-bold text-white tracking-tight group-hover:text-slate-200 transition-colors">
                Management Portal
              </h2>
              <p className="text-sm font-semibold text-slate-400 mt-1 uppercase tracking-wider">
                Authorized Members
              </p>

              <p className="text-xs text-slate-400 mt-4 leading-relaxed">
                Dedicated portal for PA, Executive Officers, Office Staff, and Family Members to submit and track invitation entries.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-white group-hover:text-slate-200">
              <span>Access Member Portal</span>
              <div className="w-8 h-8 rounded-full bg-slate-800 group-hover:bg-slate-700 flex items-center justify-center text-white transition-colors">
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl w-full mx-auto px-6 py-6 text-center text-xs text-slate-500 border-t border-slate-900">
        Elite Invitation Management System (EIMS) &copy; {new Date().getFullYear()} Executive Governance Platform. All Rights Reserved.
      </footer>
    </div>
  );
};
