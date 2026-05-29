import React, { useState, useRef } from "react";
import { 
  FileText, Upload, Folder, Search, Trash2, 
  Download, AlertCircle, ShieldAlert, FolderPlus, ArrowUpCircle 
} from "lucide-react";
import { DocItem, UserRole } from "../types";

interface DocumentsViewProps {
  documents: DocItem[];
  lang: 'fr' | 'en';
  dict: any;
  userRole: UserRole;
  onAddDocument: (doc: Partial<DocItem>) => void;
  onDeleteDocument: (id: string) => void;
}

export default function DocumentsView({
  documents,
  lang,
  dict,
  userRole,
  onAddDocument,
  onDeleteDocument
}: DocumentsViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isSecretaryOrAdmin = userRole === 'admin' || userRole === 'secrétaire';

  // Categories list
  const categoriesList = Array.from(new Set(documents.map(d => d.category)));

  // Drag and Drop files upload handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0]);
    }
  };

  const uploadFile = (file: File) => {
    if (!isSecretaryOrAdmin) {
      alert("Accès restreint : Seuls les Secrétaires et Administrateurs peuvent déposer des fichiers d'archives.");
      return;
    }

    // Format file size
    const sizeKB = Math.round(file.size / 1024);
    const formattedSize = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`;

    onAddDocument({
      title: file.name.split('.')[0],
      category: file.name.endsWith('.pdf') ? 'Administratif' : 'Général',
      fileName: file.name,
      fileSize: formattedSize
    });
  };

  const triggerMockDownload = (doc: DocItem) => {
    alert(`Téléchargement sécurisé et vérification HMAC du fichier : ${doc.fileName} (${doc.fileSize})`);
  };

  // Filter core documents
  const filteredDocs = documents.filter(d => {
    const matchesSearch = 
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || d.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 text-slate-800">
      
      {/* Header element */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-sans tracking-tight">
            {lang === 'fr' ? 'Coffre Documentaire d’Association' : 'Secure Association Documents'}
          </h2>
          <p className="text-xs text-slate-400">Archivage numérique sécurisé des procès-verbaux d'assemblées, statuts constitutifs et rapports comités.</p>
        </div>
      </div>

      {/* Role Warnings */}
      {!isSecretaryOrAdmin && (
        <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-500 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-500" />
          <span>{dict.restrictedAccess}</span>
        </div>
      )}

      {/* Two-Column Drawer Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Upload Drawer column */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-4 text-left">
            <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              {lang === 'fr' ? 'Dépôt de Fichier Administratif' : 'File Ingestion Hub'}
            </h4>

            {/* Drag & Drop Visual Box */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => isSecretaryOrAdmin && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center transition cursor-pointer flex flex-col items-center justify-center gap-3 ${
                dragActive ? 'border-teal-500 bg-teal-50/20' : 'border-slate-200 bg-slate-50 hover:border-slate-300'
              } ${!isSecretaryOrAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input 
                ref={fileInputRef}
                type="file"
                className="hidden"
                disabled={!isSecretaryOrAdmin}
                onChange={handleFileChange}
              />
              
              <div className="p-2 bg-white rounded-lg shadow-xs text-slate-400">
                <Upload className="w-6 h-6 text-teal-600 animate-pulse" />
              </div>
              
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-700">
                  {lang === 'fr' ? 'Faites glisser votre fichier Cerfa ou PDF' : 'Drag & Drop PDF files here'}
                </p>
                <p className="text-[10px] text-slate-400">ou cliquez pour localiser vos documents (taille max: 10 Mo)</p>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 space-y-2 border-t border-slate-100 pt-3">
              <strong className="block text-[8px] uppercase tracking-wider text-slate-500">Charte de conformité documentaire</strong>
              <p className="leading-relaxed">
                Tout procès-verbal de décision budgétaire ou modification de statut statutaire doit être déposé au format PDF signé par le comité exécutif pour auditabilité.
              </p>
            </div>
          </div>
        </div>

        {/* Archives cabinets files table (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-xs p-5 space-y-4">
          
          {/* Filters shelf */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input 
                type="text"
                placeholder={dict.search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-teal-500"
              />
            </div>

            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-700 focus:outline-teal-500 shrink-0"
            >
              <option value="all">{lang === 'fr' ? 'Toutes les archives' : 'All Categories'}</option>
              {categoriesList.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Documents rows layout */}
          <div className="space-y-3">
            {filteredDocs.length === 0 ? (
              <p className="text-xs text-slate-400 py-10 text-center font-medium font-sans">
                Aucun document répertorié pour ces filtres.
              </p>
            ) : (
              filteredDocs.map((doc) => (
                <div 
                  key={doc.id}
                  className="p-3.5 bg-slate-50 hover:bg-slate-100/50 rounded-xl border border-slate-100/80 transition flex items-center justify-between text-left"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
                      <Folder className="w-5 h-5" />
                    </div>
                    <div>
                      <strong className="block text-xs text-slate-800">{doc.title}</strong>
                      <span className="block text-[10px] text-slate-400 mt-0.5">{doc.fileName} • <strong>{doc.fileSize}</strong></span>
                      <span className="block text-[9px] text-slate-400 mt-0.5">Importé par: <strong>{doc.uploadedBy}</strong> le {doc.uploadedAt}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => triggerMockDownload(doc)}
                      className="p-1.5 bg-white hover:bg-slate-150 rounded-md text-slate-600 hover:text-slate-900 border border-slate-100 transition shadow-2xs cursor-pointer"
                      title="Télécharger l'archive securisé"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    {isSecretaryOrAdmin && (
                      <button 
                        onClick={() => onDeleteDocument(doc.id)}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-md border border-rose-100 transition cursor-pointer"
                        title="Archiver / supprimer définitivement"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
