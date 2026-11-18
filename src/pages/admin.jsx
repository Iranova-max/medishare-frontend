import { useEffect, useState } from "react";
import Layout from "../components/layout";
import PageNotifications from "./notifiacations";
import { D, ROLE_COLOR } from "../constants/design";
import Icon from "../components/icons";
import { Btn, Grid2, Grid4, StatCard, Card, Badge, StatusBadge, Input, Select, Modal, Th, Td, EmptyState } from "../components/UI";
import { api, normalizeUsers, routes } from "../services/api";

const Admin = ({ user, onLogout }) => {
  const [page, setPage] = useState("comptes");
  const [adminProfile, setAdminProfile] = useState(user);
  const [comptes, setComptes] = useState([]);
  const [comptesError, setComptesError] = useState("");
  const [comptesLoading, setComptesLoading] = useState(true);
  const [auditEntries, setAuditEntries] = useState([]);
  const [auditError, setAuditError] = useState("");
  const [auditLoading, setAuditLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [formProf, setFormProf] = useState({ nom:"", email:"", role:"medecin", password:"" });
  const col = ROLE_COLOR.admin;
  const nav = [
    { id:"comptes", label:"Comptes professionnels", icon:"users" },
    { id:"audit",   label:"Journal d'audit",        icon:"audit" },
    { id:"notifications", label:"Notifications",    icon:"bell" },
  ];
  useEffect(() => {
    let cancelled = false;

    api.get("/auth/me")
      .then((profileResponse) => {
        const profile = profileResponse?.user;
        if (!profile?.id) {
          throw new Error("Impossible d’identifier le compte administrateur connecté.");
        }
        if (cancelled) return null;
        setAdminProfile(previous => ({ ...previous, ...profile }));
        return api.get(routes.users).then(response => ({ profile, response }));
      })
      .then((result) => {
        if (!result) return;
        if (!cancelled) {
          setComptes(normalizeUsers(result.response).filter((account) =>
            Number(account.etablissement_id) === Number(result.profile.etablissement_id)
          ));
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setComptesError(error instanceof Error ? error.message : "Impossible de charger les comptes professionnels.");
        }
      })
      .finally(() => {
        if (!cancelled) setComptesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const etablissementNom = adminProfile?.etablissement?.nom || adminProfile?.etab || "votre établissement";

  useEffect(() => {
    if (page !== "audit") return undefined;
    let cancelled = false;
    setAuditLoading(true);
    api.get(routes.audit)
      .then(response => {
        if (!cancelled) {
          const entries = response?.audit ?? response?.data?.audit;
          if (!Array.isArray(entries)) throw new Error("La réponse de l’API ne contient pas le journal d’audit.");
          setAuditEntries(entries);
          setAuditError("");
        }
      })
      .catch(error => {
        if (!cancelled) setAuditError(error instanceof Error ? error.message : "Impossible de charger le journal d’audit.");
      })
      .finally(() => {
        if (!cancelled) setAuditLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page]);

  return (
    <Layout role="admin" user={user} nav={nav} page={page} setPage={setPage} onLogout={onLogout}>
      {page==="comptes" && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
            <div><h2 style={{ margin:0, fontSize:20, fontWeight:800, color:D.slate }}>Comptes professionnels</h2><p style={{ margin:"4px 0 0", fontSize:13, color:D.mid }}>{etablissementNom} — {comptes.length} professionnels</p></div>
            <Btn color={col.a} onClick={()=>{setEditingAccount(null);setFormProf({ nom:"", email:"", role:"medecin", password:"" });setFormError("");setShowForm(true);}}><Icon name="plus" /> Nouveau professionnel</Btn>
          </div>
          {comptesError && <p role="alert" style={{ color:D.red, margin:"0 0 12px" }}>Impossible de synchroniser les comptes avec le serveur : {comptesError}</p>}
          {comptesLoading && <p role="status" style={{ color:D.mid }}>Chargement des professionnels…</p>}
          <Grid4>
            <StatCard icon={<Icon name="doctor" size={22} />} value={comptes.filter(c=>c.role==="medecin").length} label="Médecins" color={D.teal} />
            <StatCard icon={<Icon name="nurse" size={22} />} value={comptes.filter(c=>c.role==="infirmier").length} label="Infirmiers" color={D.amber} />
            <StatCard icon={<Icon name="check" size={22} />} value={comptes.filter(c=>c.statut==="actif").length} label="Actifs" color={D.green} />
            <StatCard icon={<Icon name="close" size={22} />} value={comptes.filter(c=>c.statut==="inactif").length} label="Inactifs" color={D.red} />
          </Grid4>
          {!comptesLoading && !comptesError && comptes.length===0
            ? <Card><EmptyState icon="users" text="Aucun professionnel enregistré dans cet établissement." action="Créer un compte" onAction={()=>{setEditingAccount(null);setFormError("");setShowForm(true);}} /></Card>
            : <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            {comptes.map(c=>(
              <Card key={c.id} style={{ marginBottom:0 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
                  <div style={{ width:44, height:44, borderRadius:"50%", background:D.skySoft, display:"flex", alignItems:"center", justifyContent:"center" }}><Icon name={c.role==="medecin"?"doctor":"nurse"} size={22} /></div>
                  <StatusBadge s={c.statut} />
                </div>
                <div style={{ fontSize:14, fontWeight:800, color:D.slate }}>{c.nom}</div>
                <div style={{ fontSize:12, color:D.mid, marginTop:2, marginBottom:12, display:"flex", gap:5, alignItems:"center" }}><Icon name="mail" size={14} /> {c.email}</div>
                <Badge label={c.role} color={c.role==="medecin"?D.teal:D.amber} bg={c.role==="medecin"?D.tealL:D.amberL} />
                <div style={{ display:"flex", gap:8, marginTop:14 }}>
                  <Btn sm color={col.a} onClick={()=>{setEditingAccount(c);setFormProf({ nom:c.nom, email:c.email, role:c.role, password:"" });setFormError("");setShowForm(true);}}><Icon name="edit" /> Modifier</Btn>
                  <Btn sm disabled={statusUpdatingId===c.id} variant={c.statut==="actif"?"danger":"success"} onClick={async ()=>{
                    const statut = c.statut==="actif" ? "inactif" : "actif";
                    setStatusUpdatingId(c.id);
                    setComptesError("");
                    try {
                      const response = await api.put(`/utilisateurs/${c.id}`, { statut });
                      const updated = normalizeUsers({ users:[response?.user] })[0];
                      if (!updated?.id) throw new Error("Le serveur n’a pas retourné le compte modifié.");
                      setComptes(current => current.map(account => account.id === updated.id ? updated : account));
                    } catch (error) {
                      setComptesError(error instanceof Error ? error.message : "Impossible de modifier le statut du compte.");
                    } finally {
                      setStatusUpdatingId(null);
                    }
                  }}>{statusUpdatingId===c.id ? "Mise à jour…" : c.statut==="actif"?<><Icon name="lock" /> Suspendre</>:<><Icon name="check" /> Réactiver</>}</Btn>
                </div>
              </Card>
            ))}
          </div>}
          <Modal open={showForm} onClose={()=>{if (!saving) {setShowForm(false);setEditingAccount(null);}}} title={editingAccount ? "Modifier un professionnel" : "Créer un compte professionnel"} accent={col.a}>
            <Grid2>
              <Input label="Nom complet" value={formProf.nom} onChange={e=>setFormProf({...formProf, nom:e.target.value})} />
              <Input label="Email" type="email" placeholder="nom@etablissement.bj" value={formProf.email} onChange={e=>setFormProf({...formProf, email:e.target.value})} />
              <Select label="Rôle" value={formProf.role} options={[{v:"medecin",l:"Médecin"},{v:"infirmier",l:"Infirmier"}]} onChange={e=>setFormProf({...formProf, role:e.target.value})} />
              <Input label={editingAccount ? "Nouveau mot de passe (facultatif)" : "Mot de passe"} type="password" value={formProf.password} onChange={e=>setFormProf({...formProf, password:e.target.value})} />
            </Grid2>
            {formError && <p role="alert" style={{ color:D.red, margin:"0 0 14px" }}>{formError}</p>}
            <div style={{ display:"flex", gap:10 }}>
              <Btn color={col.a} onClick={async ()=>{
                if (!formProf.nom.trim() || !formProf.email.trim() || (!editingAccount && !formProf.password)) {
                  setFormError("Le nom, l’email et le mot de passe sont obligatoires pour créer un compte.");
                  return;
                }
                if (!adminProfile?.etablissement_id) {
                  setFormError("Votre compte administrateur n’est associé à aucun établissement. Contactez le super administrateur.");
                  return;
                }
                setSaving(true);
                setFormError("");
                try {
                  const accountPayload = {
                    name: formProf.nom.trim(),
                    email: formProf.email,
                    role: formProf.role,
                    ...(formProf.password ? { password: formProf.password } : {}),
                  };
                  const response = editingAccount
                    ? await api.put(`/utilisateurs/${editingAccount.id}`, accountPayload)
                    : await api.post("/users/create", {
                        ...accountPayload,
                        etablissement_id: adminProfile.etablissement_id,
                        statut: "actif",
                      });
                  const created = normalizeUsers({ users: [response?.user] })[0];
                  if (!created?.id || Number(created.etablissement_id) !== Number(adminProfile.etablissement_id)) {
                    throw new Error("Le serveur n’a pas retourné le compte enregistré pour votre établissement.");
                  }
                  setComptes(prev => [created, ...prev.filter(account => account.id !== created.id)]);
                  setFormProf({ nom:"", email:"", role:"medecin", password:"" });
                  setShowForm(false);
                  setEditingAccount(null);
                } catch (error) {
                  setFormError(error instanceof Error ? error.message : "Erreur lors de la création du compte.");
                } finally {
                  setSaving(false);
                }
              }} disabled={saving}>{saving ? editingAccount ? "Mise à jour…" : "Création…" : editingAccount ? "Enregistrer les modifications" : <><Icon name="check" /> Créer</>}</Btn>
              <Btn variant="ghost" disabled={saving} onClick={()=>{setShowForm(false);setEditingAccount(null);}}>Annuler</Btn>
            </div>
          </Modal>
        </div>
      )}
      {page==="audit" && (
        <div>
          <h2 style={{ margin:"0 0 6px", fontSize:20, fontWeight:800, color:D.slate }}>Journal d'audit</h2>
          <p style={{ margin:"0 0 16px", fontSize:13, color:D.mid }}>{etablissementNom}</p>
          {auditError && <p role="alert" style={{ color:D.red }}>{auditError}</p>}
          {auditLoading && <p role="status" style={{ color:D.mid }}>Chargement du journal d’audit…</p>}
          <Card>
            {!auditLoading && !auditError && auditEntries.length===0
              ? <EmptyState icon="audit" text="Aucune action enregistrée." />
              : <div style={{ overflowX:"auto" }}>
                  <table style={{ width:"100%", borderCollapse:"collapse" }}>
                    <thead><tr>{["Date & heure","Action","Utilisateur","Élément","IP"].map(c=><Th key={c} c={c} />)}</tr></thead>
                    <tbody>{auditEntries.map(log=>(
                      <tr key={log.id}>
                        <Td><span style={{ fontFamily:"monospace", fontSize:12 }}>{log.created_at ? new Intl.DateTimeFormat("fr-FR", { dateStyle:"short", timeStyle:"short" }).format(new Date(log.created_at)) : "—"}</span></Td>
                        <Td><Badge label={log.action} color={D.teal} bg={D.tealL} /></Td>
                        <Td>{log.user_name || "Compte supprimé"}</Td>
                        <Td>{log.entity_type} #{log.entity_id || "—"}</Td>
                        <Td><span style={{ fontFamily:"monospace", fontSize:11, color:D.subtle }}>{log.ip_address || "—"}</span></Td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>}
          </Card>
        </div>
      )}
      {page==="notifications" && <PageNotifications accent={col.a} />}
    </Layout>
  );
};

export default Admin;