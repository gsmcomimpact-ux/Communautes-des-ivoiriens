import React, { useState } from "react";
import { 
  Plus, Search, Edit2, Trash2, Download, Printer, 
  MapPin, Phone, Mail, Award, Check, AlertCircle, RefreshCw 
} from "lucide-react";
import { Member, UserRole } from "../types";
import { downloadMemberCardPdf } from "../utils/pdfGenerator";

interface MembersViewProps {
  members: Member[];
  lang: 'fr' | 'en';
  dict: any;
  userRole: UserRole;
  onAddMember: (member: any) => Promise<any> | any;
  onUpdateMember: (id: string, member: any) => Promise<any> | any;
  onDeleteMember: (id: string) => void;
}

export default function MembersView({
  members,
  lang,
  dict,
  userRole,
  onAddMember,
  onUpdateMember,
  onDeleteMember
}: MembersViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  
  // Forms states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formFirstName, setFormFirstName] = useState("");
  const [formLastName, setFormLastName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formStatus, setFormStatus] = useState<'actif' | 'suspendu' | 'inactif'>("actif");
  const [formAddress, setFormAddress] = useState("");
  const [formNotes, setFormNotes] = useState("");

  const isSecretaryOrAdmin = userRole === 'admin' || userRole === 'secrétaire';

  // Open form for registration
  const handleOpenCreate = () => {
    setEditingId(null);
    setFormFirstName("");
    setFormLastName("");
    setFormEmail("");
    setFormPhone("");
    setFormStatus("actif");
    setFormAddress("");
    setFormNotes("");
    setIsFormOpen(true);
  };

  // Open form to edit
  const handleOpenEdit = (m: Member, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(m.id);
    setFormFirstName(m.firstName);
    setFormLastName(m.lastName);
    setFormEmail(m.email);
    setFormPhone(m.phone || "");
    setFormStatus(m.status);
    setFormAddress(m.address || "");
    setFormNotes(m.notes || "");
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFirstName || !formLastName || !formEmail) return;

    const payload: Partial<Member> = {
      firstName: formFirstName,
      lastName: formLastName,
      email: formEmail,
      phone: formPhone,
      status: formStatus,
      address: formAddress,
      notes: formNotes
    };

    try {
      if (editingId) {
        await onUpdateMember(editingId, { member: payload });
      } else {
        await onAddMember({ member: payload });
      }
      
      // Explicitly clear the input form states immediately after successful API request
      setFormFirstName("");
      setFormLastName("");
      setFormEmail("");
      setFormPhone("");
      setFormStatus("actif");
      setFormAddress("");
      setFormNotes("");
      setEditingId(null);
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error saving member:", error);
    }
  };

  // Filter members
  const filteredMembers = members.filter(m => {
    const matchesSearch = 
      `${m.firstName} ${m.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.email && m.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (m.membershipCardNumber && m.membershipCardNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (statusFilter === "all") return matchesSearch;
    return matchesSearch && m.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      
      {/* Header and tools pane */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-950 font-sans tracking-tight">
            {lang === 'fr' ? 'Registre des Membres & Adhérents' : 'Members Registration Module'}
          </h2>
          <p className="text-xs text-slate-400">Gérez l’inscription administrative et éditez les cartes d’adhésion PVC.</p>
        </div>

        {isSecretaryOrAdmin && (
          <button 
            id="register-member-btn"
            onClick={handleOpenCreate}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'fr' ? 'Inscrire un nouveau membre' : 'Register New Member'}</span>
          </button>
        )}
      </div>

      {/* Constraints Warning if Read-only */}
      {!isSecretaryOrAdmin && (
        <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-500 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-500" />
          <span>{dict.restrictedAccess}</span>
        </div>
      )}

      {/* Main Container splits into Members list table and Details / Digital ID Card view */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Members List Side (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-xs p-5 space-y-4">
          
          {/* Search filters */}
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-700 focus:outline-teal-500"
            >
              <option value="all">{lang === 'fr' ? 'Tous les statuts' : 'All Statuses'}</option>
              <option value="actif">{lang === 'fr' ? 'Membres Actifs' : 'Active Only'}</option>
              <option value="suspendu">{lang === 'fr' ? 'Membres Suspendus' : 'Suspended'}</option>
              <option value="inactif">{lang === 'fr' ? 'Membres Inactifs' : 'Inactive'}</option>
            </select>
          </div>

          {/* Members Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">{lang === 'fr' ? 'Identité' : 'Member'}</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Card ID</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-400 font-medium">
                      {lang === 'fr' ? 'Aucun membre enregistré correspondant aux filtres.' : 'No members found matching current query.'}
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((m) => (
                    <tr 
                      key={m.id}
                      onClick={() => setSelectedMember(m)}
                      className={`hover:bg-teal-50/20 cursor-pointer transition ${selectedMember?.id === m.id ? 'bg-teal-50/40' : ''}`}
                    >
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        <div className="flex items-center gap-3">
                          <img 
                            src={m.photoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"} 
                            alt=""
                            className="w-8 h-8 rounded-full border border-slate-100 object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <span className="font-bold">{m.firstName} {m.lastName}</span>
                            <span className="block text-[10px] font-mono text-slate-400">Inscrit: {m.joinDate}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <span className="block">{m.email}</span>
                        <span className="block text-[10px] text-slate-400">{m.phone}</span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-500">
                        {m.membershipCardNumber}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          (m.status || 'actif') === 'actif' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          ((m.status || 'actif') === 'suspendu' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-slate-100 text-slate-600')
                        }`}>
                          {(m.status || 'actif').toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                        {isSecretaryOrAdmin && (
                          <>
                            <button 
                              onClick={(e) => handleOpenEdit(m, e)}
                              className="p-1 px-1.5 bg-slate-50 hover:bg-slate-100 rounded-md text-slate-600 hover:text-slate-900 transition border border-slate-100 cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => onDeleteMember(m.id)}
                              className="p-1 px-1.5 bg-rose-50 hover:bg-rose-100 rounded-md text-rose-600 hover:text-rose-950 transition border border-rose-100 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side view: Digital Membership Card + Details */}
        <div id="member-detail-side" className="space-y-6">
          {selectedMember ? (
            <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-xl space-y-6 relative overflow-hidden">
              
              {/* Card visual elements decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl"></div>
              
              {/* CARD CONTAINER (simulating PVC card) */}
              <div id="digital-member-card" className="aspect-video bg-gradient-to-br from-teal-800 to-slate-950 rounded-xl p-4 border border-teal-500/20 shadow-lg relative flex flex-col justify-between">
                
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 bg-teal-400 rounded-xs flex items-center justify-center font-bold text-slate-950 text-[10px]">
                      C
                    </div>
                    <div>
                      <h4 className="text-[10px] font-bold tracking-wider text-teal-400 uppercase">CINI NIGER</h4>
                      <p className="text-[7px] text-slate-300">Communauté Ivoirienne au Niger</p>
                    </div>
                  </div>
                  <Award className="w-6 h-6 text-teal-300" />
                </div>

                {/* Body details */}
                <div className="flex items-center gap-3 my-2">
                  <img 
                    src={selectedMember.photoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"} 
                    alt="" 
                    className="w-12 h-12 rounded-lg border border-teal-400/30 object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="space-y-0.5 text-left">
                    <h5 className="text-[11px] font-bold text-slate-100 uppercase tracking-wide">
                      {selectedMember.firstName} {selectedMember.lastName}
                    </h5>
                    <p className="text-[8px] text-slate-300 font-semibold">{lang === 'fr' ? 'MEMBRE ACTIF' : 'REGISTERED MEMBER'}</p>
                    <p className="text-[7px] font-mono text-slate-400 mt-1">ID: {selectedMember.membershipCardNumber}</p>
                  </div>
                </div>

                {/* Footer bar */}
                <div className="flex items-end justify-between border-t border-teal-400/10 pt-1.5 text-[7px] text-slate-300 font-mono">
                  <div>
                    <span className="block text-slate-500">Inscrit:</span>
                    <span>{selectedMember.joinDate}</span>
                  </div>
                  <div className="text-right">
                    <div className="h-4 w-12 bg-white/70 rounded-xs flex items-center justify-center px-1">
                      {/* Simulated barcode */}
                      <span className="text-[4px] text-slate-900 overflow-hidden text-ellipsis whitespace-nowrap">||||| | |||</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Printing Options */}
              <div className="flex items-center justify-between gap-3 text-xs border-t border-slate-800 pt-4">
                <button 
                  onClick={() => window.print()}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{lang === 'fr' ? 'Imprimer la carte' : 'Print Card'}</span>
                </button>
                <button 
                  onClick={() => downloadMemberCardPdf(selectedMember)}
                  className="py-2 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  title="Télécharger la fiche d'identité sécurisée"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Fiche Détails Adhérent */}
              <div className="space-y-4 pt-1 text-xs">
                <h4 className="font-bold text-sm border-b border-slate-800 pb-2 text-slate-100 text-left">
                  {lang === 'fr' ? 'Détails de l’adhérent' : 'Member Details Profile'}
                </h4>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                    <div className="text-left">
                      <span className="block text-slate-400 text-[10px] uppercase">Adresse postale</span>
                      <span className="text-slate-200">{selectedMember.address || 'Non spécifiée'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-teal-400" />
                      <div className="text-left">
                        <span className="block text-slate-400 text-[9px] uppercase">Téléphone</span>
                        <span className="text-slate-200 font-mono text-[10px]">{selectedMember.phone || 'Non spécifié'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-teal-400 overflow-hidden" />
                      <div className="text-left">
                        <span className="block text-slate-400 text-[9px] uppercase">E-mail</span>
                        <span className="text-slate-200 break-all text-[10px]">{selectedMember.email}</span>
                      </div>
                    </div>
                  </div>

                  {selectedMember.notes && (
                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-slate-300 text-xs text-left leading-relaxed">
                      <strong className="block text-emerald-400 text-[9px] uppercase tracking-wider mb-1">Notes administratives</strong>
                      {selectedMember.notes}
                    </div>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center text-slate-400 shadow-xs h-64 flex flex-col justify-center items-center gap-3">
              <Award className="w-12 h-12 text-slate-200" />
              <p className="text-xs font-semibold">
                {lang === 'fr' ? 'Sélectionnez un membre dans la liste pour générer sa carte d’identifiant d’adhésion numérique.' : 'Select a member from the panel to visualize card.'}
              </p>
            </div>
          )}
        </div>

      </div>

      {/* MODAL FORM REGISTRATION */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden border border-slate-100 scale-100 transition-transform">
            
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm uppercase">
                {editingId ? (lang === 'fr' ? 'Éditer l’adhésion' : 'Edit Member Sheet') : (lang === 'fr' ? 'Inscrire un membre' : 'Inscribe Member')}
              </h3>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4 text-xs text-left">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-500 font-semibold uppercase">Prénom *</label>
                  <input 
                    type="text" 
                    value={formFirstName}
                    onChange={(e) => setFormFirstName(e.target.value)}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-500 font-semibold uppercase">Nom *</label>
                  <input 
                    type="text" 
                    value={formLastName}
                    onChange={(e) => setFormLastName(e.target.value)}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-500 font-semibold uppercase">E-mail *</label>
                  <input 
                    type="email" 
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-500 font-semibold uppercase">Téléphone</label>
                  <input 
                    type="tel" 
                    value={formPhone}
                    placeholder="+33 6..."
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-500 font-semibold uppercase">Adresse d’habitation</label>
                <input 
                  type="text" 
                  value={formAddress}
                  placeholder="Rue, Code, Ville"
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-500 font-semibold uppercase">Statut d’Adhésion</label>
                  <select 
                    value={formStatus}
                    onChange={(e: any) => setFormStatus(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="actif">Actif</option>
                    <option value="suspendu">Suspendu</option>
                    <option value="inactif">Inactif</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-500 font-semibold uppercase">Observations / Notes spécialisées</label>
                <textarea 
                  value={formNotes}
                  rows={3}
                  onChange={(e) => setFormNotes(e.target.value)}
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
                  {dict.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
