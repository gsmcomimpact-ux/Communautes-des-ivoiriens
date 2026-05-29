import React, { useState } from "react";
import { 
  Users, CheckCircle2, ChevronRight, RefreshCw, 
  AlertCircle, DollarSign, Calendar, Mail, FileCheck, Landmark, Search
} from "lucide-react";
import { Contribution, UserRole } from "../types";

interface ContributionsViewProps {
  contributions: Contribution[];
  lang: 'fr' | 'en';
  dict: any;
  userRole: UserRole;
  onUpdateContribution: (id: string, updatedData: Partial<Contribution>) => void;
}

export default function ContributionsView({
  contributions,
  lang,
  dict,
  userRole,
  onUpdateContribution
}: ContributionsViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [monthFilter, setMonthFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Selection for payment input
  const [selectedContribution, setSelectedContribution] = useState<Contribution | null>(null);
  const [amountInput, setAmountInput] = useState("");

  const isTreasurerOrAdmin = userRole === 'admin' || userRole === 'trésorier';

  // Statistics
  const totalPaid = contributions.reduce((sum, c) => sum + c.amountPaid, 0);
  const totalExpected = contributions.reduce((sum, c) => sum + c.amountDue, 0);
  const totalDuePending = totalExpected - totalPaid;

  const countPaid = contributions.filter(c => c.status === 'payé').length;
  const countPending = contributions.filter(c => c.status === 'en_retard').length;

  // Filter months lists
  const monthsList = Array.from(new Set(contributions.map(c => c.month)));

  // Filter core contributions
  const filteredDues = contributions.filter(c => {
    const matchesSearch = c.memberName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMonth = monthFilter === "all" || c.month === monthFilter;
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;

    return matchesSearch && matchesMonth && matchesStatus;
  });

  const handleOpenPayment = (c: Contribution) => {
    if (!isTreasurerOrAdmin) return;
    setSelectedContribution(c);
    setAmountInput(c.amountDue.toString());
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContribution || !amountInput) return;

    onUpdateContribution(selectedContribution.id, {
      amountPaid: Number(amountInput)
    });

    setSelectedContribution(null);
  };

  const triggerMockReminder = (c: Contribution) => {
    alert(`Un rappel aimable a été formulé par email automatique à l'adhérent : ${c.memberName} (${c.month})`);
  };

  return (
    <div className="space-y-6 text-slate-800">
      
      {/* Key performance totals indicators */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* TOTAL COLLECTED */}
        <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-xs text-left space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">COTISATIONS REÇUES</span>
          <div className="flex items-baseline gap-1">
            <h4 className="text-xl font-black text-emerald-600 font-sans">{totalPaid.toLocaleString()} FCFA</h4>
            <span className="text-[10px] text-slate-400">collectés</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(totalPaid/totalExpected)*100}%` }}></div>
          </div>
        </div>

        {/* PENDING DUE */}
        <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-xs text-left space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">RESTE À RECOUVRER</span>
          <div className="flex items-baseline gap-1">
            <h4 className="text-xl font-black text-rose-500 font-sans">{totalDuePending.toLocaleString()} FCFA</h4>
            <span className="text-[10px] text-slate-400">en attente</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-rose-500 h-full rounded-full" style={{ width: `${(totalDuePending/totalExpected)*100}%` }}></div>
          </div>
        </div>

        {/* COMPLETED COUNT */}
        <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-xs text-left space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Paiements validés</span>
          <h4 className="text-xl font-black text-slate-800 font-sans">{countPaid} {lang === 'fr' ? 'Adhérents' : 'Members'}</h4>
          <p className="text-[10px] text-emerald-600 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Statut libératoire ok
          </p>
        </div>

        {/* RETARD COUNT */}
        <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-xs text-left space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Retards constatés</span>
          <h4 className="text-xl font-black text-amber-600 font-sans">{countPending} {lang === 'fr' ? 'Défauts' : 'Dues pending'}</h4>
          <p className="text-[10px] text-amber-600 mt-1 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            Relances requises
          </p>
        </div>
      </div>

      {/* Header labels */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-sans tracking-tight">
            {lang === 'fr' ? 'Suivi et Recouvrement des Cotisations' : 'Monthly Association Dues Tracker'}
          </h2>
          <p className="text-xs text-slate-400">Relevez le statut des contributions de solidarité mensuelles de chaque membre enregistré.</p>
        </div>
      </div>

      {/* Security warning */}
      {!isTreasurerOrAdmin && (
        <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-500 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-500" />
          <span>{dict.restrictedAccess}</span>
        </div>
      )}

      {/* Controls and list */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 space-y-4">
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input 
              type="text"
              placeholder={lang === 'fr' ? 'Rechercher un membre...' : 'Search members name...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-teal-500 transition"
            />
          </div>

          <select 
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-700 focus:outline-teal-500 shrink-0"
          >
            <option value="all">{lang === 'fr' ? 'Tous les mois' : 'All Months'}</option>
            {monthsList.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-700 focus:outline-teal-500 shrink-0"
          >
            <option value="all">{lang === 'fr' ? 'Tous les statuts' : 'All payment states'}</option>
            <option value="payé">{lang === 'fr' ? 'Payé totalement' : 'Paid Dues'}</option>
            <option value="partiel">{lang === 'fr' ? 'Versement Partiel' : 'Partial Payments'}</option>
            <option value="en_retard">{lang === 'fr' ? 'En Retard' : 'Overdue'}</option>
          </select>
        </div>

        {/* Contributions dues grid table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                <th className="py-3 px-4">{lang === 'fr' ? 'Nom du Membre d’Association' : 'Member Name'}</th>
                <th className="py-3 px-4">{lang === 'fr' ? 'Période' : 'Period'}</th>
                <th className="py-3 px-4">{lang === 'fr' ? 'Dû de base' : 'Standard Due'}</th>
                <th className="py-3 px-4">{lang === 'fr' ? 'Montant versé' : 'Collected Amount'}</th>
                <th className="py-3 px-4">{lang === 'fr' ? 'Statut de paiement' : 'Dues Status'}</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs">
              {filteredDues.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 font-sans font-medium">
                    {lang === 'fr' ? 'Aucune cotisation enregistrée pour ces filtres.' : 'No monthly dues register matches filters.'}
                  </td>
                </tr>
              ) : (
                filteredDues.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3 px-4 font-bold text-slate-800">{c.memberName}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{c.month}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-600">{c.amountDue.toLocaleString()} FCFA</td>
                    <td className="py-3 px-4 font-black text-slate-800">{c.amountPaid.toLocaleString()} FCFA</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        c.status === 'payé' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        (c.status === 'partiel' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-rose-50 text-rose-700 border border-rose-100')
                      }`}>
                        {c.status === 'payé' ? 'PAYÉ' : (c.status === 'partiel' ? 'PARTIEL' : 'EN RETARD')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      {isTreasurerOrAdmin && c.status !== 'payé' && (
                        <button 
                          onClick={() => handleOpenPayment(c)}
                          className="px-2 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-md font-bold transition text-[10px] cursor-pointer"
                        >
                          Encaisser
                        </button>
                      )}
                      {c.status === 'en_retard' && (
                        <button 
                          onClick={() => triggerMockReminder(c)}
                          className="p-1 text-slate-500 hover:text-indigo-600 transition inline-flex items-center gap-1 border border-slate-100 bg-slate-50 rounded-md cursor-pointer text-[10px]"
                          title="Envoyer un e-mail de rappel aimable"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {c.status === 'payé' && (
                        <span className="text-[10px] text-emerald-600 font-mono font-semibold flex items-center justify-end gap-1 select-none">
                          <FileCheck className="w-3.5 h-3.5" /> Reçu généré
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECORD PAYMENT DIALOG */}
      {selectedContribution && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden border border-slate-100">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase">
                {lang === 'fr' ? 'Enregistrer Encaissement Cotisation' : 'Register dues payment'}
              </h3>
              <button onClick={() => setSelectedContribution(null)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSavePayment} className="p-5 space-y-4 text-xs text-left">
              <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Membre concerné</span>
                <p className="font-bold text-slate-800 text-sm mt-0.5">{selectedContribution.memberName}</p>
                <p className="text-[10px] text-slate-500">Cotisation mensuelle correspondante : <strong>{selectedContribution.month}</strong></p>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-500 font-semibold uppercase">Somme Versée (FCFA) *</label>
                <div className="relative">
                  <input 
                    type="number"
                    required
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    max={selectedContribution.amountDue}
                    className="w-full p-2.5 pl-8 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-teal-500"
                  />
                  <span className="text-xs font-black text-slate-400 absolute left-2.5 top-3">F</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Versement maximum attendu: <strong>{selectedContribution.amountDue.toLocaleString()} FCFA</strong>. Un versement inférieur sera compté en statut Partiel.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setSelectedContribution(null)}
                  className="px-4 py-2 hover:bg-slate-50 text-slate-600 rounded-lg cursor-pointer"
                >
                  {dict.cancel}
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold cursor-pointer"
                >
                  Enregistrer et Générer Reçu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
