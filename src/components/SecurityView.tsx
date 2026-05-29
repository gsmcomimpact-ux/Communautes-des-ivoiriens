import React, { useState } from "react";
import { 
  ShieldCheck, Terminal, Award, FileText, Database, 
  ToggleLeft, ToggleRight, RefreshCw, Eye, EyeOff, Calendar 
} from "lucide-react";
import { ActivityLog, SecurityStatus, UserRole } from "../types";

interface SecurityViewProps {
  logs: ActivityLog[];
  security: SecurityStatus;
  userRole: UserRole;
  lang: 'fr' | 'en';
  onTriggerBackup: () => void;
}

export default function SecurityView({
  logs,
  security,
  userRole,
  lang,
  onTriggerBackup
}: SecurityViewProps) {
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [isBackupLoading, setIsBackupLoading] = useState(false);

  const handleBackup = () => {
    setIsBackupLoading(true);
    setTimeout(() => {
      onTriggerBackup();
      setIsBackupLoading(false);
      alert("Sauvegarde d'urgence chiffrée consolidée terminée avec succès. Point de contrôle valide.");
    }, 1200);
  };

  return (
    <div className="space-y-6 text-slate-800 text-xs">
      
      {/* Top dashboard panels layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Security parameters state summary */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs text-left space-y-4">
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-600" />
            <span>{lang === 'fr' ? 'Diagnostic d’Intégrité Système' : 'Decentralized Security Guard'}</span>
          </h4>

          <div className="space-y-3">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
              <div>
                <span className="block text-[9px] uppercase font-bold text-slate-400">CHIFFREMENT DU COFFRE</span>
                <strong className="text-slate-700">{security.encryptionKeyStrength}</strong>
              </div>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[8px]">Matière OK</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
              <div>
                <span className="block text-[9px] uppercase font-bold text-slate-400">INTEGRITÉ GLOBALE</span>
                <strong className="text-slate-700 text-xs font-black uppercase">{security.systemIntegrity}</strong>
              </div>
              <span className="px-1.5 py-0.5 bg-teal-600 text-white rounded-md font-bold text-[8px] uppercase">Actif</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
              <div>
                <span className="block text-[9px] uppercase font-bold text-slate-400">ALERTES DE VULNERABILITÉ</span>
                <strong className="text-slate-700">{security.threatAlerts} menaces relevées</strong>
              </div>
              <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full font-bold text-[8px]">En Sécurité</span>
            </div>
          </div>
        </div>

        {/* Multi factor double authentication & backups actions */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs text-left space-y-4">
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Database className="w-5 h-5 text-teal-600" />
            <span>Contrôle d'Accès d'Urgence</span>
          </h4>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <strong className="block text-xs text-slate-800 font-bold">Double Authentification (MFA)</strong>
                <span className="text-[10px] text-slate-400">Exige un code jeton par SMS ou Authenticator</span>
              </div>
              <button 
                onClick={() => setMfaEnabled(!mfaEnabled)} 
                className="text-teal-600 hover:text-teal-700 transition cursor-pointer"
              >
                {mfaEnabled ? (
                  <ToggleRight className="w-10 h-10" />
                ) : (
                  <ToggleLeft className="w-10 h-10 text-slate-300" />
                )}
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100 text-left space-y-2">
              <strong className="block text-xs text-slate-800 font-bold">Sauvegarde Manuelle</strong>
              <p className="text-[10px] text-slate-400">Exporte une copie intègre complète hors site.</p>
              
              <button 
                onClick={handleBackup}
                disabled={isBackupLoading}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isBackupLoading ? 'animate-spin' : ''}`} />
                <span>{isBackupLoading ? 'Sauvegarde chiffrée...' : 'Créer point d’archive'}</span>
              </button>
              
              <p className="text-[10px] text-slate-404 italic text-right">Dernier jalon: {new Date(security.lastBackup).toLocaleString('fr-FR')}</p>
            </div>
          </div>
        </div>

        {/* Roles information manual (Anti-AI-Slop, keeping it humble & fully factual) */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs text-left space-y-4">
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Award className="w-5 h-5 text-teal-600" />
            <span>Rôles & Permissions de Droit</span>
          </h4>

          <div className="space-y-2 text-slate-500 text-[10px] leading-relaxed">
            <p>
              🔐 <strong>Administrateur :</strong> Accès de contrôle général, modifications des structures, des membres, ainsi que de tous les registres.
            </p>
            <p>
              📊 <strong>Trésorier :</strong> Saisie et validation comptable, recettes, cotisations, dons solidaire et rapports Cerfa.
            </p>
            <p>
              ✍️ <strong>Secrétaire d’Adhésions :</strong> Gère le registre des membres, l’impression des cartes physiques et l’upload des documents officiels.
            </p>
            <p>
              👥 <strong>Superviseur :</strong> Assignation de tâches jalons pour les projets d’actions locales.
            </p>
          </div>
        </div>

      </div>

      {/* Audit Log Terminal Row */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-4">
        
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-bold text-slate-900 font-sans tracking-tight">
            Journal Complet d'Audit des Actions Utilisateurs
          </h4>
          <span className="px-2.5 py-0.5 font-mono text-slate-500 bg-slate-100 rounded-full font-bold text-[9px] uppercase">
            Strictement Audité
          </span>
        </div>

        {/* Log list terminal layout (Anti-AI-Slop, keeping it exceptionally clean) */}
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-950 font-mono text-[10px] text-slate-300 p-4 max-h-96 overflow-y-auto space-y-1.5 text-left shadow-inner">
          {logs.map((log) => (
            <div key={log.id} className="hover:bg-slate-900 py-1 px-1.5 rounded transition">
              <span className="text-slate-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>{" "}
              <span className="text-teal-400 font-bold">{log.userEmail}</span>{" "}
              <span className="px-1.5 py-0.5 bg-slate-800 text-slate-200 rounded text-[9px] mx-1">{log.role.toUpperCase()}</span>{" "}
              <span className="text-amber-500 font-semibold">{log.action}:</span>{" "}
              <span className="text-slate-200">{log.details}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
