import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  Building,
  Zap,
  ArrowRight,
  Database,
  CheckCircle2
} from 'lucide-react';
import { InteractiveEngineerAvatar } from './InteractiveEngineerAvatar';
import { supabase } from '../lib/supabaseClient';

export interface EngineerProfile {
  name: string;
  email: string;
  designation: 'Junior Engineer (JE)' | 'Asst. Executive Engineer (AEE)' | 'Executive Engineer (EE)';
  division: string;
  isOfflineMode: boolean;
}

export interface AuthScreenProps {
  onAuthenticated: (profile: EngineerProfile) => void;
  currentProfile?: EngineerProfile | null;
  onContinueToHub?: () => void;
  hideEmbeddedAvatar?: boolean;
  onPasswordFocusChange?: (focused: boolean) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onAuthenticated,
  currentProfile,
  onContinueToHub,
  hideEmbeddedAvatar = false,
  onPasswordFocusChange,
}) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState(currentProfile?.email || '');
  const [password, setPassword] = useState('');
  const [engineerName, setEngineerName] = useState(currentProfile?.name || 'Er. Pranjal Barua');
  const [designation, setDesignation] = useState<EngineerProfile['designation']>(
    currentProfile?.designation || 'Asst. Executive Engineer (AEE)'
  );
  const [division, setDivision] = useState(
    currentProfile?.division || 'Golaghat Road Division, PWD (Civil)'
  );

  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Handle Supabase Authentication
  const handleSupabaseAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (authMode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: engineerName,
              designation,
              division,
            },
          },
        });
        if (error) throw error;
        setSuccessMessage('Account created successfully! Logging you in...');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setSuccessMessage('Welcome back, Engineer!');
      }

      setTimeout(() => {
        onAuthenticated({
          name: engineerName,
          email,
          designation,
          division,
          isOfflineMode: false,
        });
      }, 700);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // 1-Click Offline Site Engineer Mode Bypass
  const handleOfflineMode = () => {
    onAuthenticated({
      name: engineerName || 'Site Engineer',
      email: email || 'engineer.offline@pwd.assam.gov.in',
      designation,
      division,
      isOfflineMode: true,
    });
  };

  return (
    <div className={`py-2 mx-auto ${hideEmbeddedAvatar ? 'max-w-2xl' : 'grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-6xl'}`}>
      {/* LEFT COLUMN: Interactive Mouse-Tracking Avatar (only if not hidden) */}
      {!hideEmbeddedAvatar && (
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-full max-w-md">
            <InteractiveEngineerAvatar
              isPasswordFocused={isPasswordFocused}
              engineerName={engineerName || 'Milim • AI Estimator'}
              designation={designation}
              statusMessage="Namaskar! Sign in to sync your estimates with Supabase Cloud, or click 'Continue as Offline Site Engineer' below."
            />
          </div>
        </div>
      )}

      {/* RIGHT COLUMN: Glassmorphic Supabase Auth Card */}
      <div className={hideEmbeddedAvatar ? 'w-full' : 'lg:col-span-7'}>
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          {/* Active Profile Banner if already authenticated */}
          {currentProfile && (
            <div className="bg-blue-950/70 border border-blue-800/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-white">
                    Active Session: {currentProfile.name}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-900 text-blue-200">
                    {currentProfile.designation}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  {currentProfile.division} • {currentProfile.isOfflineMode ? 'Offline Field Mode' : 'Cloud Connected'}
                </p>
              </div>

              {onContinueToHub && (
                <button
                  type="button"
                  onClick={onContinueToHub}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all shrink-0"
                >
                  <span>Go to Step 2: Hub</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Header & Department Banner */}
          <div className="space-y-2 border-b border-slate-800 pb-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-blue-600/30 text-blue-300 border border-blue-500/30 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-blue-400" />
                PWD (Civil) Assam
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800/80 flex items-center gap-1">
                <Database className="w-3 h-3" />
                Supabase: 29 DSR Items Seeded
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Step 1: Engineer Authentication & Profile</span>
            </h2>
            <p className="text-xs text-slate-400">
              Authenticate with your departmental credentials or proceed in offline field mode. Your designation will appear on official PWD signature blocks.
            </p>
          </div>

          {/* Mode Tabs (Sign In vs Create Account) */}
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                authMode === 'signin'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In with Cloud
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                authMode === 'signup'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Departmental Account
            </button>
          </div>

          {/* Error / Success Alerts */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-xs">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSupabaseAuth} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  Engineer Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={engineerName}
                    onChange={(e) => setEngineerName(e.target.value)}
                    placeholder="e.g. Er. Pranjal Barua"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  Official Designation
                </label>
                <select
                  value={designation}
                  onChange={(e) =>
                    setDesignation(e.target.value as EngineerProfile['designation'])
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Junior Engineer (JE)">Junior Engineer (JE)</option>
                  <option value="Asst. Executive Engineer (AEE)">
                    Asst. Executive Engineer (AEE)
                  </option>
                  <option value="Executive Engineer (EE)">Executive Engineer (EE)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-300 block mb-1">
                PWD Division / Sub-Division
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Building className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                  placeholder="e.g. Golaghat Road Division, PWD (Civil)"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-300 block mb-1">
                Work Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="engineer@pwd.assam.gov.in"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-medium text-slate-300">
                  Account Password
                </label>
                <span className="text-[10px] text-pink-300 font-mono">
                  (Watch avatar react!)
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onFocus={() => {
                    setIsPasswordFocused(true);
                    onPasswordFocusChange?.(true);
                  }}
                  onBlur={() => {
                    setIsPasswordFocused(false);
                    onPasswordFocusChange?.(false);
                  }}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-2.5">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30 transition-all active:scale-95"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>
                      {authMode === 'signin' ? 'Sign In & Connect' : 'Register Account'}
                    </span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-800" />
                <span className="flex-shrink mx-3 text-[10px] text-slate-500 uppercase font-mono">
                  OR FIELD DEPLOYMENT
                </span>
                <div className="flex-grow border-t border-slate-800" />
              </div>

              {/* 1-Click Offline Site Engineer Bypass */}
              <button
                type="button"
                onClick={handleOfflineMode}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-750 text-emerald-400 border border-emerald-800/60 flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xs"
              >
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>Continue as Offline Site Engineer (No Login Required)</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
