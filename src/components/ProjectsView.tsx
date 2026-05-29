import React, { useState } from "react";
import { 
  Briefcase, Plus, Search, HelpCircle, Users, CheckSquare, 
  Calendar, Award, Activity, AlertCircle, Edit, Play 
} from "lucide-react";
import { Project, ProjectActivity, UserRole } from "../types";

interface ProjectsViewProps {
  projects: Project[];
  lang: 'fr' | 'en';
  dict: any;
  userRole: UserRole;
  onAddProject: (project: Partial<Project>) => void;
  onUpdateProject: (id: string, project: Partial<Project>) => void;
}

export default function ProjectsView({
  projects,
  lang,
  dict,
  userRole,
  onAddProject,
  onUpdateProject
}: ProjectsViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedProject, setSelectedProject] = useState<Project | null>(projects[0] || null);
  
  // Adding projects form
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formBudget, setFormBudget] = useState("");
  const [formBeneficiaries, setFormBeneficiaries] = useState("");
  const [formEndDate, setFormEndDate] = useState("");

  const isSupervisorOrAdmin = userRole === 'admin' || userRole === 'superviseur';

  const handleOpenCreate = () => {
    setFormTitle("");
    setFormDescription("");
    setFormBudget("");
    setFormBeneficiaries("");
    setFormEndDate("");
    setIsFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formDescription || !formBudget) return;

    onAddProject({
      title: formTitle,
      description: formDescription,
      budget: Number(formBudget),
      beneficiariesCount: Number(formBeneficiaries || 0),
      endDate: formEndDate || new Date().toISOString().split('T')[0],
      status: "planifié",
      activities: []
    });

    setIsFormOpen(false);
  };

  const toggleActivityStatus = (proj: Project, actId: string) => {
    const updatedActivities = proj.activities.map(act => {
      if (act.id === actId) {
        const nextStatus: 'à_faire' | 'en_cours' | 'complété' = 
          act.status === 'à_faire' ? 'en_cours' : 
          (act.status === 'en_cours' ? 'complété' : 'à_faire');
        return { ...act, status: nextStatus };
      }
      return act;
    });

    onUpdateProject(proj.id, { activities: updatedActivities });
    
    // Refresh selected project state view
    const syncedProj = projects.find(p => p.id === proj.id);
    if (syncedProj) {
      setSelectedProject({ ...syncedProj, activities: updatedActivities });
    }
  };

  // Add a task activity to the project
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskResponsible, setNewTaskResponsible] = useState("");

  const handleAddTask = (proj: Project, e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle || !newTaskResponsible) return;

    const newAct: ProjectActivity = {
      id: `act-${Date.now()}`,
      title: newTaskTitle,
      date: new Date().toISOString().split('T')[0],
      status: 'à_faire',
      responsibleName: newTaskResponsible
    };

    const updatedActivities = [...proj.activities, newAct];
    onUpdateProject(proj.id, { activities: updatedActivities });
    
    setNewTaskTitle("");
    setNewTaskResponsible("");

    // Update locally too
    setSelectedProject({ ...proj, activities: updatedActivities });
  };

  // Filters
  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 text-slate-800">
      
      {/* Header element */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-sans tracking-tight">
            {lang === 'fr' ? 'Programmes & Projets de Solidarité' : 'Humanitarian Projects Portfolio'}
          </h2>
          <p className="text-xs text-slate-400">Pilotez le cycle de vie de nos chantiers d'assistance humanitaire et mesurez leur impact social.</p>
        </div>

        {isSupervisorOrAdmin && (
          <button 
            id="launch-project-btn"
            onClick={handleOpenCreate}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'fr' ? 'Définir un nouveau projet' : 'Launch New Initiative'}</span>
          </button>
        )}
      </div>

      {/* Constraints Warning */}
      {!isSupervisorOrAdmin && (
        <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-500 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-500" />
          <span>{dict.restrictedAccess}</span>
        </div>
      )}

      {/* Main Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Project Selection list */}
        <div className="space-y-4">
          
          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs space-y-3">
            <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">Sélection de Projet</h4>
            
            <input 
              type="text"
              placeholder={dict.search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-teal-500"
            />
          </div>

          <div id="projects-sidebar-list" className="space-y-3">
            {filteredProjects.map((p) => {
              const activeRatio = Math.round((p.expenses / p.budget) * 100);
              const isSelected = selectedProject?.id === p.id;

              return (
                <div 
                  key={p.id}
                  onClick={() => setSelectedProject(p)}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition ${
                    isSelected ? 'bg-slate-900 border-slate-900 text-white shadow-md' : 'bg-white border-slate-100 text-slate-800 hover:border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`px-2 py-0.5 text-[8px] font-bold rounded-full ${
                      isSelected ? 'bg-teal-500/20 text-teal-300' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {(p.status || 'planifié').toUpperCase()}
                    </span>
                    <span className={`text-[10px] font-mono font-bold ${isSelected ? 'text-teal-400' : 'text-teal-600'}`}>{p.expenses.toLocaleString()} F / {p.budget.toLocaleString()} F</span>
                  </div>

                  <h4 className="font-bold text-xs truncate mb-1">{p.title}</h4>
                  <p className={`text-[10px] line-clamp-2 leading-relaxed ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>{p.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Task Milestones & Budgets Progress Card (2 cols) */}
        <div id="project-detail-panel" className="lg:col-span-2 space-y-6">
          {selectedProject ? (
            <div className="bg-white border border-slate-100 rounded-2xl shadow-xs p-6 space-y-6">
              
              {/* Detailed Heading */}
              <div className="flex flex-col sm:flex-row items-start justify-between border-b border-slate-100 pb-4 gap-4">
                <div className="space-y-1 text-left">
                  <span className="text-[10px] font-bold text-teal-600 tracking-wider uppercase font-mono">{lang === 'fr' ? 'FICHE DE SUIVI OPÉRATIVE' : 'OPERATIVE DASHBOARD'}</span>
                  <h3 className="text-xl font-bold text-slate-900 font-sans tracking-tight">{selectedProject.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{selectedProject.description}</p>
                </div>
                
                <div className="flex gap-2 shrink-0">
                  <div className="px-3 py-1 bg-teal-50 text-teal-700 rounded-lg text-xs font-bold font-mono">
                    {selectedProject.performanceIndex}% {lang === 'fr' ? 'Avancement' : 'Overall Progress'}
                  </div>
                </div>
              </div>

              {/* Financial Metrics Indicators Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-slate-100 pb-5">
                <div className="p-3.5 bg-slate-50 rounded-xl text-left">
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'fr' ? 'Enveloppe Budget' : 'Allocated Budget'}</span>
                  <strong className="text-lg font-black text-slate-800 font-mono">{selectedProject.budget.toLocaleString()} FCFA</strong>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl text-left">
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'fr' ? 'Dépenses Engagées' : 'Actual Expenditures'}</span>
                  <strong className="text-lg font-black text-rose-600 font-mono">{selectedProject.expenses.toLocaleString()} FCFA</strong>
                </div>

                <div className="p-3.5 bg-teal-50/50 rounded-xl text-left border border-teal-100/50">
                  <span className="block text-[9px] font-bold text-teal-600 uppercase tracking-wider">{lang === 'fr' ? 'Bénéficiaires Directs' : 'Social Reach'}</span>
                  <strong className="text-lg font-black text-teal-700 font-mono">{selectedProject.beneficiariesCount} {lang === 'fr' ? 'individus' : 'persons'}</strong>
                </div>
              </div>

              {/* Milestones Activites Section */}
              <div className="space-y-4">
                <h4 className="font-bold text-sm text-slate-800 text-left flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-teal-600" />
                  <span>{lang === 'fr' ? 'Jalons & Activités terrain' : 'Project Milestones List'}</span>
                </h4>

                {/* Subtasks interactive list */}
                <div className="space-y-3">
                  {selectedProject.activities.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-6 text-center">Aucune activité terrain renseignée pour l'instant.</p>
                  ) : (
                    selectedProject.activities.map((act) => (
                      <div 
                        key={act.id}
                        onClick={() => toggleActivityStatus(selectedProject, act.id)}
                        className="p-3.5 bg-slate-50 hover:bg-teal-50/30 rounded-xl border border-slate-100 hover:border-teal-200/50 transition duration-150 flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-start gap-3 text-left">
                          <input 
                            type="checkbox"
                            checked={act.status === 'complété'}
                            onChange={() => {}} // handled by div click
                            className="mt-1 cursor-pointer rounded-sm accent-teal-600 h-4 w-4 shrink-0"
                          />
                          <div>
                            <strong className={`block text-xs text-slate-800 ${act.status === 'complété' ? 'line-through text-slate-400' : ''}`}>{act.title}</strong>
                            <div className="flex gap-2 text-[10px] text-slate-400 mt-1 font-mono">
                              <span>Responsable : <strong>{act.responsibleName}</strong></span>
                              <span>•</span>
                              <span>Échéance : <strong>{act.date}</strong></span>
                            </div>
                          </div>
                        </div>

                        {/* Status badge */}
                        <span className={`px-2 py-0.5 text-[8px] font-black rounded-full ${
                          (act.status || 'à_faire') === 'complété' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          ((act.status || 'à_faire') === 'en_cours' ? 'bg-sky-50 text-sky-700 border border-sky-100' : 'bg-slate-200/80 text-slate-600')
                        }`}>
                          {(act.status || 'à_faire').toUpperCase()}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {/* Add standard activity form (For supervisors) */}
                {isSupervisorOrAdmin && (
                  <form onSubmit={(e) => handleAddTask(selectedProject, e)} className="p-4 bg-slate-50 rounded-xl border border-slate-100/70 space-y-3 text-left">
                    <strong className="block text-[10px] uppercase font-bold text-slate-500">Ajouter un jalon d'action</strong>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input 
                        type="text" 
                        placeholder="Ex: Distribution des kits de soins d'urgence"
                        required
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        className="p-2.5 bg-white border border-slate-200 rounded-xl text-xs"
                      />
                      <input 
                        type="text" 
                        placeholder="Responsable (Ex: Amina T.)"
                        required
                        value={newTaskResponsible}
                        onChange={(e) => setNewTaskResponsible(e.target.value)}
                        className="p-2.5 bg-white border border-slate-200 rounded-xl text-xs"
                      />
                    </div>
                    
                    <button 
                      type="submit"
                      className="px-3.5 py-2 bg-slate-900 border border-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs cursor-pointer"
                    >
                      Ajouter jalon
                    </button>
                  </form>
                )}
              </div>

            </div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-2xl p-10 text-center text-slate-400 shadow-xs h-96 flex flex-col justify-center items-center gap-3">
              <Briefcase className="w-12 h-12 text-slate-200" />
              <p className="text-xs font-semibold">Aucun projet sélectionné. Créez un projet de solidarité au registre.</p>
            </div>
          )}
        </div>

      </div>

      {/* CREATE NEW PROJECT DIALOG */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase">
                {lang === 'fr' ? 'Programmer une action humanitaire' : 'Propose humanitarian project'}
              </h3>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4 text-xs text-left">
              
              <div className="space-y-1">
                <label className="block text-slate-500 font-semibold uppercase">Titre d'action du Programme *</label>
                <input 
                  type="text" 
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Ex: Électrification de dispensaires"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-500 font-semibold uppercase">Descriptif & Objectifs de Solidarité *</label>
                <textarea 
                  required
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Décrivez les objectifs humanitaires clé, la région, et les méthodes de mise en œuvre."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-500 font-semibold uppercase">Budget prévisionnel (FCFA) *</label>
                  <input 
                    type="number" 
                    required
                    value={formBudget}
                    onChange={(e) => setFormBudget(e.target.value)}
                    placeholder="Ex: 5000000"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-500 font-semibold uppercase">Bénéficiaires visés</label>
                  <input 
                    type="number" 
                    value={formBeneficiaries}
                    onChange={(e) => setFormBeneficiaries(e.target.value)}
                    placeholder="Ex: 250"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-500 font-semibold uppercase">Échéance de fin de mission</label>
                <input 
                  type="date" 
                  value={formEndDate}
                  onChange={(e) => setFormEndDate(e.target.value)}
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
                  Créer et Publier le Projet
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
