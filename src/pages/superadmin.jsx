import { useEffect, useState } from "react";
import Layout from "../components/layout";
import PageNotifications from "./notifiacations";
import { D, ROLE_COLOR } from "../constants/design";
import Icon from "../components/icons";
import { Btn, Grid2, Grid4, StatCard, Card, Badge, StatusBadge, Input, Select, Modal, Th, Td } from "../components/UI";
import { api, normalizeEtablissements, normalizeUsers, routes } from "../services/api";

const auditActionLabels = {
  created: "Création",
  updated: "Modification",
  deleted: "Suppression",
  access_request_created: "Demande d’accès envoyée",
  access_request_approved: "Demande d’accès acceptée",
  access_request_rejected: "Demande d’accès refusée",
  access_revoked: "Accès révoqué",
  patient_record_read: "Consultation d’un patient",
  medical_record_read: "Lecture d’un dossier médical",
};

const auditEntityLabels = {
  User: "Utilisateur",
  Etablissement: "Établissement",
  Patient: "Patient",
  DossierMedical: "Dossier médical",
  DemandeAcces: "Demande d’accès",
  Consultation: "Consultation",
  Notification: "Notification",
};

const AuditJournal = () => {
  const [entries, setEntries] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [action, setAction] = useState("Toutes les actions");
  const [entity, setEntity] = useState("Toutes les catégories");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    api.get(routes.audit, {
      page,
      action: action === "Toutes les actions" ? "" : action,
      entity: entity === "Toutes les catégories" ? "" : entity,
    })
      .then((response) => {
        if (cancelled) return;
        setEntries(Array.isArray(response?.audit) ? response.audit : []);
        setPagination(response?.pagination ?? { current_page: 1, last_page: 1, total: 0 });
      })
      .catch((requestError) => {
        if (!cancelled) {
          setError(requestError instanceof Error ? requestError.message : "Impossible de charger le journal d’audit.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, action, entity, reloadCount]);

  const formatDate = (value) => {
    if (!value) return "Date inconnue";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? "Date inconnue"
      : new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(date);
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:16, marginBottom:20 }}>
        <div>
          <h2 style={{ margin:0, fontSize:20, fontWeight:800, color:D.slate }}>Journal d’audit</h2>
          <p style={{ margin:"4px 0 0", fontSize:13, color:D.mid }}>Suivi des actions réalisées sur la plateforme · {pagination.total} événements</p>
        </div>
        <Btn variant="ghost" onClick={() => {
          setLoading(true);
          setError("");
          setReloadCount(count => count + 1);
        }}><Icon name="refresh" /> Actualiser</Btn>
      </div>

      <Card>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:14, marginBottom:16 }}>
          <Select
            label="Action"
            value={action}
            options={["Toutes les actions", ...Object.entries(auditActionLabels).map(([value, label]) => ({ v:value, l:label }))]}
            onChange={(event) => {
              setLoading(true);
              setError("");
              setAction(event.target.value);
              setPage(1);
            }}
          />
          <Select
            label="Catégorie"
            value={entity}
            options={["Toutes les catégories", ...Object.entries(auditEntityLabels).map(([value, label]) => ({ v:value, l:label }))]}
            onChange={(event) => {
              setLoading(true);
              setError("");
              setEntity(event.target.value);
              setPage(1);
            }}
          />
        </div>

        {error && <p role="alert" style={{ color:D.red, margin:"0 0 14px" }}>Impossible de charger le journal : {error}</p>}
        {loading && <p role="status" style={{ color:D.mid }}>Chargement du journal d’audit…</p>}
        {!loading && !error && entries.length === 0 && (
          <p style={{ textAlign:"center", color:D.mid, padding:24, margin:0 }}>Aucune action enregistrée pour ces filtres.</p>
        )}
        {!loading && entries.length > 0 && (
          <>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr>{["Date et heure","Acteur","Action","Élément concerné","Adresse IP"].map(label=><Th key={label} c={label} />)}</tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id}>
                      <Td><span style={{ whiteSpace:"nowrap" }}>{formatDate(entry.created_at)}</span></Td>
                      <Td>
                        <div style={{ fontWeight:700 }}>{entry.user_name || "Compte supprimé"}</div>
                        <div style={{ color:D.mid, fontSize:11 }}>{entry.user_email} · {entry.user_role}</div>
                      </Td>
                      <Td>
                        <Badge
                          label={auditActionLabels[entry.action] || entry.action}
                          color={entry.action === "access_request_rejected" ? D.red : entry.action.includes("read") ? D.purple : D.teal}
                          bg={entry.action === "access_request_rejected" ? D.redL : entry.action.includes("read") ? D.purpleL : D.tealL}
                        />
                      </Td>
                      <Td>
                        <div style={{ fontWeight:700 }}>{auditEntityLabels[entry.entity_type] || entry.entity_type}</div>
                        <div style={{ color:D.mid, fontSize:11 }}>Référence #{entry.entity_id || "—"}</div>
                      </Td>
                      <Td>{entry.ip_address || "—"}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:12, marginTop:16 }}>
              <span style={{ color:D.mid, fontSize:12 }}>Page {pagination.current_page} sur {pagination.last_page}</span>
              <div style={{ display:"flex", gap:8 }}>
                <Btn sm variant="ghost" disabled={page <= 1 || loading} onClick={() => {
                  setLoading(true);
                  setPage(current => Math.max(1, current - 1));
                }}>Précédent</Btn>
                <Btn sm variant="ghost" disabled={page >= pagination.last_page || loading} onClick={() => {
                  setLoading(true);
                  setPage(current => Math.min(pagination.last_page, current + 1));
                }}>Suivant</Btn>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

const SuperAdmin = ({ user, onLogout }) => {
  const [page, setPage] = useState("etablissements");
  const [etabs, setEtabs] = useState([]);
  const [etabsError, setEtabsError] = useState("");
  const [etabsLoading, setEtabsLoading] = useState(true);
  const [etabStatusUpdatingId, setEtabStatusUpdatingId] = useState(null);
  const [users, setUsers] = useState([]);
  const [usersError, setUsersError] = useState("");
  const [usersLoading, setUsersLoading] = useState(true);
  const [showEtab, setShowEtab] = useState(false);
  const [editingEtab, setEditingEtab] = useState(null);
  const [etabFormError, setEtabFormError] = useState("");
  const [savingEtab, setSavingEtab] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name:"", email:"", role:"medecin", etablissement_id:"", statut:"actif", password:"" });
  const [formEtab, setFormEtab] = useState({ nom:"", type:"", adresse:"", telephone:"", email:"", statut:"actif" });
  const [formUser, setFormUser] = useState({ nom:"", prenom:"", email:"", role:"medecin", etablissement:"", password:"" });
  const col = ROLE_COLOR.super_admin;
  const nav = [
    { id:"etablissements", label:"Établissements",  icon:"hospital" },
    { id:"utilisateurs",   label:"Comptes",          icon:"users" },
    { id:"audit",          label:"Journal d’audit",  icon:"audit" },
    { id:"notifications",  label:"Notifications",    icon:"bell" },
  ];
  useEffect(() => {
    let cancelled = false;

    api.get(routes.etablissements)
      .then((response) => {
        if (!cancelled) setEtabs(normalizeEtablissements(response));
      })
      .catch((error) => {
        if (!cancelled) {
          setEtabsError(error instanceof Error ? error.message : "Impossible de charger les établissements.");
        }
      })
      .finally(() => {
        if (!cancelled) setEtabsLoading(false);
      });

    api.get(routes.users)
      .then((response) => {
        if (!cancelled) setUsers(normalizeUsers(response));
      })
      .catch((error) => {
        if (!cancelled) {
          setUsersError(error instanceof Error ? error.message : "Impossible de charger les utilisateurs.");
        }
      })
      .finally(() => {
        if (!cancelled) setUsersLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const closeEtabForm = () => {
    setShowEtab(false);
    setEditingEtab(null);
    setEtabFormError("");
  };

  const handleSaveEtab = async () => {
    if (!formEtab.nom.trim() || !formEtab.adresse.trim() || !formEtab.email.trim()) {
      setEtabFormError("Remplissez le nom, l’adresse et l’email de l’établissement.");
      return;
    }

    setSavingEtab(true);
    setEtabFormError("");
    try {
      const response = editingEtab
        ? await api.put(`${routes.etablissements}/${editingEtab.id}`, formEtab)
        : await api.post(routes.etablissements, {
            nom: formEtab.nom,
            type: formEtab.type || null,
            adresse: formEtab.adresse,
            telephone: formEtab.telephone,
            email: formEtab.email,
            statut: "actif",
          });
      const savedEtablissement = response?.etablissement ?? response?.data?.etablissement ?? response?.data ?? response;

      if (!savedEtablissement?.id) {
        throw new Error("Le serveur n’a pas retourné l’établissement enregistré.");
      }

      if (editingEtab) {
        setEtabs(prev => prev.map(etablissement => etablissement.id === savedEtablissement.id ? savedEtablissement : etablissement));
      } else {
        setEtabs(prev => [savedEtablissement, ...prev]);
      }
      setFormEtab({ nom:"", type:"", adresse:"", telephone:"", email:"", statut:"actif" });
      closeEtabForm();
    } catch (error) {
      setEtabFormError(error instanceof Error ? error.message : "Erreur lors de l’enregistrement de l’établissement.");
    } finally {
      setSavingEtab(false);
    }
  };

  return (
    <Layout role="super_admin" user={user} nav={nav} page={page} setPage={setPage} onLogout={onLogout}>
      {page==="etablissements" && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
            <div><h2 style={{ margin:0, fontSize:20, fontWeight:800, color:D.slate }}>Établissements de santé</h2><p style={{ margin:"4px 0 0", fontSize:13, color:D.mid }}>{etabs.length} établissements enregistrés</p></div>
            <Btn color={col.a} onClick={()=>{
              setEditingEtab(null);
              setFormEtab({ nom:"", type:"", adresse:"", telephone:"", email:"", statut:"actif" });
              setEtabFormError("");
              setShowEtab(true);
            }}><Icon name="plus" /> Nouvel établissement</Btn>
          </div>
          {etabsError && <p role="alert" style={{ color:D.red, margin:"0 0 12px" }}>Impossible de synchroniser les établissements avec le serveur : {etabsError}</p>}
          {etabsLoading && <p role="status" style={{ color:D.mid }}>Chargement des établissements…</p>}
          <Grid4>
            <StatCard icon={<Icon name="hospital" size={22} />} value={etabs.length} label="Total" color={col.a} />
            <StatCard icon={<Icon name="check" size={22} />} value={etabs.filter(e=>e.statut==="actif").length} label="Actifs" color={D.green} />
            <StatCard icon={<Icon name="close" size={22} />} value={etabs.filter(e=>e.statut==="inactif").length} label="Inactifs" color={D.red} />
            <StatCard icon={<Icon name="users" size={22} />} value={users.length} label="Utilisateurs" color={D.purple} />
          </Grid4>
          {!etabsLoading && !etabsError && etabs.length===0
            ? <Card><p style={{ textAlign:"center", color:D.mid }}>Aucun établissement enregistré.</p></Card>
            : <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            {etabs.map(e=>(
              <Card key={e.id} style={{ marginBottom:0 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
                  <div style={{ width:42, height:42, borderRadius:10, background:D.skySoft, display:"flex", alignItems:"center", justifyContent:"center" }}><Icon name="hospital" size={22} /></div>
                  <StatusBadge s={e.statut} />
                </div>
                <div style={{ fontSize:15, fontWeight:800, color:D.slate, marginBottom:4 }}>{e.nom}</div>
                <div style={{ fontSize:12, color:D.mid, marginBottom:2, display:"flex", alignItems:"center", gap:5 }}><Icon name="tag" size={14} /> {e.type}</div>
                <div style={{ fontSize:12, color:D.mid, marginBottom:2, display:"flex", alignItems:"center", gap:5 }}><Icon name="pin" size={14} /> {e.adresse}</div>
                <div style={{ fontSize:12, color:D.mid, marginBottom:16, display:"flex", alignItems:"center", gap:5 }}><Icon name="mail" size={14} /> {e.email}</div>
                <div style={{ display:"flex", gap:8 }}>
                  <Btn sm color={col.a} onClick={()=>{
                    setFormEtab({
                      nom:e.nom ?? "",
                      type:e.type ?? "",
                      adresse:e.adresse ?? "",
                      telephone:e.telephone ?? "",
                      email:e.email ?? "",
                      statut:e.statut ?? "actif",
                    });
                    setEtabFormError("");
                    setEditingEtab(e);
                    setShowEtab(false);
                  }}><Icon name="edit" /> Modifier</Btn>
                  <Btn sm disabled={etabStatusUpdatingId===e.id} variant={e.statut==="actif"?"danger":"success"} onClick={async ()=>{
                    const statut = e.statut==="actif" ? "inactif" : "actif";
                    setEtabStatusUpdatingId(e.id);
                    setEtabsError("");
                    try {
                      const response = await api.put(`${routes.etablissements}/${e.id}/statut`, { statut });
                      const updated = response?.etablissement ?? response?.data?.etablissement;
                      if (!updated?.id) throw new Error("Le serveur n’a pas retourné l’établissement modifié.");
                      setEtabs(previous => previous.map(item => item.id === updated.id ? updated : item));
                    } catch (error) {
                      setEtabsError(error instanceof Error ? error.message : "Impossible de modifier le statut de l’établissement.");
                    } finally {
                      setEtabStatusUpdatingId(null);
                    }
                  }}>{etabStatusUpdatingId===e.id ? "Mise à jour…" : e.statut==="actif"?<><Icon name="lock" /> Désactiver</>:<><Icon name="check" /> Activer</>}</Btn>
                </div>
              </Card>
            ))}
          </div>}
          <Modal open={showEtab || Boolean(editingEtab)} onClose={closeEtabForm} title={editingEtab ? "Modifier un établissement" : "Enregistrer un établissement"} accent={col.a}>
            <Grid2>
              <Input label="Nom de l'établissement" placeholder="Ex: Hôpital de Zone" value={formEtab.nom} onChange={e=>setFormEtab({...formEtab, nom:e.target.value})} />
              <Select label="Type" value={formEtab.type} options={[{v:"",l:"Sélectionner un type"}, "Hôpital public","Clinique privée","CHU","Polyclinique","Centre de santé","Dispensaire"]} onChange={e=>setFormEtab({...formEtab, type:e.target.value})} />
              <Input label="Adresse" placeholder="Quartier, Ville" value={formEtab.adresse} onChange={e=>setFormEtab({...formEtab, adresse:e.target.value})} />
              <Input label="Téléphone" placeholder="21000000" value={formEtab.telephone} onChange={e=>setFormEtab({...formEtab, telephone:e.target.value})} />
            </Grid2>
            <Input label="Email professionnel" type="email" placeholder="contact@etab.bj" value={formEtab.email} onChange={e=>setFormEtab({...formEtab, email:e.target.value})} />
            {editingEtab && (
              <Select label="Statut" value={formEtab.statut} options={[{v:"actif",l:"Actif"},{v:"inactif",l:"Inactif"}]} onChange={e=>setFormEtab({...formEtab, statut:e.target.value})} />
            )}
            {etabFormError && <p role="alert" style={{ color:D.red, margin:"0 0 14px" }}>{etabFormError}</p>}
            <div style={{ display:"flex", gap:10 }}>
              <Btn color={col.a} disabled={savingEtab} onClick={handleSaveEtab}>{savingEtab ? "Enregistrement…" : <><Icon name="check" /> {editingEtab ? "Enregistrer les modifications" : "Enregistrer"}</>}</Btn>
              <Btn variant="ghost" disabled={savingEtab} onClick={closeEtabForm}>Annuler</Btn>
            </div>
          </Modal>
        </div>
      )}
      {page==="utilisateurs" && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
            <div><h2 style={{ margin:0, fontSize:20, fontWeight:800, color:D.slate }}>Comptes utilisateurs</h2><p style={{ margin:"4px 0 0", fontSize:13, color:D.mid }}>{users.length} comptes enregistrés</p></div>
            <Btn color={col.a} onClick={()=>setShowUser(true)}><Icon name="plus" /> Nouveau compte</Btn>
          </div>
          <Card>
            {usersError && <p role="alert" style={{ color:D.red, margin:"0 0 12px" }}>Impossible de synchroniser les comptes avec le serveur : {usersError}</p>}
            {usersLoading && <p role="status" style={{ color:D.mid }}>Chargement des comptes…</p>}
            {!usersLoading && !usersError && users.length===0 && <p style={{ textAlign:"center", color:D.mid, padding:20 }}>Aucun compte utilisateur enregistré.</p>}
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead><tr>{["Nom","Email","Rôle","Établissement","Statut","Actions"].map(c=><Th key={c} c={c} />)}</tr></thead>
              <tbody>
                {users.map(u=>(
                  <tr key={u.id}>
                    <Td><div style={{ fontWeight:700 }}>{u.nom}</div></Td>
                    <Td>{u.email}</Td>
                    <Td><Badge label={u.role} color={u.role==="medecin"?D.teal:u.role==="admin"?D.green:D.amber} bg={u.role==="medecin"?D.tealL:u.role==="admin"?D.greenL:D.amberL} /></Td>
                    <Td><span style={{ fontSize:12 }}>{u.etab || "Non renseigné"}</span></Td>
                    <Td><StatusBadge s={u.statut} /></Td>
                    <Td>
                      <div style={{ display:"flex", gap:6 }}>
                        <Btn sm color={col.a} onClick={() => {
                          setEditingUser(u);
                          setEditForm({
                            name: u.nom,
                            email: u.email,
                            role: u.role,
                            etablissement_id: u.etablissement_id ? String(u.etablissement_id) : "",
                            statut: u.statut,
                            password: "",
                          });
                        }}><Icon name="edit" /></Btn>
                        <Btn sm variant={u.statut==="actif"?"danger":"success"} onClick={async ()=>{
                          const statut = u.statut==="actif" ? "inactif" : "actif";
                          try {
                            const response = await api.put(`/utilisateurs/${u.id}`, { statut });
                            const updatedUser = normalizeUsers({ users: [response.user] })[0];
                            setUsers(current => current.map(account => account.id === updatedUser.id ? updatedUser : account));
                          } catch (error) {
                            alert(error instanceof Error ? error.message : "Erreur lors de la mise à jour du statut.");
                          }
                        }}>{u.statut==="actif"?<Icon name="lock" />:<Icon name="check" />}</Btn>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <Modal open={Boolean(editingUser)} onClose={() => setEditingUser(null)} title="Modifier le compte utilisateur" accent={col.a}>
            <Grid2>
              <Input label="Nom complet" value={editForm.name} onChange={e=>setEditForm({...editForm,name:e.target.value})} />
              <Input label="Email" type="email" value={editForm.email} onChange={e=>setEditForm({...editForm,email:e.target.value})} />
              <Select label="Rôle" value={editForm.role} options={["super_admin","admin","medecin","infirmier"]} onChange={e=>setEditForm({...editForm,role:e.target.value})} />
              <Select
                label="Établissement"
                value={editForm.etablissement_id}
                options={[{v:"",l:"Aucun établissement"}, ...etabs.map(e=>({v:String(e.id),l:e.nom}))]}
                onChange={e=>setEditForm({...editForm,etablissement_id:e.target.value})}
              />
              <Select label="Statut" value={editForm.statut} options={[{v:"actif",l:"Actif"},{v:"inactif",l:"Inactif"}]} onChange={e=>setEditForm({...editForm,statut:e.target.value})} />
              <Input label="Nouveau mot de passe (facultatif)" type="password" placeholder="Laisser vide pour conserver l’actuel" value={editForm.password} onChange={e=>setEditForm({...editForm,password:e.target.value})} />
            </Grid2>
            <div style={{ display:"flex", gap:10 }}>
              <Btn color={col.a} onClick={async () => {
                try {
                  const response = await api.put(`/utilisateurs/${editingUser.id}`, {
                    name: editForm.name,
                    email: editForm.email,
                    role: editForm.role,
                    etablissement_id: editForm.etablissement_id ? Number(editForm.etablissement_id) : null,
                    statut: editForm.statut,
                    ...(editForm.password ? { password: editForm.password } : {}),
                  });
                  const updatedUser = normalizeUsers({ users: [response.user] })[0];
                  setUsers(current => current.map(account => account.id === updatedUser.id ? updatedUser : account));
                  setEditingUser(null);
                } catch (error) {
                  alert(error instanceof Error ? error.message : "Erreur lors de la mise à jour du compte.");
                }
              }}>Enregistrer les modifications</Btn>
              <Btn variant="ghost" onClick={()=>setEditingUser(null)}>Annuler</Btn>
            </div>
          </Modal>
          <Modal open={showUser} onClose={()=>setShowUser(false)} title="Créer un compte utilisateur" accent={col.a}>
            <Grid2>
              <Input label="Nom" placeholder="Nom de famille" value={formUser.nom} onChange={e=>setFormUser({...formUser, nom:e.target.value})} />
              <Input label="Prénom" placeholder="Prénom" value={formUser.prenom} onChange={e=>setFormUser({...formUser, prenom:e.target.value})} />
              <Input label="Email" type="email" placeholder="email@etab.bj" value={formUser.email} onChange={e=>setFormUser({...formUser, email:e.target.value})} />
              <Select label="Rôle" value={formUser.role} options={["medecin","infirmier","admin"]} onChange={e=>setFormUser({...formUser, role:e.target.value})} />
              <Select label="Établissement" value={formUser.etablissement} options={etabs.map(e=>({v:String(e.id),l:e.nom}))} onChange={e=>setFormUser({...formUser, etablissement:e.target.value})} />
              <Input label="Mot de passe" type="password" placeholder="••••••••" value={formUser.password} onChange={e=>setFormUser({...formUser, password:e.target.value})} />
            </Grid2>
            <div style={{ display:"flex", gap:10 }}>
              <Btn color={col.a} onClick={async ()=>{
                if (!formUser.nom || !formUser.prenom || !formUser.email || !formUser.password || !formUser.etablissement) {
                  alert("Remplissez tous les champs du compte utilisateur.");
                  return;
                }
                try {
                  const response = await api.post("/users/create", {
                    name: `${formUser.prenom.trim()} ${formUser.nom.trim()}`,
                    email: formUser.email,
                    role: formUser.role,
                    etablissement_id: Number(formUser.etablissement),
                    password: formUser.password,
                    statut: "actif",
                  });
                  const savedUser = normalizeUsers({ users:[response?.user] })[0];
                  if (!savedUser?.id) throw new Error("Le serveur n’a pas retourné le compte créé.");
                  setUsers(prev => [savedUser, ...prev.filter(account => account.id !== savedUser.id)]);
                  setFormUser({ nom:"", prenom:"", email:"", role:"medecin", etablissement:"", password:"" });
                  setShowUser(false);
                } catch (error) {
                  alert(error instanceof Error ? error.message : "Erreur lors de la création du compte.");
                }
              }}><Icon name="check" /> Créer le compte</Btn>
              <Btn variant="ghost" onClick={()=>setShowUser(false)}>Annuler</Btn>
            </div>
          </Modal>
        </div>
      )}
      {page==="notifications" && <PageNotifications accent={col.a} />}
      {page==="audit" && <AuditJournal />}
    </Layout>
  );
};

export default SuperAdmin;