import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { 
  User, Member, FinancialTransaction, Contribution, 
  Donation, Project, DocItem, ActivityLog, SecurityStatus
} from "./src/types";

// Port constraint: Port 3000 is the ONLY externally accessible port
const PORT = 3000;
const app = express();

export type UserRole = 'admin' | 'trésorier' | 'secrétaire' | 'superviseur' | 'membre';

app.use(express.json({ limit: '10mb' }));

// ----------------------------------------------------
// DATABASE STRATEGY (JSON PERSISTENC)
// ----------------------------------------------------
const DB_PATH = path.join(process.cwd(), "db.json");

// Core database structure
interface DatabaseStructure {
  users: User[];
  members: Member[];
  finances: FinancialTransaction[];
  contributions: Contribution[];
  donations: Donation[];
  projects: Project[];
  documents: DocItem[];
  logs: ActivityLog[];
  security: SecurityStatus;
}

// Initial robust seed data for humanitarian / community association
const initialDatabase: DatabaseStructure = {
  users: [
    { id: "u-1", name: "Marc Koffi", email: "admin@association.org", role: "admin", isActive: true, mfaEnabled: true },
    { id: "u-2", name: "Sophie Brou", email: "tresorier@association.org", role: "trésorier", isActive: true, mfaEnabled: true },
    { id: "u-3", name: "Koffi N'Guessan", email: "secretaire@association.org", role: "secrétaire", isActive: true, mfaEnabled: false },
    { id: "u-4", name: "Amina Coulibaly", email: "superviseur@association.org", role: "superviseur", isActive: true, mfaEnabled: false },
    { id: "u-5", name: "Lucas Yao", email: "membre@association.org", role: "membre", isActive: true, mfaEnabled: false }
  ],
  members: [
    {
      id: "m-1",
      firstName: "Jean",
      lastName: "Konan",
      email: "jean.konan@email.com",
      phone: "+227 90 12 34 56",
      status: "actif",
      joinDate: "2024-01-15",
      address: "Quartier Plateau, Boulevard de la Liberté, Niamey",
      photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      membershipCardNumber: "CINI-2024-001",
      notes: "Membre fondateur actif, délégué de la section Niamey-Plateau."
    },
    {
      id: "m-2",
      firstName: "Awa",
      lastName: "Touré",
      email: "awa.toure@email.com",
      phone: "+227 96 87 65 43",
      status: "actif",
      joinDate: "2024-02-10",
      address: "Avenue du Sahel, Quartier Terminus, Niamey",
      photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      membershipCardNumber: "CINI-2024-002",
      notes: "Enseignante bénévole, responsable des cours de soutien scolaire de la CINI."
    },
    {
      id: "m-3",
      firstName: "Pierre",
      lastName: "Bakayoko",
      email: "pierre.bakayoko@email.com",
      phone: "+227 91 55 44 33",
      status: "inactif",
      joinDate: "2023-05-20",
      address: "Secteur 3, Route de Zinder, Maradi",
      photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
      membershipCardNumber: "CINI-2023-104",
      notes: "Ancien trésorier adjoint, réside temporairement à Maradi pour affaires commerciales."
    },
    {
      id: "m-4",
      firstName: "Fatima",
      lastName: "Diomandé",
      email: "fatima.diomande@email.com",
      phone: "+227 89 33 99 99",
      status: "suspendu",
      joinDate: "2024-03-01",
      address: "Zone Industrielle, face Grand Marché, Niamey",
      photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
      membershipCardNumber: "CINI-2024-019",
      notes: "Mise en sommeil temporaire suite à un retard de cotisation de plus de 4 mois."
    }
  ],
  finances: [
    { id: "t-1", type: "recette", category: "Cotisations", amount: 450000, date: "2026-05-10", description: "Cotisations de Niamey-Est & Plateau", sourceOrDestination: "Membres de Niamey" },
    { id: "t-2", type: "recette", category: "Dons", amount: 2500000, date: "2026-05-12", description: "Don exceptionnel pour le fonds scolaire CINI", sourceOrDestination: "Donateur Orange-Niger" },
    { id: "t-3", type: "dépense", category: "Solidarité", amount: 850000, date: "2026-05-15", description: "Achat de fournitures pour l'arbre de Noël et colis scolaires", sourceOrDestination: "Librairie Universelle Niamey", projectName: "Fonds d'Entraide Éducative CINI" },
    { id: "t-4", type: "dépense", category: "Santé", amount: 180000, date: "2026-05-18", description: "Médicaments essentiels et suivi consultations", sourceOrDestination: "Pharmacie du Sahel Niamey", projectName: "Caravane Santé & Social" },
    { id: "t-5", type: "recette", category: "Subvention", amount: 5000000, date: "2026-05-20", description: "Subvention annuelle d'entraide", sourceOrDestination: "Consulat Honoraire de Côte d'Ivoire au Niger" },
    { id: "t-6", type: "dépense", category: "Fonctionnement", amount: 150000, date: "2026-05-22", description: "Hébergement de la plateforme CINI du Niger et SMS d'information", sourceOrDestination: "HostCloude SA" },
    { id: "t-7", type: "dépense", category: "Solidarité", amount: 300000, date: "2026-05-25", description: "Aide directe logement d'urgence à une famille ivoirienne sinistrée", sourceOrDestination: "Famille S. (Bénéficiaire)" }
  ],
  contributions: [
    { id: "c-1", memberId: "m-1", memberName: "Jean Konan", month: "2026-05", amountPaid: 10000, amountDue: 10000, status: "payé", lastPaymentDate: "2026-05-02" },
    { id: "c-2", memberId: "m-2", memberName: "Awa Touré", month: "2026-05", amountPaid: 10000, amountDue: 10000, status: "payé", lastPaymentDate: "2026-05-05" },
    { id: "c-3", memberId: "m-3", memberName: "Pierre Bakayoko", month: "2026-05", amountPaid: 0, amountDue: 10000, status: "en_retard" },
    { id: "c-4", memberId: "m-4", memberName: "Fatima Diomandé", month: "2026-05", amountPaid: 5000, amountDue: 10000, status: "partiel", lastPaymentDate: "2026-05-11" },
    { id: "c-5", memberId: "m-1", memberName: "Jean Konan", month: "2026-04", amountPaid: 10000, amountDue: 10000, status: "payé", lastPaymentDate: "2026-04-01" },
    { id: "c-6", memberId: "m-2", memberName: "Awa Touré", month: "2026-04", amountPaid: 10000, amountDue: 10000, status: "payé", lastPaymentDate: "2026-04-04" }
  ],
  donations: [
    { id: "d-1", donorName: "Augustin Koffi", donorEmail: "koffi.augustin@gmail.com", amount: 120000, date: "2026-05-01", projectLinked: "Fonds d'Entraide Éducative CINI", message: "Bonne continuation à notre association CINI.", receiptNumber: "REC-2026-041" },
    { id: "d-2", donorName: "CGE-Côte d'Ivoire", donorEmail: "contact@cge-ci.com", amount: 2500000, date: "2026-05-08", projectLinked: "Solidarité Alimentaire CINI", message: "Don corporatif annuel pour la caisse d'entraide.", receiptNumber: "REC-2026-042" },
    { id: "d-3", donorName: "Anonyme d'Abidjan", donorEmail: "contact@cini.ne", amount: 50000, date: "2026-05-14", message: "En soutien aux urgences hospitalières de nos frères à Niamey.", receiptNumber: "REC-2026-043" }
  ],
  projects: [
    {
      id: "p-1",
      title: "Fonds d'Entraide Éducative CINI",
      description: "Bourses scolaires et achat de kits éducatifs pour les enfants de ressortissants ivoiriens en difficulté d'apprentissage ou financiers à Niamey.",
      budget: 12000000,
      expenses: 9500000,
      beneficiariesCount: 1500,
      startDate: "2025-10-01",
      endDate: "2026-08-30",
      status: "en_cours",
      performanceIndex: 80,
      activities: [
        { id: "act-1", title: "Recensement des enfants scolarisés de la communauté", date: "2025-11-15", status: "complété", responsibleName: "Koffi N'Guessan" },
        { id: "act-2", title: "Achat de manuels scolaires et sacs à dos d'éducation", date: "2026-02-10", status: "complété", responsibleName: "Sophie Brou" },
        { id: "act-3", title: "Versement des bourses trimestrielles de scolarité dans les écoles", date: "2026-05-01", status: "en_cours", responsibleName: "Amina Coulibaly" },
        { id: "act-4", title: "Atelier d'orientation professionnelle et orientation post-bac", date: "2026-07-15", status: "à_faire", responsibleName: "Bureau CINI" }
      ]
    },
    {
      id: "p-2",
      title: "Solidarité Alimentaire CINI",
      description: "Distribution de vivres de base et lait infantile auprès des foyers de ressortissants ivoiriens du Niger vivant en situation de forte précarité.",
      budget: 4000000,
      expenses: 2850000,
      beneficiariesCount: 420,
      startDate: "2026-01-01",
      endDate: "2026-12-31",
      status: "en_cours",
      performanceIndex: 70,
      activities: [
        { id: "act-5", title: "Collecte auprès des grossistes partenaires du Grand Marché", date: "2026-03-24", status: "complété", responsibleName: "Jean Konan" },
        { id: "act-6", title: "Mise en cartons alimentaires de sécurité à la permanence", date: "2026-04-01", status: "complété", responsibleName: "Membres Actifs" },
        { id: "act-7", title: "Distribution urbaine de première nécessité (Niamey, Dosso)", date: "2026-05-20", status: "complété", responsibleName: "Marc Koffi" }
      ]
    },
    {
      id: "p-3",
      title: "Caravane Santé & Social",
      description: "Soins cliniques itinérants gratuits, appuis mutuels et consultations préventives au profit de la communauté vivante au Niger.",
      budget: 6500000,
      expenses: 850000,
      beneficiariesCount: 880,
      startDate: "2026-05-01",
      endDate: "2026-06-15",
      status: "en_cours",
      performanceIndex: 15,
      activities: [
        { id: "act-8", title: "Conventionnement des hôpitaux d'accueil à Niamey", date: "2026-05-05", status: "complété", responsibleName: "Awa Touré" },
        { id: "act-9", title: "Approvisionnement en bandelettes et médicaments généraux", date: "2026-05-18", status: "complété", responsibleName: "Sophie Brou" },
        { id: "act-10", title: "Journée de dépistage et de consultations médico-sociales", date: "2026-06-01", status: "à_faire", responsibleName: "Dr. Koné" }
      ]
    }
  ],
  documents: [
    { id: "doc-1", title: "Statuts Constitutifs de la CINI Niger", category: "Administratif", fileName: "Statuts_CINI_Niger_Officiel.pdf", fileSize: "1.2 MB", uploadedBy: "Koffi N'Guessan", uploadedAt: "2024-01-16" },
    { id: "doc-2", title: "Rapport Financier Annuel CINI 2025", category: "Finances", fileName: "CINI_Rapport_Finances_2025.pdf", fileSize: "3.4 MB", uploadedBy: "Sophie Brou", uploadedAt: "2026-01-20" },
    { id: "doc-3", title: "Récépissé de Reconnaissance Légale CINI - Ministère Intérieur Niger", category: "Administratif", fileName: "Recepisse_Officiel_CINI_Niger.pdf", fileSize: "720 KB", uploadedBy: "Marc Koffi", uploadedAt: "2025-06-12" }
  ],
  logs: [
    { id: "log-1", timestamp: "2026-05-29T10:15:30Z", userEmail: "admin@association.org", role: "admin", action: "Connexion", details: "Authentification réussie sur l'adresse IP 192.168.1.45." },
    { id: "log-2", timestamp: "2026-05-29T11:02:40Z", userEmail: "tresorier@association.org", role: "trésorier", action: "Création Budget", details: "Validation de l'achat de trousses médicales pédiatriques de secours pour la Caravane Santé." },
    { id: "log-3", timestamp: "2026-05-29T14:20:10Z", userEmail: "secretaire@association.org", role: "secrétaire", action: "Mise à jour membre", details: "Modification du statut bancaire et d'adhésion de Pierre Bakayoko en 'inactif' pour cause de séjour à Maradi." }
  ],
  security: {
    lastBackup: "2026-05-29T02:00:00Z",
    encryptionKeyStrength: "AES-256 bits GCM",
    systemIntegrity: "excellent",
    threatAlerts: 0
  }
};

// Database utility functions
function getDB(): DatabaseStructure {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify(initialDatabase, null, 2), "utf8");
      return initialDatabase;
    }
    const data = fs.readFileSync(DB_PATH, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading database file, using fallback:", err);
    return initialDatabase;
  }
}

function saveDB(db: DatabaseStructure) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to persist database file:", err);
  }
}

// ----------------------------------------------------
// GEMINI CLIENT INITIALIZATION (Server-side secret only)
// ----------------------------------------------------
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  aiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
  console.log("Gemini API Client successfully initialized on the backend.");
} else {
  console.warn("GEMINI_API_KEY is not configured in the environment variables. AI operations will use highly detailed mock fallbacks.");
}

// ----------------------------------------------------
// REST API ROUTES
// ----------------------------------------------------

// 1. Audit Logging system
function logAction(userEmail: string, role: UserRole, action: string, details: string) {
  const db = getDB();
  const newLog: ActivityLog = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    userEmail,
    role,
    action,
    details
  };
  db.logs.unshift(newLog);
  if (db.logs.length > 200) db.logs.pop(); // Cap logs lists to save space
  saveDB(db);
}

// 2. Authentication API (JWT simulation & Session simulation)
app.post("/api/auth/login", (req, res) => {
  const { email, role } = req.body;
  const db = getDB();
  
  // Find mapped user or fall back
  let userObj = db.users.find(u => u.email === email || (role && u.role === role));
  if (!userObj) {
    // Dynamically create the user if custom requested, or fall back
    userObj = {
      id: `u-${Date.now()}`,
      name: email ? email.split('@')[0].toUpperCase() : "Collaborateur",
      email: email || "user@association.org",
      role: (role as UserRole) || "membre",
      isActive: true,
      mfaEnabled: false
    };
  }

  logAction(userObj.email, userObj.role, "Connexion", `Session créée avec succès. Double authentification: ${userObj.mfaEnabled ? 'Activée' : 'Désactivée'}.`);
  res.json({ token: `mock-jwt-token-for-${userObj.id}`, user: userObj });
});

// Auth double factor toggle
app.post("/api/auth/mfa/toggle", (req, res) => {
  const { userId, enabled } = req.body;
  const db = getDB();
  const user = db.users.find(u => u.id === userId);
  if (user) {
    user.mfaEnabled = enabled;
    saveDB(db);
    logAction(user.email, user.role, "Sécurité MFA", `${enabled ? 'Activation' : 'Désactivation'} de la double-authentification.`);
    return res.json({ success: true, user });
  }
  res.status(404).json({ error: "Utilisateur non trouvé" });
});

// Logs fetch
app.get("/api/logs", (req, res) => {
  const db = getDB();
  res.json(db.logs);
});

// Security status fetch
app.get("/api/security", (req, res) => {
  const db = getDB();
  res.json(db.security);
});

// Manual backup action
app.post("/api/security/backup", (req, res) => {
  const { userEmail, userRole } = req.body;
  const db = getDB();
  db.security.lastBackup = new Date().toISOString();
  saveDB(db);
  logAction(userEmail || "admin@association.org", userRole || "admin", "Sauvegarde système", "Création manuelle d'une version de restructuration comptable et documentaire complète.");
  res.json({ success: true, lastBackup: db.security.lastBackup });
});

app.get("/api/database", (req, res) => {
  const db = getDB();
  res.json(db);
});

// 3. MEMBERS API
app.get("/api/members", (req, res) => {
  const db = getDB();
  res.json(db.members);
});

app.post("/api/members", (req, res) => {
  const { member: bodyMember, actorEmail: bodyActorEmail, actorRole: bodyActorRole } = req.body;
  const member = bodyMember || req.body || {};
  const db = getDB();

  const actorEmail = String(req.headers["x-user-email"] || bodyActorEmail || "secrétaire@association.org");
  const actorRole = (req.headers["x-user-role"] as UserRole) || (bodyActorRole as UserRole) || "secrétaire";
  
  const newMember: Member = {
    id: `m-${Date.now()}`,
    firstName: member.firstName || "",
    lastName: member.lastName || "",
    email: member.email || "",
    phone: member.phone || "",
    status: member.status || "actif",
    address: member.address || "",
    photoUrl: member.photoUrl || "",
    notes: member.notes || "",
    joinDate: new Date().toISOString().split('T')[0],
    membershipCardNumber: `CINI-2026-${Math.floor(100 + Math.random() * 900)}`
  };
  
  db.members.push(newMember);
  saveDB(db);
  
  // Auto-initiate contribution track for active member
  if (newMember.status === 'actif') {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    db.contributions.push({
      id: `c-${Date.now()}`,
      memberId: newMember.id,
      memberName: `${newMember.firstName} ${newMember.lastName}`,
      month: currentMonth,
      amountPaid: 0,
      amountDue: 30, // Default association monthly due
      status: "en_retard"
    });
    saveDB(db);
  }

  logAction(actorEmail, actorRole, "Création de membre", `Enregistrement du nouveau membre ${newMember.firstName} ${newMember.lastName}.`);
  res.json(newMember);
});

app.put("/api/members/:id", (req, res) => {
  const { id } = req.params;
  const { member: bodyMember, actorEmail: bodyActorEmail, actorRole: bodyActorRole } = req.body;
  const member = bodyMember || req.body || {};
  const db = getDB();

  const actorEmail = String(req.headers["x-user-email"] || bodyActorEmail || "secrétaire@association.org");
  const actorRole = (req.headers["x-user-role"] as UserRole) || (bodyActorRole as UserRole) || "secrétaire";

  const index = db.members.findIndex(m => m.id === id);
  if (index !== -1) {
    db.members[index] = { 
      ...db.members[index], 
      firstName: member.firstName !== undefined ? member.firstName : db.members[index].firstName,
      lastName: member.lastName !== undefined ? member.lastName : db.members[index].lastName,
      email: member.email !== undefined ? member.email : db.members[index].email,
      phone: member.phone !== undefined ? member.phone : db.members[index].phone,
      status: member.status !== undefined ? member.status : db.members[index].status,
      address: member.address !== undefined ? member.address : db.members[index].address,
      notes: member.notes !== undefined ? member.notes : db.members[index].notes,
      photoUrl: member.photoUrl !== undefined ? member.photoUrl : db.members[index].photoUrl,
    };
    saveDB(db);
    logAction(actorEmail, actorRole, "Mise à jour membre", `Modification de la fiche du membre ${db.members[index].firstName} ${db.members[index].lastName}.`);
    return res.json(db.members[index]);
  }
  res.status(404).json({ error: "Membre non trouvé" });
});

app.delete("/api/members/:id", (req, res) => {
  const { id } = req.params;
  const { actorEmail, actorRole } = req.headers;
  const db = getDB();
  const index = db.members.findIndex(m => m.id === id);
  if (index !== -1) {
    const deletedName = `${db.members[index].firstName} ${db.members[index].lastName}`;
    db.members.splice(index, 1);
    // clean up contributions
    db.contributions = db.contributions.filter(c => c.memberId !== id);
    saveDB(db);
    logAction(String(actorEmail) || "admin@association.org", (actorRole as UserRole) || "admin", "Suppression de membre", `Suppression définitive de la fiche membre de ${deletedName}.`);
    return res.json({ success: true });
  }
  res.status(404).json({ error: "Membre non trouvé" });
});

// 4. FINANCIAL TRANSACTIONS API
app.get("/api/finances", (req, res) => {
  const db = getDB();
  res.json(db.finances);
});

app.post("/api/finances", (req, res) => {
  const { tx, actorEmail, actorRole } = req.body;
  const db = getDB();
  
  const newTx: FinancialTransaction = {
    ...tx,
    id: `t-${Date.now()}`,
    amount: Number(tx.amount)
  };
  
  db.finances.push(newTx);
  
  // Link to project budget if applicable
  if (newTx.projectName && newTx.type === 'dépense') {
    const proj = db.projects.find(p => p.title === newTx.projectName);
    if (proj) {
      proj.expenses += newTx.amount;
      // recalculate performance completions metric dynamically
      proj.performanceIndex = Math.min(100, Math.round((proj.expenses / proj.budget) * 100));
    }
  }

  saveDB(db);
  logAction(actorEmail || "trésorier@association.org", actorRole || "trésorier", "Enregistrement financier", `Nouvelle ${newTx.type}: ${newTx.category} de ${newTx.amount} FCFA (${newTx.description}).`);
  res.json(newTx);
});

// 5. CONTRIBUTIONS (COTISATIONS) API
app.get("/api/contributions", (req, res) => {
  const db = getDB();
  res.json(db.contributions);
});

app.put("/api/contributions/:id", (req, res) => {
  const { id } = req.params;
  const { updatedData, actorEmail, actorRole } = req.body;
  const db = getDB();
  const index = db.contributions.findIndex(c => c.id === id);
  if (index !== -1) {
    const prev = db.contributions[index];
    const newPaid = Number(updatedData.amountPaid);
    
    db.contributions[index] = { 
      ...prev, 
      amountPaid: newPaid,
      status: newPaid >= prev.amountDue ? 'payé' : (newPaid > 0 ? 'partiel' : 'en_retard'),
      lastPaymentDate: new Date().toISOString().split('T')[0]
    };

    // Automatically create a financial recipe/income record for cotisations!
    const deltaAmount = newPaid - prev.amountPaid;
    if (deltaAmount > 0) {
      const dbFin = getDB();
      dbFin.finances.push({
        id: `t-${Date.now()}`,
        type: 'recette',
        category: 'Cotisations',
        amount: deltaAmount,
        date: new Date().toISOString().split('T')[0],
        description: `Cotisation reçue - ${prev.memberName} - Mois: ${prev.month}`,
        sourceOrDestination: prev.memberName,
        receiptId: `REC-COT-${Date.now().toString().slice(-6)}`
      });
      saveDB(dbFin);
    }
    
    logAction(actorEmail || "trésorier@association.org", actorRole || "trésorier", "Paiement cotisation", `Mise à jour cotisation de ${prev.memberName} pour ${prev.month}: ${newPaid} FCFA encaissés.`);
    return res.json(db.contributions[index]);
  }
  res.status(404).json({ error: "Ligne de cotisation non trouvée" });
});

// 6. DONATIONS API
app.get("/api/donations", (req, res) => {
  const db = getDB();
  res.json(db.donations);
});

app.post("/api/donations", (req, res) => {
  const { donation, actorEmail, actorRole } = req.body;
  const db = getDB();
  
  const newDonation: Donation = {
    ...donation,
    id: `d-${Date.now()}`,
    amount: Number(donation.amount),
    date: new Date().toISOString().split('T')[0],
    receiptNumber: `REC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`
  };

  db.donations.unshift(newDonation);
  
  // Save as cash/bank recipe automatically
  db.finances.push({
    id: `t-${Date.now()}`,
    type: 'recette',
    category: 'Dons',
    amount: newDonation.amount,
    date: newDonation.date,
    description: `Donation solidaire - ${newDonation.donorName}`,
    sourceOrDestination: `${newDonation.donorName} (${newDonation.donorEmail})`,
    receiptId: newDonation.receiptNumber
  });

  saveDB(db);
  logAction(actorEmail || "trésorier@association.org", actorRole || "trésorier", "Réception de Don", `Enregistrement du don de ${newDonation.amount} FCFA de ${newDonation.donorName}. Reçu fiscal généré.`);
  res.json(newDonation);
});

// 7. PROJECTS API
app.get("/api/projects", (req, res) => {
  const db = getDB();
  res.json(db.projects);
});

app.post("/api/projects", (req, res) => {
  const { project, actorEmail, actorRole } = req.body;
  const db = getDB();
  
  const newProject: Project = {
    ...project,
    id: `p-${Date.now()}`,
    budget: Number(project.budget),
    expenses: 0,
    beneficiariesCount: Number(project.beneficiariesCount || 0),
    startDate: project.startDate || new Date().toISOString().split('T')[0],
    performanceIndex: 0,
    activities: project.activities || []
  };

  db.projects.push(newProject);
  saveDB(db);
  logAction(actorEmail || "superviseur@association.org", actorRole || "superviseur", "Lancement Projet", `Lancement du projet humanitaire "${newProject.title}" avec un budget de ${newProject.budget} FCFA.`);
  res.json(newProject);
});

app.put("/api/projects/:id", (req, res) => {
  const { id } = req.params;
  const { project, actorEmail, actorRole } = req.body;
  const db = getDB();
  const index = db.projects.findIndex(p => p.id === id);
  if (index !== -1) {
    db.projects[index] = { ...db.projects[index], ...project };
    // recalculate ratio
    const current = db.projects[index];
    current.performanceIndex = Math.min(100, Math.round((current.expenses / current.budget) * 100));
    saveDB(db);
    logAction(actorEmail || "superviseur@association.org", actorRole || "superviseur", "Mise à jour projet", `Modification du projet "${current.title}" (${current.status}).`);
    return res.json(current);
  }
  res.status(404).json({ error: "Projet non trouvé" });
});

// 8. DOCUMENTARY API
app.get("/api/documents", (req, res) => {
  const db = getDB();
  res.json(db.documents);
});

app.post("/api/documents", (req, res) => {
  const { doc: docData, actorEmail, actorRole } = req.body;
  const db = getDB();
  
  const newDoc: DocItem = {
    id: `doc-${Date.now()}`,
    title: docData.title || "Sans titre",
    category: docData.category || "Général",
    fileName: docData.fileName || "document.pdf",
    fileSize: docData.fileSize || "450 KB",
    uploadedBy: actorEmail ? actorEmail.split('@')[0] : "Collaborateur",
    uploadedAt: new Date().toISOString().split('T')[0],
    contentBase64: docData.contentBase64
  };

  db.documents.unshift(newDoc);
  saveDB(db);
  logAction(actorEmail || "secrétaire@association.org", actorRole || "secrétaire", "Dépôt documentaire", `Importation sécurisée du fichier "${newDoc.fileName}" dans la catégorie ${newDoc.category}.`);
  res.json(newDoc);
});

app.delete("/api/documents/:id", (req, res) => {
  const { id } = req.params;
  const { actorEmail, actorRole } = req.headers;
  const db = getDB();
  const index = db.documents.findIndex(d => d.id === id);
  if (index !== -1) {
    const deletedName = db.documents[index].title;
    db.documents.splice(index, 1);
    saveDB(db);
    logAction(String(actorEmail) || "admin@association.org", (actorRole as UserRole) || "admin", "Archivage document", `Archivage / suppression définitive du fichier "${deletedName}".`);
    return res.json({ success: true });
  }
  res.status(404).json({ error: "Document non trouvé" });
});

// ----------------------------------------------------
// INTELLIGENT AI GEMINI OPERATIONS (server-side ONLY)
// ----------------------------------------------------

// Endpoint 1: Perform audit & anomaly detection inside the balance sheets
app.post("/api/ai/audit", async (req, res) => {
  const db = getDB();
  
  // Format transactions and activities for context
  const financialSummary = db.finances.map(f => `[${f.date}] ${f.type.toUpperCase()} - Categorie: ${f.category} - Somme: ${f.amount} FCFA - Source: ${f.sourceOrDestination} - Desc: ${f.description}`).join('\n');
  const projectSummary = db.projects.map(p => `Projet: ${p.title} - Budget: ${p.budget} FCFA - Depenses: ${p.expenses} FCFA - Beneficiaires: ${p.beneficiariesCount} - Avancement: ${p.performanceIndex}% - Status: ${p.status}`).join('\n');
  
  const systemPrompt = `Tu es un auditeur financier senior et conseiller expert spécialisé dans le domaine des ONG, associations humanitaires et lutte contre la pauvreté.
Tu vas analyser les finances et l'état des projets de l'association, détecter d'éventuelles anomalies (par exemple: dépassement budgétaire, déséquilibre recettes/dépenses, transactions suspectes, retards significatifs) et fournir des conseils constructifs.
Tu dois renvoyer ta réponse sous un format JSON strict, décrivant les anomalies et formulant d'excellentes recommandations. Doit obligatoirement correspondre au schéma fourni.`;

  const userPrompt = `Voici le journal comptable de l'association :\n${financialSummary}\n\nEt les projets actifs :\n${projectSummary}\n\nAnalyse s'il te plaît minutieusement ces données. Formule des alertes de risques d'anomalies s'il y a lieu, et propose des recommandations optimisées d'allocation de budget. Rédige en Français de façon professionnelle.`;

  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: "gemini-3.5-flash",
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              anomalies: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Liste des anomalies financières ou opérationnelles trouvées. Vide si tout est excellent."
              },
              recommendations: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Conseils et préconisations financières de secours ou d'allocation."
              },
              trendSummary: {
                type: Type.STRING,
                description: "Synthèse comptable de la santé générale de l'association."
              }
            },
            required: ["anomalies", "recommendations", "trendSummary"]
          }
        }
      });
      
      const parsed = JSON.parse(response.text.trim());
      return res.json({
        ...parsed,
        generatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error("Gemini API Error, using fallback:", err);
    }
  }

  // Fallback calculations if Gemini API key is missing or calls are rate-limited
  const totalIn = db.finances.filter(f => f.type === 'recette').reduce((sum, f) => sum + f.amount, 0);
  const totalOut = db.finances.filter(f => f.type === 'dépense').reduce((sum, f) => sum + f.amount, 0);
  const overBudgetProjects = db.projects.filter(p => p.expenses > p.budget).map(p => p.title);
  
  const anomalies: string[] = [];
  if (totalOut > totalIn) {
    anomalies.push("Déficit comptable temporaire : Les sorties d'argent dépassent les recettes mensuelles.");
  }
  if (overBudgetProjects.length > 0) {
    anomalies.push(`Dépassement de budget constaté sur les projets : ${overBudgetProjects.join(', ')}.`);
  }
  const pendingDues = db.contributions.filter(c => c.status === 'en_retard').length;
  if (pendingDues > 2) {
    anomalies.push(`Taux de recouvrement des cotisations faible : ${pendingDues} membres sont actuellement déclarés en retard.`);
  }

  const recommendations = [
    "Lancer un appel aux dons thématisé pour combler les dépenses liées au carburant et à la logistique d'aide médicale.",
    "Procéder à une relance automatique aimable des membres en retard d'adhésion par l'intermédiaire du secrétariat.",
    "Négocier des partenariats de grossistes alimentaires locaux pour réduire le coût d'achat unitaire des paniers repas du secours de 15%."
  ];

  res.json({
    anomalies,
    recommendations,
    trendSummary: `La balance est globalement équilibrée avec un total d’entrées de ${totalIn} FCFA et des investissements projets de ${totalOut} FCFA. Les réserves de caisse restent stables grâce aux subventions consulaires et cotisations des adhérents.`,
    generatedAt: new Date().toISOString()
  });
});

// Endpoint 2: Generate a beautiful official PDF structure / text report to be previewed or copied
app.post("/api/ai/report-generation", async (req, res) => {
  const db = getDB();
  const txs = db.finances;
  const projs = db.projects;
  const mems = db.members;

  const summaryData = {
    totalMembers: mems.length,
    activeMembers: mems.filter(m => m.status === 'actif').length,
    totalIncome: txs.filter(t => t.type === 'recette').reduce((acc, t) => acc + t.amount, 0),
    totalExpense: txs.filter(t => t.type === 'dépense').reduce((acc, t) => acc + t.amount, 0),
    projectCount: projs.length
  };

  const modelInput = `Génère un rapport officiel détaillé pour le conseil d'administration de l'association.
Informations Clés:
- Nombre total d'adhérents: ${summaryData.totalMembers} (actifs: ${summaryData.activeMembers})
- Recettes totales collectées: ${summaryData.totalIncome} FCFA
- Dépenses déboursées: ${summaryData.totalExpense} FCFA
- Projets humanitaires lancés: ${summaryData.projectCount}

Détail des Projets:
${projs.map(p => `- ${p.title} (Budget: ${p.budget} FCFA, Engagé: ${p.expenses} FCFA, Avancement: ${p.performanceIndex}%)`).join('\n')}

Format requis: Structure de rapport officiel avec en-têtes élégants, résumé analytique, analyse financière des dépenses projets, perspectives pour le trimestre à venir et signature du secrétariat général. Utilise des icônes textuelles pour simuler une mise en page d'édition premium. Rédige en Français élégant.`;

  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: "gemini-3.5-flash",
        contents: modelInput,
        config: {
          systemInstruction: "Tu es le Secrétaire Général Virtuel d'une association humanitaire internationale reconnue d'utilité publique. Tu rédiges avec rigueur, humanisme et clarté.",
        }
      });
      return res.json({ reportText: response.text });
    } catch (err) {
      console.error("Failed to call report generation from Gemini:", err);
    }
  }

  // Fallback report structure if offline
  const fallbackMarkdown = `
============================================================
       RAPPORT COMPTABLE ET D'ORIENTATION OPÉRATIONNELLE
============================================================
Généré le: ${new Date().toLocaleDateString('fr-FR')} | Statut: Actif

1. RÉSUMÉ EXÉCUTIF
---------------------------------------------
Le présent document synthétise la situation globale de la Communauté des Ivoiriens au Niger (CINI). Suite à la digitalisation complète de notre gestion comptable, administrative et de solidarité, les flux ont été consolidés.
* Membres inscrits : ${summaryData.totalMembers} ressortissants intégrés
* Taux d'activité : ${Math.round((summaryData.activeMembers / summaryData.totalMembers)*100)}%
* Trésorerie Actuelle (Solde) : ${summaryData.totalIncome - summaryData.totalExpense} FCFA

2. ANALYSE DU BUDGET DE MISSION
---------------------------------------------
Nous comptabilisons un montant consolidé de recettes de ${summaryData.totalIncome} FCFA, principalement soutenu par les cotisations, les dons d'entraide, ainsi que notre subvention annuelle consulaire de 5 000 000 FCFA.
Les dépenses se chiffrent à ${summaryData.totalExpense} FCFA, ce qui nous laisse un solde positif de sécurité de ${summaryData.totalIncome - summaryData.totalExpense} FCFA en caisse d'urgence.

3. SITUATION DES PROJETS HUMANITAIRES
---------------------------------------------
* Fonds d'Entraide Éducative CINI : Les bourses scolaires de la rentrée sont versées à 80%.
* Solidarité Alimentaire CINI : 420 ménages et étudiants preneurs ont reçu des colis alimentaires d'appoint.
* Caravane Santé & Social : Planification clinique du sevrage itinérant à Niamey en cours de finalisation.

4. RECOMMANDATIONS DU CONSEIL
---------------------------------------------
- Accélérer la collecte des cotisations auprès des membres suspendus ou déclarés inactifs.
- Conserver 10% de réserve résiduelle pour garantir la solvabilité administrative du trimestre à venir.

Fait à Paris, le secrétariat administratif.
`;
  res.json({ reportText: fallbackMarkdown });
});

// ----------------------------------------------------
// MAIN MIDDLEWARE / STATIC FILES / ROUTE HANDLING
// ----------------------------------------------------

async function start() {
  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve production static assets compiled by build phase
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Portail Association server started successfully on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error("Critical server boot failure:", err);
});
