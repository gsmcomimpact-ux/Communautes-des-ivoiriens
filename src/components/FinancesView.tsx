import React, { useState } from "react";
import { 
  Plus, Search, TrendingUp, TrendingDown, DollarSign, 
  Download, Award, AlertCircle, Calendar, FileText, CheckCircle 
} from "lucide-react";
import { FinancialTransaction, UserRole, Project } from "../types";

interface FinancesViewProps {
  finances: FinancialTransaction[];
  projects: Project[];
  lang: 'fr' | 'en';
  dict: any;
  userRole: UserRole;
  onAddTransaction: (tx: Partial<FinancialTransaction>) => void;
}

export default function FinancesView({
  finances,
  projects,
  lang,
  dict,
  userRole,
  onAddTransaction
}: FinancesViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  
  // Receipt selection
  const [selectedTx, setSelectedTx] = useState<FinancialTransaction | null>(null);

  // Transaction form modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setFormType] = useState<'recette' | 'dépense'>("recette");
  const [formCategory, setFormCategory] = useState("Dons");
  const [formAmount, setFormAmount] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formSource, setFormSource] = useState("");
  const [formProject, setFormProject] = useState("");

  const isTreasurerOrAdmin = userRole === 'admin' || userRole === 'trésorier';

  // Math totals
  const totalIn = finances.filter(f => f.type === 'recette').reduce((sum, f) => sum + f.amount, 0);
  const totalOut = finances.filter(f => f.type === 'dépense').reduce((sum, f) => sum + f.amount, 0);
  const balance = totalIn - totalOut;

  // Categories lists
  const categories = Array.from(new Set(finances.map(f => f.category)));

  const handleOpenCreate = () => {
    setFormType("recette");
    setFormCategory("Dons");
    setFormAmount("");
    setFormDescription("");
    setFormSource("");
    setFormProject("");
    setIsFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAmount || !formDescription || !formSource) return;

    const payload: Partial<FinancialTransaction> = {
      type: formType,
      category: formCategory,
      amount: Number(formAmount),
      date: new Date().toISOString().split('T')[0],
      description: formDescription,
      sourceOrDestination: formSource,
      projectName: formProject || undefined,
      receiptId: formType === 'recette' ? `REC-FIN-${Date.now().toString().slice(-6)}` : undefined
    };

    onAddTransaction(payload);
    setIsFormOpen(false);
  };

  // Filter transaction records
  const filteredTxs = finances.filter(f => {
    const matchesSearch = 
      f.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.sourceOrDestination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === "all" || f.type === typeFilter;
    const matchesCategory = categoryFilter === "all" || f.category === categoryFilter;

    return matchesSearch && matchesType && matchesCategory;
  });

  return (
    <div className="space-y-6">
      
      {/* Visual Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* TOTAL IN */}
        <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'fr' ? 'TOTAL RECETTES' : 'ALL INCOMES'}</span>
            <h3 className="text-2xl font-black text-emerald-600 font-sans">{totalIn.toLocaleString()} FCFA</h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* TOTAL OUT */}
        <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'fr' ? 'TOTAL DÉPENSES' : 'ALL DISBURSEMENTS'}</span>
            <h3 className="text-2xl font-black text-rose-600 font-sans">{totalOut.toLocaleString()} FCFA</h3>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>

        {/* BALANCE */}
        <div className={`p-5 border rounded-2xl shadow-xs flex items-center justify-between ${balance >= 0 ? 'bg-teal-50/50 border-teal-100 text-teal-900' : 'bg-rose-50 border-rose-100 text-rose-900'}`}>
          <div className="space-y-1">
            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">{lang === 'fr' ? 'TRÉSORERIE DISPONIBLE' : 'AVAILABLE RESERVE'}</span>
            <h3 className="text-2xl font-black font-sans">{balance.toLocaleString()} FCFA</h3>
          </div>
          <div className={`p-3 rounded-xl ${balance >= 0 ? 'bg-teal-600 text-white' : 'bg-rose-600 text-white'}`}>
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Header action panel */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-sans tracking-tight">
            {lang === 'fr' ? 'Journal Comptable de l’Association' : 'Direct Financial Ledger'}
          </h2>
          <p className="text-xs text-slate-400">Suivi rigoureux des facturations, des reçus de dons fiscaux et budgets de fonctionnement.</p>
        </div>

        {isTreasurerOrAdmin && (
          <button 
            id="btn-post-tx"
            onClick={handleOpenCreate}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'fr' ? 'Saisir une transaction' : 'Record Transaction'}</span>
          </button>
        )}
      </div>

      {/* Restrictions Banner */}
      {!isTreasurerOrAdmin && (
        <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-500 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-500" />
          <span>{dict.restrictedAccess}</span>
        </div>
      )}

      {/* Filter and Table Row */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 space-y-4">
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input 
              type="text"
              placeholder={dict.search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-teal-500 transition"
            />
          </div>

          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-700 focus:outline-teal-500"
          >
            <option value="all">{lang === 'fr' ? 'Tous les flux' : 'All Ledger Flows'}</option>
            <option value="recette">{lang === 'fr' ? 'Recettes (Entrées)' : 'Incomes Only'}</option>
            <option value="dépense">{lang === 'fr' ? 'Dépenses (Sorties)' : 'Expenses Only'}</option>
          </select>

          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-700 focus:outline-teal-500"
          >
            <option value="all">{lang === 'fr' ? 'Toutes les catégories' : 'All Categories'}</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Table of Ledger */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                <th className="py-3 px-4">{lang === 'fr' ? 'Date / Libellé' : 'Date & Description'}</th>
                <th className="py-3 px-4">{lang === 'fr' ? 'Catégorie' : 'Category'}</th>
                <th className="py-3 px-4">{lang === 'fr' ? 'Tiers / Origine' : 'Source / Target'}</th>
                <th className="py-3 px-4">{lang === 'fr' ? 'Projet Affecté' : 'Project ID'}</th>
                <th className="py-3 px-4 text-right">{lang === 'fr' ? 'Montant' : 'Amount'}</th>
                <th className="py-3 px-4 text-right">Justificatif</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs text-slate-700">
              {filteredTxs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 font-medium font-sans">
                    {lang === 'fr' ? 'Aucun flux d’archive référencé.' : 'No transactions matching filters.'}
                  </td>
                </tr>
              ) : (
                filteredTxs.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition duration-150">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                        <div>
                          <span className="font-bold text-slate-800">{t.description}</span>
                          <span className="block text-[10px] font-mono text-slate-400">{t.date}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px]">
                        {t.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-sans">{t.sourceOrDestination}</td>
                    <td className="py-3 px-4">
                      {t.projectName ? (
                        <span className="text-[10px] text-teal-600 font-mono font-bold bg-teal-50 border border-teal-100/50 px-2 py-0.5 rounded-full">
                          {t.projectName}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">—</span>
                      )}
                    </td>
                    <td className={`py-3 px-4 text-right font-sans font-black text-sm ${t.type === 'recette' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {t.type === 'recette' ? '+' : '-'} {t.amount.toLocaleString()} FCFA
                    </td>
                    <td className="py-3 px-4 text-right">
                      {t.type === 'recette' ? (
                        <button 
                          onClick={() => setSelectedTx(t)}
                          className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold font-sans rounded-md border border-teal-100 hover:border-teal-200 transition text-[10px] flex items-center justify-center gap-1.5 ml-auto cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{lang === 'fr' ? 'Reçu fiscal' : 'Receipt'}</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono">Facture interne</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FORM TRANSACTION MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase">
                {lang === 'fr' ? 'Saisir une opération comptable' : 'Inscribe accounting block'}
              </h3>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4 text-xs text-left">
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  type="button"
                  onClick={() => { setFormType("recette"); setFormCategory("Dons"); }}
                  className={`py-3 rounded-lg font-bold border transition cursor-pointer text-center ${
                    formType === 'recette' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  🟢 RECETTE (Entrée)
                </button>
                <button 
                  type="button"
                  onClick={() => { setFormType("dépense"); setFormCategory("Logistique d'Aide"); }}
                  className={`py-3 rounded-lg font-bold border transition cursor-pointer text-center ${
                    formType === 'dépense' ? 'bg-rose-50 text-rose-700 border-rose-300' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  🔴 DÉPENSE (Sortie)
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-500 font-semibold uppercase">Catégorie</label>
                  {formType === 'recette' ? (
                    <select 
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      <option value="Dons">Dons d'Aide</option>
                      <option value="Cotisations">Cotisations Adhérent</option>
                      <option value="Subvention">Subventions Publiques</option>
                      <option value="Partenariat">Partenariats Sociétés</option>
                    </select>
                  ) : (
                    <select 
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      <option value="Logistique d'Aide">Logistique d'Aide</option>
                      <option value="Santé">Santé & Fournitures Médicales</option>
                      <option value="Frais administratifs">Frais administratifs</option>
                      <option value="Carburant / Transport">Carburant / Transport</option>
                      <option value="Aide directe (Urgence)">Aide directe (Urgence)</option>
                    </select>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-500 font-semibold uppercase">Montant (FCFA) *</label>
                  <input 
                    type="number"
                    required
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    placeholder="Somme en FCFA"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-500 font-semibold uppercase">Libellé / Description *</label>
                <input 
                  type="text"
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Ex: Achat fournitures scolaires pour enfants"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-500 font-semibold uppercase">Tiers (Donneur ou Grossiste) *</label>
                <input 
                  type="text"
                  required
                  value={formSource}
                  onChange={(e) => setFormSource(e.target.value)}
                  placeholder="Ex: Fondation Total ou Pharmacie Centrale"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              {formType === 'dépense' && (
                <div className="space-y-1">
                  <label className="block text-slate-500 font-semibold uppercase">Affecter à un Projet Humanitaire (Optionnel)</label>
                  <select 
                    value={formProject}
                    onChange={(e) => setFormProject(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="">Aucun projet lié</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.title}>{p.title}</option>
                    ))}
                  </select>
                </div>
              )}

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
                  {dict.save}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* COMPTABLE RECEIPT VIEW (MODAL) */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-100 overflow-hidden text-slate-800">
            
            <div className="p-6 space-y-6 text-left" id="print-area">
              
              {/* Receipt structural branding header */}
              <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-teal-800 uppercase tracking-wider">CINI NIGER</h4>
                  <p className="text-[10px] text-slate-500">Récépissé de Reconnaissance Légale - Ministère Intérieur Niger</p>
                  <p className="text-[9px] text-slate-400">Section Niamey-Plateau, Boulevard de la Liberté, Niamey</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-white bg-teal-600 px-2 py-0.5 rounded-full font-bold">REÇU FISCAL</span>
                  <p className="text-[10px] font-mono font-bold mt-2 text-slate-600">{selectedTx.receiptId || "REC-CO-9238"}</p>
                </div>
              </div>

              {/* Receipt formal description */}
              <div className="space-y-3 text-xs leading-relaxed">
                <p>
                  Le trésorier de l’association certifie par la présente avoir reçu la somme décrite ci-dessous au titre de <strong>{selectedTx.category} d'Aide Sociale</strong>, ouvrant droit de réduction d’impôt.
                </p>

                <div className="p-4 bg-slate-50 rounded-xl space-y-2 border border-slate-100 font-sans">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Donateur / Bénévole:</span>
                    <strong className="text-slate-900">{selectedTx.sourceOrDestination}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Date d'encaissement:</span>
                    <strong className="text-slate-900">{selectedTx.date}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Description du versement:</span>
                    <strong className="text-slate-900">{selectedTx.description}</strong>
                  </div>
                  <div className="flex justify-between border-t border-slate-200/60 pt-2 mt-1">
                    <span className="text-slate-600 font-bold">MONTANT TOTAL PERÇU :</span>
                    <strong className="text-teal-700 text-lg">{selectedTx.amount.toLocaleString()} FCFA</strong>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 italic">
                  * Conformément à la législation fiscale en vigueur, ce reçu atteste de la valeur de versement libératoire d’assistance directe d'urgence. Aucun bien ou service n’a été fourni en contrepartie de cette adhésion.
                </p>
              </div>

              {/* Signs */}
              <div className="flex justify-between items-end pt-4 border-t border-slate-100 text-[10px]">
                <div>
                  <span className="block text-slate-400">Généré le:</span>
                  <strong className="text-slate-600">{new Date().toLocaleString('fr-FR')}</strong>
                </div>
                <div className="text-right space-y-1">
                  <span className="block text-slate-400">Signature du Trésorier Général</span>
                  <div className="h-8 w-24 bg-teal-50/50 rounded-xs border border-teal-100 flex items-center justify-center font-mono font-bold text-teal-700 text-[9px] select-none italic">
                    [Sophie Brou]
                  </div>
                </div>
              </div>

            </div>

            {/* Print action buttons */}
            <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2 text-xs">
              <button 
                onClick={() => setSelectedTx(null)}
                className="px-4 py-2 hover:bg-slate-200 rounded-lg text-slate-600 transition cursor-pointer"
              >
                Fermer l'aperçu
              </button>
              <button 
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Imprimer / PDF</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
