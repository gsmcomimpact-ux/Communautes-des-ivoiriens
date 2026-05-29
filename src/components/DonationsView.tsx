import React, { useState } from "react";
import { 
  Heart, Gift, DollarSign, Search, Plus, 
  Send, FileCheck, Award, AlertCircle, Sparkles, Smile 
} from "lucide-react";
import { Donation, UserRole, Project } from "../types";
import { downloadDonationReceiptPdf } from "../utils/pdfGenerator";

interface DonationsViewProps {
  donations: Donation[];
  projects: Project[];
  lang: 'fr' | 'en';
  dict: any;
  userRole: UserRole;
  onAddDonation: (donation: Partial<Donation>) => void;
}

export default function DonationsView({
  donations,
  projects,
  lang,
  dict,
  userRole,
  onAddDonation
}: DonationsViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [projectLinkedFilter, setProjectLinkedFilter] = useState("all");

  // State for donation input modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formDonorName, setFormDonorName] = useState("");
  const [formDonorEmail, setFormDonorEmail] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formProject, setFormProject] = useState("");
  const [formMessage, setFormMessage] = useState("");

  const isTreasurerOrAdmin = userRole === 'admin' || userRole === 'trésorier';

  // Calculations
  const totalDonsSum = donations.reduce((sum, d) => sum + d.amount, 0);
  const averageDon = donations.length > 0 ? Math.round(totalDonsSum / donations.length) : 0;
  const uniqueDonorsCount = new Set(donations.map(d => d.donorEmail)).size;

  const handleOpenCreate = () => {
    setFormDonorName("");
    setFormDonorEmail("");
    setFormAmount("");
    setFormProject("");
    setFormMessage("");
    setIsFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDonorName || !formDonorEmail || !formAmount) return;

    const payload: Partial<Donation> = {
      donorName: formDonorName,
      donorEmail: formDonorEmail,
      amount: Number(formAmount),
      projectLinked: formProject || undefined,
      message: formMessage || undefined
    };

    onAddDonation(payload);
    setIsFormOpen(false);
  };

  const triggerMockThanks = (d: Donation) => {
    downloadDonationReceiptPdf(d);
  };

  // Filters
  const filteredDonations = donations.filter(d => {
    const matchesSearch = 
      d.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.donorEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.message && d.message.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesProject = projectLinkedFilter === "all" || d.projectLinked === projectLinkedFilter;

    return matchesSearch && matchesProject;
  });

  return (
    <div className="space-y-6 text-slate-800">
      
      {/* KPI totals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-rose-50 rounded-xl text-rose-600">
            <Heart className="w-6 h-6 fill-rose-100" />
          </div>
          <div className="text-left space-y-0.5">
            <span className="block text-[10px] uppercase font-bold text-slate-400">FONDS SOLIDAIRES COLLECTÉS</span>
            <h3 className="text-2xl font-black text-rose-600 font-sans">{totalDonsSum.toLocaleString()} FCFA</h3>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-sky-50 rounded-xl text-sky-600">
            <Smile className="w-6 h-6" />
          </div>
          <div className="text-left space-y-0.5">
            <span className="block text-[10px] uppercase font-bold text-slate-400">DONATEURS UNIQUES</span>
            <h3 className="text-2xl font-black text-slate-800 font-sans">{uniqueDonorsCount} bienfaiteurs</h3>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-amber-50 rounded-xl text-amber-600">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="text-left space-y-0.5">
            <span className="block text-[10px] uppercase font-bold text-slate-400">DON MOYEN ENGAGÉ</span>
            <h3 className="text-2xl font-black text-amber-600 font-sans">{averageDon.toLocaleString()} FCFA</h3>
          </div>
        </div>
      </div>

      {/* Header action row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-sans tracking-tight">
            {lang === 'fr' ? 'Soutien Solidaire & Dons Encaissés' : 'Donations & Humanitarian Sponsorships'}
          </h2>
          <p className="text-xs text-slate-400">Suivi des parrainages humanitaires, mécénats d'entreprises et certificats Cerfa de réduction fiscale.</p>
        </div>

        {isTreasurerOrAdmin && (
          <button 
            id="register-donation-btn"
            onClick={handleOpenCreate}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-xs cursor-pointer"
          >
            <Gift className="w-4 h-4" />
            <span>{lang === 'fr' ? 'Enregistrer un don reçu' : 'Record Received Donation'}</span>
          </button>
        )}
      </div>

      {/* Constraints Warning */}
      {!isTreasurerOrAdmin && (
        <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-500 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-500" />
          <span>{dict.restrictedAccess}</span>
        </div>
      )}

      {/* Main Filter Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 space-y-4">
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input 
              type="text"
              placeholder={lang === 'fr' ? 'Rechercher un donateur, projet...' : 'Search donation records...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-teal-500 transition"
            />
          </div>

          <select 
            value={projectLinkedFilter}
            onChange={(e) => setProjectLinkedFilter(e.target.value)}
            className="px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-700 focus:outline-teal-500 shrink-0"
          >
            <option value="all">{lang === 'fr' ? 'Tous les projets liés' : 'All Projects Connections'}</option>
            {projects.map(p => (
              <option key={p.id} value={p.title}>{p.title}</option>
            ))}
          </select>
        </div>

        {/* Donations Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                <th className="py-3 px-4">{lang === 'fr' ? 'Bienfaiteur / Donateur' : 'Donor / Supporter'}</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Projet Affecté</th>
                <th className="py-3 px-4">Message / Descriptif</th>
                <th className="py-3 px-4 text-right">Montant</th>
                <th className="py-3 px-4 text-right">Remerciements / Cerfa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs">
              {filteredDonations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 font-sans font-medium">
                    {lang === 'fr' ? 'Aucune donation répertoriée correspondante.' : 'No donations found matching criteria.'}
                  </td>
                </tr>
              ) : (
                filteredDonations.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      <div>
                        <span>{d.donorName}</span>
                        <span className="block text-[10px] text-slate-400 font-mono">{d.donorEmail}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono font-semibold">{d.date}</td>
                    <td className="py-3 px-4">
                      {d.projectLinked ? (
                        <span className="px-2 py-0.5 text-[9px] font-bold font-mono text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-full">
                          {d.projectLinked}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Soutien aux Frais Généraux</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500 italic max-w-xs truncate" title={d.message}>
                      {d.message || "—"}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-sm text-rose-600 font-sans">
                      {d.amount.toLocaleString()} FCFA
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button 
                        onClick={() => triggerMockThanks(d)}
                        className="p-1 px-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-100 hover:border-rose-200 text-rose-700 font-bold transition rounded-md text-[10px] inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{lang === 'fr' ? 'Remercier' : 'Thank donor'}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECORD DONATION DIALOG */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-100">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase">
                {lang === 'fr' ? 'Enregistrer un Don de Solidarité' : 'Record Received Gift'}
              </h3>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4 text-xs text-left">
              
              <div className="space-y-1">
                <label className="block text-slate-500 font-semibold uppercase">Nom ou Raison Sociale de Donateur *</label>
                <input 
                  type="text" 
                  required
                  value={formDonorName}
                  onChange={(e) => setFormDonorName(e.target.value)}
                  placeholder="Ex: Augustin Koffi ou Bureau Orange-Niger"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-500 font-semibold uppercase">Adresse e-mail de contact *</label>
                  <input 
                    type="email" 
                    required
                    value={formDonorEmail}
                    onChange={(e) => setFormDonorEmail(e.target.value)}
                    placeholder="donor@email.com"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-500 font-semibold uppercase">Montant Reçu (FCFA) *</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      required
                      value={formAmount}
                      onChange={(e) => setFormAmount(e.target.value)}
                      placeholder="Somme"
                      className="w-full p-2.5 pl-7 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    />
                    <span className="text-xs font-black text-slate-400 absolute left-2.5 top-3.5">F</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-500 font-semibold uppercase">Lier à un Projet Humanitaire (Mécénat thématisé)</label>
                <select 
                  value={formProject}
                  onChange={(e) => setFormProject(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="">Aide Générale - Non fléché</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.title}>{p.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-500 font-semibold uppercase">Message de Solidarité / Notes complémentaires</label>
                <textarea 
                  value={formMessage}
                  rows={2}
                  onChange={(e) => setFormMessage(e.target.value)}
                  placeholder="Ex: Bon courage pour les forages d'eau."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 hover:bg-slate-50 text-slate-600 rounded-lg cursor-pointer"
                >
                  {dict.cancel}
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold cursor-pointer"
                >
                  Saisir le don et Générer la lettre
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
