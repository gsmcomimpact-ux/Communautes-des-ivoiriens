import React, { useState } from "react";
import { 
  Sparkles, ShieldAlert, Cpu, Award, FileText, 
  Settings, CheckCircle, RefreshCw, AlertTriangle, Send 
} from "lucide-react";
import { AIAnalysisResult } from "../types";

interface AiViewProps {
  lang: 'fr' | 'en';
  dict: any;
  onRunAudit: () => Promise<AIAnalysisResult>;
  onGenerateAssemblyReport: () => Promise<string>;
}

export default function AiView({
  lang,
  dict,
  onRunAudit,
  onGenerateAssemblyReport
}: AiViewProps) {
  // States
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [assemblyReport, setAssemblyReport] = useState<string | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [isAssembling, setIsAssembling] = useState(false);

  // Triggering the financial anomaly detection
  const handleRunAudit = async () => {
    setIsAuditing(true);
    setAnalysisResult(null);
    try {
      const res = await onRunAudit();
      setAnalysisResult(res);
    } catch (err) {
      alert("Erreur lors de l'audit intelligent.");
    } finally {
      setIsAuditing(false);
    }
  };

  // Triggering the ASM report generation
  const handleGenerateReport = async () => {
    setIsAssembling(true);
    setAssemblyReport(null);
    try {
      const report = await onGenerateAssemblyReport();
      setAssemblyReport(report);
    } catch (err) {
      alert("Erreur lors de la rédaction du rapport.");
    } finally {
      setIsAssembling(false);
    }
  };

  // Convert simple markdown string to clean, well-spaced HTML paragraphs & headings
  const renderSimpleMarkdown = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      const cleanLine = line.trim();
      if (!cleanLine) return <div key={idx} className="h-2"></div>;

      // Check for headings
      if (cleanLine.startsWith("###")) {
        return (
          <h5 key={idx} className="text-sm font-bold text-teal-800 uppercase mt-4 mb-2 tracking-wide font-sans text-left">
            {cleanLine.replace("###", "").trim()}
          </h5>
        );
      }
      if (cleanLine.startsWith("##")) {
        return (
          <h4 key={idx} className="text-base font-bold text-slate-900 border-b border-slate-200 pb-1 mt-5 mb-3 font-sans text-left">
            {cleanLine.replace("##", "").trim()}
          </h4>
        );
      }
      if (cleanLine.startsWith("#")) {
        return (
          <h3 key={idx} className="text-xl font-black text-teal-900 mt-6 mb-4 font-sans text-left uppercase">
            {cleanLine.replace("#", "").trim()}
          </h3>
        );
      }

      // Check for bullet list
      if (cleanLine.startsWith("*") || cleanLine.startsWith("-")) {
        return (
          <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 ml-4 py-0.5 text-left">
            <span className="text-teal-600 font-bold shrink-0">•</span>
            <span>{cleanLine.slice(1).trim()}</span>
          </div>
        );
      }

      // Standard paragraph
      return (
        <p key={idx} className="text-xs text-slate-700 leading-relaxed text-left py-1">
          {cleanLine}
        </p>
      );
    });
  };

  return (
    <div className="space-y-6 text-slate-800">
      
      {/* Upper overview box */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-2 text-left">
          <div className="px-2.5 py-0.5 bg-teal-500/20 text-teal-300 font-mono font-bold text-[9px] rounded-full inline-flex items-center gap-1.5 uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Superviseur IA Actif (Gemini 2.5)</span>
          </div>
          <h3 className="text-2xl font-black font-sans tracking-tight">Supervision Opérationnelle Autonome</h3>
          <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
            Vérifiez l’adéquation budgétaire, détectez les éventuelles anomalies comportementales ou erreurs comptables de facturation, et concevez automatiquement les rapports récapitulatifs globaux d'une assemblée.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={handleRunAudit}
            disabled={isAuditing}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs shrink-0"
          >
            <Cpu className="w-4 h-4" />
            <span>{isAuditing ? dict.generating : dict.anomaliesDetect}</span>
          </button>

          <button 
            onClick={handleGenerateReport}
            disabled={isAssembling}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 disabled:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs shrink-0"
          >
            <FileText className="w-4 h-4" />
            <span>{isAssembling ? dict.generating : dict.generateReport}</span>
          </button>
        </div>
      </div>

      {/* Split output areas depending on what is triggered */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left column: Audit Scans results */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-xs p-5 space-y-4">
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-left border-b border-slate-100 pb-3">
            🎯 {dict.anomalyTitle}
          </h4>

          {analysisResult ? (
            <div className="space-y-4 text-xs">
              
              {/* Overall Risk index badge */}
              <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-between text-left">
                <div>
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">INDICE DE RISQUE GÉO-FINANCIER</span>
                  <strong className="text-lg font-black font-sans text-slate-800">{analysisResult.riskScore} / 100</strong>
                </div>
                <span className={`px-2.5 py-1 text-[9px] font-black rounded-full uppercase ${
                  analysisResult.riskScore < 30 ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' : 'bg-red-50 text-red-700 border border-red-150'
                }`}>
                  {analysisResult.riskScore < 30 ? 'Risque Négligeable' : 'Attention requise'}
                </span>
              </div>

              {/* Anomalies List */}
              <div className="space-y-2.5 text-left">
                <span className="block text-[10px] uppercase font-bold text-slate-400">Écarts ou anomalies détectées par l'IA</span>
                
                {analysisResult.anomalies.length === 0 ? (
                  <p className="text-xs text-emerald-600 font-bold bg-emerald-50/55 border border-emerald-100/50 p-3 rounded-xl flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" /> Aucun écart comportemental ou fraude comptable identifié.
                  </p>
                ) : (
                  analysisResult.anomalies.map((anom, idx) => (
                    <div key={idx} className="p-3 bg-amber-50 rounded-xl border border-amber-100/60 flex gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <strong className="block text-slate-800 font-bold">{anom}</strong>
                        <p className="text-[10px] text-amber-800">Observation recommandée pour correction budgétaire immédiate.</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Operations allocation recommendations */}
              <div className="space-y-2.5 text-left border-t border-slate-100 pt-4">
                <span className="block text-[10px] uppercase font-bold text-slate-400">{dict.recommendationTitle}</span>
                <div className="grid grid-cols-1 gap-2">
                  {analysisResult.recommendations.map((rec, idx) => (
                    <div key={idx} className="p-3 bg-teal-50/40 rounded-xl border border-teal-100/50 text-teal-900 leading-relaxed text-[11px]">
                      {rec}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="py-20 text-center text-slate-400 flex flex-col items-center gap-3">
              <Cpu className="w-10 h-10 text-slate-200" />
              <p className="text-xs max-w-xs leading-relaxed">
                Cliquez sur le bouton <strong>"Scanner"</strong> ci-dessus pour que l'IA autonome parcoure les décaissements et signale les flux suspects de trésorerie.
              </p>
            </div>
          )}
        </div>

        {/* Right column: Assembly Document Report */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-xs p-5 space-y-4">
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-left border-b border-slate-100 pb-3">
            📝 Rapport d'Assemblée Générale Officiel
          </h4>

          {assemblyReport ? (
            <div className="space-y-5">
              
              {/* Paper styled document simulator */}
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl max-h-128 overflow-y-auto font-sans shadow-inner selection:bg-teal-200">
                <div className="border-b border-teal-800 pb-3 mb-4 flex items-center justify-between">
                  <span className="text-[9px] font-bold text-teal-800 uppercase tracking-wider font-mono">Document de Synthèse Associatif</span>
                  <span className="text-[9px] text-slate-400 font-mono">Date: {new Date().toLocaleDateString('fr-FR')}</span>
                </div>
                
                {renderSimpleMarkdown(assemblyReport)}

                {/* Simulated signature slot */}
                <div className="mt-8 border-t border-slate-350 pt-4 grid grid-cols-2 text-[9px] text-slate-500 text-left">
                  <div>
                    <span className="block font-bold">Le Comité de Surveillance</span>
                    <div className="h-6 w-16 bg-white/60 border border-slate-100 mt-1 rounded italic font-mono flex items-center justify-center">[Vérifié]</div>
                  </div>
                  <div className="text-right">
                    <span className="block font-bold">Rédigé par Gemini Pro</span>
                    <span className="block">Signature d'Utilité Publique</span>
                  </div>
                </div>
              </div>

              {/* Printing Options */}
              <button 
                onClick={() => window.print()}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Imprimer ou Enregistrer le rapport (PDF)</span>
              </button>

            </div>
          ) : (
            <div className="py-20 text-center text-slate-400 flex flex-col items-center gap-3">
              <FileText className="w-10 h-10 text-slate-200" />
              <p className="text-xs max-w-xs leading-relaxed">
                Cliquez pour que le modèle IA compile toutes les données courantes d'adhérents, de budgets projets et d'entrées financières sous la forme d'un procès-verbal agréé.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
