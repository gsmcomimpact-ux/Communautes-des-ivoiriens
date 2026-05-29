import React, { useState, useEffect } from "react";
import { 
  Heart, Users, TrendingUp, Landmark, BookOpen, 
  ShieldAlert, Sparkles, Languages, HelpCircle, 
  Menu, X, LogOut, CheckCircle, Database, FileText
} from "lucide-react";

// Translations support
import { translations } from "./translations";

// Sub-views components
import DashboardView from "./components/DashboardView";
import MembersView from "./components/MembersView";
import FinancesView from "./components/FinancesView";
import ContributionsView from "./components/ContributionsView";
import DonationsView from "./components/DonationsView";
import ProjectsView from "./components/ProjectsView";
import DocumentsView from "./components/DocumentsView";
import SecurityView from "./components/SecurityView";
import AiView from "./components/AiView";

// Core Types import
import { 
  Member, FinancialTransaction, Contribution, 
  Donation, Project, DocItem, ActivityLog, SecurityStatus, UserRole 
} from "./types";

export default function App() {
  // Navigation & Language Selection
  const [lang, setLang] = useState<'fr' | 'en'>('fr');
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [userRole, setUserRole] = useState<UserRole>('admin'); // Interactive role badge changer!
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Database States
  const [members, setMembers] = useState<Member[]>([]);
  const [finances, setFinances] = useState<FinancialTransaction[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [documents, setDocuments] = useState<DocItem[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [security, setSecurity] = useState<SecurityStatus>({
    systemIntegrity: "optimal",
    lastBackup: new Date().toISOString(),
    threatAlerts: 0,
    mfaEnabled: true,
    encryptionKeyStrength: "AES-256 GCM"
  });

  const [isLoading, setIsLoading] = useState(true);

  // Short translations accessor
  const dict = translations[lang];

  // Fetch full association collections
  const fetchDatabase = async () => {
    try {
      const response = await fetch("/api/database");
      if (response.ok) {
        const data = await response.json();
        setMembers(data.members || []);
        setFinances(data.finances || []);
        setContributions(data.contributions || []);
        setDonations(data.donations || []);
        setProjects(data.projects || []);
        setDocuments(data.documents || []);
        setLogs(data.logs || []);
        if (data.security) {
          setSecurity(data.security);
        }
      } else {
        console.error("Failed to load backend DB. Falling back.");
      }
    } catch (e) {
      console.warn("Express server unavailable. Operating in persistent client mode.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDatabase();
  }, []);

  // API Call helpers syncing with server.ts
  const apiPost = async (endpoint: string, payload: any) => {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-user-role": userRole // pass active role directly to endpoints!
        },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        const result = await response.json();
        // Reload clean DB
        fetchDatabase();
        return result;
      } else {
        const text = await response.text();
        alert(`Erreur API: ${text}`);
      }
    } catch (err) {
      console.error(err);
      alert("Problème réseau avec le serveur Express.");
    }
  };

  // Actions handlers
  const handleAddMember = async (memberData: Partial<Member>) => {
    await apiPost("/api/members", memberData);
  };

  const handleUpdateMember = async (id: string, updatedData: Partial<Member>) => {
    await apiPost(`/api/members/${id}`, updatedData);
  };

  const handleDeleteMember = async (id: string) => {
    if (confirm("Confirmez-vous la suspension ou suppression administrative de cet adhérent ?")) {
      await apiPost(`/api/members/${id}/delete`, {});
    }
  };

  const handleAddTransaction = async (txData: Partial<FinancialTransaction>) => {
    await apiPost("/api/finances", txData);
  };

  const handleUpdateContribution = async (id: string, updatedData: Partial<Contribution>) => {
    await apiPost(`/api/contributions/${id}`, updatedData);
  };

  const handleAddDonation = async (donationData: Partial<Donation>) => {
    await apiPost("/api/donations", donationData);
  };

  const handleAddProject = async (projData: Partial<Project>) => {
    await apiPost("/api/projects", projData);
  };

  const handleUpdateProject = async (id: string, projData: Partial<Project>) => {
    await apiPost(`/api/projects/${id}`, projData);
  };

  const handleAddDocument = async (docData: Partial<DocItem>) => {
    await apiPost("/api/documents", docData);
  };

  const handleDeleteDocument = async (id: string) => {
    if (confirm("Supprimer ce document d'archives ?")) {
      await apiPost(`/api/documents/${id}/delete`, {});
    }
  };

  // Automated intelligent audits
  const handleRunAudit = async () => {
    const res = await apiPost("/api/ai/audit", {});
    return res as any;
  };

  const handleGenerateAssemblyReport = async () => {
    const res = await apiPost("/api/ai/report-generation", {});
    return res.report || "";
  };

  const handleTriggerBackup = async () => {
    await apiPost("/api/security/backup", {});
  };

  // Dynamic content router
  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <DashboardView 
            members={members}
            finances={finances}
            projects={projects}
            lang={lang}
            dict={dict}
            onNavigate={(v) => setActiveView(v)}
            onOpenQuickTx={() => { setActiveView("finances"); }}
            onOpenQuickMember={() => { setActiveView("members"); }}
          />
        );
      case 'members':
        return (
          <MembersView 
            members={members}
            lang={lang}
            dict={dict}
            userRole={userRole}
            onAddMember={handleAddMember}
            onUpdateMember={handleUpdateMember}
            onDeleteMember={handleDeleteMember}
          />
        );
      case 'finances':
        return (
          <FinancesView 
            finances={finances}
            projects={projects}
            lang={lang}
            dict={dict}
            userRole={userRole}
            onAddTransaction={handleAddTransaction}
          />
        );
      case 'contributions':
        return (
          <ContributionsView 
            contributions={contributions}
            lang={lang}
            dict={dict}
            userRole={userRole}
            onUpdateContribution={handleUpdateContribution}
          />
        );
      case 'donations':
        return (
          <DonationsView 
            donations={donations}
            projects={projects}
            lang={lang}
            dict={dict}
            userRole={userRole}
            onAddDonation={handleAddDonation}
          />
        );
      case 'projects':
        return (
          <ProjectsView 
            projects={projects}
            lang={lang}
            dict={dict}
            userRole={userRole}
            onAddProject={handleAddProject}
            onUpdateProject={handleUpdateProject}
          />
        );
      case 'documents':
        return (
          <DocumentsView 
            documents={documents}
            lang={lang}
            dict={dict}
            userRole={userRole}
            onAddDocument={handleAddDocument}
            onDeleteDocument={handleDeleteDocument}
          />
        );
      case 'security':
        return (
          <SecurityView 
            logs={logs}
            security={security}
            userRole={userRole}
            lang={lang}
            onTriggerBackup={handleTriggerBackup}
          />
        );
      case 'aiAssistant':
        return (
          <AiView 
            lang={lang}
            dict={dict}
            onRunAudit={handleRunAudit}
            onGenerateAssemblyReport={handleGenerateAssemblyReport}
          />
        );
      default:
        return <div>View not developed.</div>;
    }
  };

  return (
    <div id="applet-container" className="min-h-screen bg-slate-50 flex flex-col font-sans select-none antialiased text-slate-900">
      
      {/* Dynamic Top Administration Banner for testing role accesses instantly */}
      <div id="role-changer-banner" className="bg-slate-900 text-white px-4 py-2 border-b border-teal-500/30 flex flex-wrap items-center justify-between gap-3 text-xs">
        
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-teal-400 shrink-0" />
          <span className="font-bold text-slate-300">
            {lang === 'fr' ? 'Sélecteur de Rôle Test Administrateur :' : 'Active Role Evaluator :'}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'admin', label: dict.roleAdmin },
              { id: 'trésorier', label: dict.roleTreasurer },
              { id: 'secrétaire', label: dict.roleSecretary },
              { id: 'superviseur', label: dict.roleSupervisor },
              { id: 'membre', label: dict.roleMember }
            ].map((role) => (
              <button 
                key={role.id}
                onClick={() => setUserRole(role.id as UserRole)}
                className={`px-2.5 py-0.5 rounded-full font-bold transition text-[10px] cursor-pointer ${
                  userRole === role.id 
                    ? 'bg-teal-600 text-white border border-teal-400' 
                    : 'bg-slate-800 text-slate-400 hover:text-white border border-transparent'
                }`}
              >
                {role.label}
              </button>
            ))}
          </div>
        </div>

        {/* Multi-language and connection metrics */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-705 border border-slate-755 rounded-lg flex items-center gap-1.5 font-bold transition cursor-pointer"
          >
            <Languages className="w-3.5 h-3.5 text-teal-400" />
            <span>{lang.toUpperCase()}</span>
          </button>
          <span className="text-[10px] font-mono text-teal-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping"></span>
            Server.js connected
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* Navigation Sidebar */}
        <aside 
          id="app-sidebar"
          className={`${
            isSidebarOpen ? 'w-full md:w-64' : 'w-0 overflow-hidden md:w-20'
          } bg-white border-r border-slate-100 flex flex-col justify-between transition-all duration-350 shrink-0 shadow-2xs z-30`}
        >
          {/* Brand header */}
          <div className="p-5 border-b border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-8 bg-linear-to-r from-orange-500 via-white to-emerald-500 rounded-lg flex items-center justify-center text-slate-900 border border-slate-200 font-sans text-xs font-black shadow-md shrink-0">
                CINI
              </div>
              {isSidebarOpen && (
                <div className="text-left">
                  <h1 className="font-extrabold text-sm text-slate-800 leading-tight">CINI Niger</h1>
                  <p className="text-[10px] text-emerald-600 font-bold font-sans">Communauté Ivoirienne</p>
                </div>
              )}
            </div>

            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="text-slate-400 hover:text-slate-800 transition cursor-pointer hidden md:block"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
            {[
              { id: 'dashboard', label: dict.dashboard, icon: Landmark },
              { id: 'members', label: dict.members, icon: Users },
              { id: 'finances', label: dict.finances, icon: TrendingUp },
              { id: 'contributions', label: dict.contributions, icon: BookOpen },
              { id: 'donations', label: dict.donations, icon: Heart },
              { id: 'projects', label: dict.projects, icon: CheckCircle },
              { id: 'documents', label: dict.documents, icon: FileText },
              { id: 'security', label: dict.security, icon: ShieldAlert },
              { id: 'aiAssistant', label: dict.aiAssistant, icon: Sparkles, highlight: true }
            ].map((item) => {
              const IconComp = item.icon;
              const isActive = activeView === item.id;
              
              return (
                <button 
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id);
                    // collapse sidebar on mobile automatically
                    if (window.innerWidth < 768) {
                      setIsSidebarOpen(false);
                    }
                  }}
                  className={`w-full p-3 rounded-xl text-xs font-semibold flex items-center gap-3 transition cursor-pointer ${
                    isActive 
                      ? 'bg-teal-600 text-white shadow-xs' 
                      : (item.highlight ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100/70 border border-indigo-100/50' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900')
                  }`}
                >
                  <IconComp className={`w-5 h-5 ${isActive ? 'text-white' : (item.highlight ? 'text-indigo-650' : 'text-slate-400')}`} />
                  {isSidebarOpen && <span className="truncate text-left">{item.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          {isSidebarOpen && (
            <div className="p-4 border-t border-slate-50 bg-slate-50/50 text-[10px] text-slate-400 text-left leading-relaxed">
              <span className="block font-bold text-emerald-600">Communauté CINI Niger v2.4</span>
              <span>Géré par le Bureau Exécutif CINI</span>
            </div>
          )}
        </aside>

        {/* Content canvas container */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8">
          
          {/* Mobile hamburger header */}
          <div className="flex md:hidden items-center justify-between bg-white px-4 py-3 rounded-xl border border-slate-100 mb-4 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-6 bg-linear-to-r from-orange-500 via-white to-emerald-500 rounded-md text-slate-950 font-black text-center leading-6 text-[10px] border border-slate-200">CINI</div>
              <strong className="text-xs text-slate-800">CINI Niger</strong>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1 px-2 border border-slate-200 rounded-md text-slate-705 font-bold text-xs"
            >
              MENU
            </button>
          </div>

          {isLoading ? (
            <div className="py-24 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent animate-spin rounded-full mx-auto" />
              <p className="text-xs text-slate-500 font-semibold font-sans">Chargement des registres associatifs sécurisés...</p>
            </div>
          ) : (
            renderActiveView()
          )}
        </main>

      </div>
    </div>
  );
}
