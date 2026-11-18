import { useEffect, useState } from "react";
import PageNotifications from "./notifiacations";
import Layout from "../components/layout";
import { D, ROLE_COLOR } from "../constants/design";
import Icon from "../components/icons";
import { Btn, Badge, StatusBadge, Card, CardTitle, Grid2, Grid4, Input, Modal, Select, StatCard, Textarea, Th, Td, Alert, EmptyState } from "../components/UI";
import { api, normalizeAccessRequests, normalizeConsultations, normalizePatients, routes } from "../services/api";

const formatDateLabel = value => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("fr-FR", { dateStyle:"short" }).format(date);
};

const Medecin = ({ user, onLogout }) => {
  const col = ROLE_COLOR.medecin;

  // États globaux
  const [page, setPage] = useState("dashboard");
  const [patients, setPatients] = useState([]);
  const [patientsError, setPatientsError] = useState("");
  const [consultations, setConsultations] = useState([]);
  const [consultationsError, setConsultationsError] = useState("");
  const [ordonnances, setOrdonnances] = useState([]);
  const [ordonnancesError, setOrdonnancesError] = useState("");
  const [ordonnanceReload, setOrdonnanceReload] = useState(0);
  const [examens, setExamens] = useState([]);
  const [examensError, setExamensError] = useState("");
  const [recues, setRecues] = useState([]);
  const [demandesRecuesError, setDemandesRecuesError] = useState("");
  const [envoyees, setEnvoyees] = useState([]);
  const [demandesEnvoyeesError, setDemandesEnvoyeesError] = useState("");
  const [demandesEnvoyeesLoading, setDemandesEnvoyeesLoading] = useState(true);
  const [medecinsCibles, setMedecinsCibles] = useState([]);
  const [medecinsCiblesError, setMedecinsCiblesError] = useState("");
  const [patientsLoading, setPatientsLoading] = useState(true);
  const [consultationsLoading, setConsultationsLoading] = useState(true);
  const [demandesLoading, setDemandesLoading] = useState(true);
  const [searchPatient, setSearchPatient] = useState("");

  // Modales
  const [showNouveauPatient, setShowNouveauPatient] = useState(false);
  const [showConsult, setShowConsult] = useState(false);
  const [showOrdonnance, setShowOrdonnance] = useState(false);
  const [showExamen, setShowExamen] = useState(false);
  const [showEnvoyerDemande, setShowEnvoyerDemande] = useState(false);
  const [showDetailDemande, setShowDetailDemande] = useState(false);
  const [showRefus, setShowRefus] = useState(false);
  const [showDossierPartage, setShowDossierPartage] = useState(false);

  // Sélections
  const [patientActif, setPatientActif] = useState(null);
  const [ongletDossier, setOngletDossier] = useState("consultations");
  const [demandeSelectionnee, setDemandeSelectionnee] = useState(null);
  const [dossierActif, setDossierActif] = useState(null);
  const [motifRefus, setMotifRefus] = useState("");

  // Formulaires
  const [formPatient, setFormPatient] = useState({ nom:"", prenom:"", ddn:"", sexe:"", tel:"", adresse:"" });
  const [formConsult, setFormConsult] = useState({ motif:"", diagnostic:"", traitement:"", obs:"" });
  const [formOrdonnance, setFormOrdonnance] = useState({ medicament:"", posologie:"", duree:"", instructions:"" });
  const [formExamen, setFormExamen] = useState({ type:"", date:"", demande:"", commentaires:"" });
  const [formDemande, setFormDemande] = useState({ patient_id:"", medecin_cible_id:"", motif:"" });
  const dossiersPartages = envoyees
    .filter(request => request.statut === "accordee")
    .map(request => ({
      id:request.id,
      patient:request.patient,
      numero:request.dossier,
      etab:request.etablissement || "Établissement non renseigné",
      niveau:"lecture",
      consultations:request.patientRecord?.consultations ?? [],
      ordonnances:request.patientRecord?.ordonnances ?? [],
      examens:request.patientRecord?.examens ?? [],
    }));

  useEffect(() => {
    let cancelled = false;

    api.get(routes.patients)
      .then(response => {
        if (!cancelled) setPatients(normalizePatients(response));
      })
      .catch(error => {
        if (!cancelled) setPatientsError(error instanceof Error ? error.message : "Impossible de charger les patients.");
      })
      .finally(() => {
        if (!cancelled) setPatientsLoading(false);
      });

    api.get(routes.consultations)
      .then(response => {
        if (!cancelled) setConsultations(normalizeConsultations(response));
      })
      .catch(error => {
        if (!cancelled) setConsultationsError(error instanceof Error ? error.message : "Impossible de charger les consultations.");
      })
      .finally(() => {
        if (!cancelled) setConsultationsLoading(false);
      });

    api.get("/medecins-cibles")
      .then(response => {
        if (!cancelled) {
          const targets = response?.medecins ?? response?.data?.medecins;
          if (!Array.isArray(targets)) throw new Error("La réponse de l’API ne contient pas de liste de médecins.");
          setMedecinsCibles(targets);
        }
      })
      .catch(error => {
        if (!cancelled) setMedecinsCiblesError(error instanceof Error ? error.message : "Impossible de charger les médecins des autres établissements.");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadReceived = ["dashboard", "demandesRecues"].includes(page);
    const loadSent = ["dashboard", "demandesEnvoyees", "dossiersPartages"].includes(page);

    if (loadReceived) {
      setDemandesLoading(true);
      setDemandesRecuesError("");
      api.get(routes.demandes)
        .then(response => {
          if (!cancelled) setRecues(normalizeAccessRequests(response));
        })
        .catch(error => {
          if (!cancelled) setDemandesRecuesError(error instanceof Error ? error.message : "Impossible de charger les demandes reçues.");
        })
        .finally(() => {
          if (!cancelled) setDemandesLoading(false);
        });
    }

    if (loadSent) {
      setDemandesEnvoyeesLoading(true);
      setDemandesEnvoyeesError("");
      api.get(`${routes.demandes}/envoyees`)
        .then(response => {
          if (!cancelled) setEnvoyees(normalizeAccessRequests(response));
        })
        .catch(error => {
          if (!cancelled) setDemandesEnvoyeesError(error instanceof Error ? error.message : "Impossible de charger les demandes envoyées.");
        })
        .finally(() => {
          if (!cancelled) setDemandesEnvoyeesLoading(false);
        });
    }

    return () => {
      cancelled = true;
    };
  }, [page]);

  useEffect(() => {
    if (!patientActif?.id) {
      return undefined;
    }

    let cancelled = false;
    api.get(routes.ordonnances, { patient_id: patientActif.id })
      .then(response => {
        if (!cancelled) {
          const list = response?.ordonnances ?? response?.data?.ordonnances ?? response?.data ?? [];
          setOrdonnances(Array.isArray(list) ? list : []);
        }
      })
      .catch(error => {
        if (!cancelled) {
          setOrdonnancesError(error instanceof Error ? error.message : "Impossible de charger les ordonnances.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [patientActif?.id, ordonnanceReload]);

  useEffect(() => {
    if (!patientActif?.id) return undefined;
    let cancelled = false;
    api.get(routes.examens, { patient_id:patientActif.id })
      .then(response => {
        if (!cancelled) {
          const list = response?.examens ?? response?.data?.examens ?? [];
          if (!Array.isArray(list)) throw new Error("La réponse de l’API ne contient pas de liste d’examens.");
          setExamens(list);
        }
      })
      .catch(error => {
        if (!cancelled) setExamensError(error instanceof Error ? error.message : "Impossible de charger les examens.");
      });
    return () => {
      cancelled = true;
    };
  }, [patientActif?.id]);

  // Nav avec badges dynamiques
  const nav = [
    { id:"dashboard",       label:"Tableau de bord",    icon:"dashboard" },
    { id:"patients",        label:"Patients & Dossiers", icon:"users" },
    { id:"demandesRecues",  label:"Demandes reçues",    icon:"inbox", badge: recues.filter(d=>d.statut==="en_attente").length||null, badgeColor:D.amber },
    { id:"demandesEnvoyees",label:"Mes demandes",       icon:"send" },
    { id:"dossiersPartages",label:"Dossiers partagés",  icon:"folder", badge: dossiersPartages.length||null, badgeColor:D.green },
    { id:"notifications",   label:"Notifications",      icon:"bell" },
  ];

  // ── Helpers ──
  const traiterDemande = async (id, decision, motif="") => {
    try {
      const response = await api.put(`${routes.demandes}/${id}/traiter`, {
        decision: decision === "accordee" ? "acceptee" : "refusee",
        message: motif || undefined,
      });
      const updated = normalizeAccessRequests({ demandes:[response?.demande ?? response?.data?.demande] })[0];
      setRecues(previous => previous.map(request => request.id === id ? { ...request, ...updated } : request));
      setDemandeSelectionnee(null);
      setShowDetailDemande(false);
      setShowRefus(false);
      setMotifRefus("");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Impossible de traiter la demande d’accès.");
    }
  };
  const revoquerAcces = async (id) => {
    try {
      const response = await api.put(`${routes.demandes}/${id}/revoquer`);
      const updated = normalizeAccessRequests({ demandes:[response?.demande ?? response?.data?.demande] })[0];
      setRecues(previous => previous.map(request => request.id === id ? { ...request, ...updated } : request));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Impossible de révoquer cet accès.");
    }
  };
  const filtresPatients = patients.filter(p=>p.nom.toLowerCase().includes(searchPatient.toLowerCase()));
  const patientsAffiches = patientActif ? [patientActif] : filtresPatients;

  // ── DASHBOARD ──
  const Dashboard = () => (
    <div>
      <div style={{ marginBottom:22 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:12, flexWrap:"wrap" }}>
          <div>
            <h2 style={{ margin:0, fontSize:20, fontWeight:800, color:D.slate }}>Bonjour, {user.nom || user.name}</h2>
            <p style={{ margin:"4px 0 0", fontSize:13, color:D.mid }}>{user.etab || user.etablissement?.nom}</p>
          </div>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
            <Btn color={col.a} onClick={()=>{setPatientActif(null);setShowConsult(true);}}><Icon name="plus" /> Nouvelle consultation</Btn>
            <Btn variant="ghost" onClick={()=>setShowNouveauPatient(true)}><Icon name="plus" /> Nouveau patient</Btn>
          </div>
        </div>
      </div>
      <Grid4>
        <StatCard icon={<Icon name="users" size={22} />} value={patients.length} label="Patients suivis" color={col.a} />
        <StatCard icon={<Icon name="inbox" size={22} />} value={recues.filter(d=>d.statut==="en_attente").length} label="Demandes à traiter" color={D.amber} />
        <StatCard icon={<Icon name="send" size={22} />} value={envoyees.filter(d=>d.statut==="accordee").length} label="Accès obtenus" color={D.green} />
        <StatCard icon={<Icon name="folder" size={22} />} value={dossiersPartages.length} label="Dossiers partagés" color={D.purple} />
      </Grid4>

      {/* Demandes urgentes */}
      {recues.filter(d=>d.statut==="en_attente").length>0 && (
        <Card style={{ borderLeft:`4px solid ${D.amber}` }}>
          <CardTitle accent={D.amber}><Icon name="clock" /> Demandes en attente de votre décision</CardTitle>
          {recues.filter(d=>d.statut==="en_attente").map(d=>(
            <div key={d.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:`1px solid ${D.bg}` }}>
              <div>
                <div style={{ fontWeight:700, fontSize:13 }}>{d.patient} — <span style={{ fontFamily:"monospace", color:col.a }}>{d.dossier}</span></div>
                <div style={{ fontSize:12, color:D.mid, marginTop:2 }}>{d.demandeur} · <em>{d.motif}</em></div>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <Btn sm variant="success" onClick={()=>traiterDemande(d.id,"accordee")}><Icon name="check" /> Accorder</Btn>
                <Btn sm variant="danger"  onClick={()=>{ setDemandeSelectionnee(d); setShowRefus(true); }}><Icon name="close" /> Refuser</Btn>
              </div>
            </div>
          ))}
        </Card>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <Card>
          <CardTitle><Icon name="users" /> Derniers patients</CardTitle>
          {patientsError && <p role="alert" style={{ color:D.red }}>{patientsError}</p>}
          {patientsLoading && <p role="status" style={{ color:D.mid }}>Chargement des patients…</p>}
          {patients.slice(0,3).map(p=>(
            <div key={p.id} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:`1px solid ${D.bg}`, cursor:"pointer" }} onClick={()=>{
              setOrdonnances([]);
              setOrdonnancesError("");
              setExamens([]);
              setExamensError("");
              setOngletDossier("consultations");
              setPatientActif(p);
              setPage("patients");
            }}>
              <div>
                <div style={{ fontWeight:700, fontSize:13 }}>{p.nom}</div>
                <div style={{ fontSize:11, color:D.mid }}>{p.dossier}</div>
              </div>
              <span style={{ fontSize:11, color:D.subtle }}>{p.ddn}</span>
            </div>
          ))}
          {!patientsLoading && !patientsError && patients.length===0 && <EmptyState icon="users" text="Aucun patient enregistré dans votre établissement." action="Créer un patient" onAction={()=>setShowNouveauPatient(true)} />}
          <div style={{ marginTop:12 }}><Btn sm variant="ghost" onClick={()=>setPage("patients")}>Voir tous les patients <Icon name="arrowRight" /></Btn></div>
        </Card>
        <Card>
          <CardTitle><Icon name="file" /> Activité récente</CardTitle>
          {consultationsError && <p role="alert" style={{ color:D.red }}>{consultationsError}</p>}
          {consultationsLoading && <p role="status" style={{ color:D.mid }}>Chargement des consultations…</p>}
          {!consultationsLoading && !consultationsError && consultations.slice(0,3).map(consultation=>(
            <div key={consultation.id} style={{ display:"flex", gap:12, padding:"9px 0", borderBottom:`1px solid ${D.bg}`, alignItems:"flex-start" }}>
              <div style={{ width:32, height:32, borderRadius:8, background:D.skySoft, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><Icon name="file" size={17} /></div>
              <div>
                <div style={{ fontSize:13, color:D.slate }}>{consultation.motif}</div>
                <div style={{ fontSize:11, color:D.subtle, marginTop:2 }}>{consultation.patient?.nom} {consultation.patient?.prenom} · {consultation.date ? new Intl.DateTimeFormat("fr-FR", { dateStyle:"short" }).format(new Date(consultation.date)) : ""}</div>
              </div>
            </div>
          ))}
          {!consultationsLoading && !consultationsError && consultations.length===0 && <EmptyState icon="file" text="Aucune consultation enregistrée." />}
        </Card>
      </div>
    </div>
  );

  // ── PATIENTS & DOSSIERS ──
  const PagePatients = () => (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div>
          <h2 style={{ margin:0, fontSize:20, fontWeight:800, color:D.slate }}>{patientActif ? "Dossier médical du patient" : "Patients & Dossiers médicaux"}</h2>
          <p style={{ margin:"4px 0 0", fontSize:13, color:D.mid }}>{patientActif ? patientActif.nom : `${patients.length} patients enregistrés`}</p>
        </div>
        {patientActif
          ? <Btn variant="ghost" onClick={()=>{
              setPatientActif(null);
              setOrdonnances([]);
              setOrdonnancesError("");
              setExamens([]);
              setExamensError("");
            }}><Icon name="arrowLeft" /> Retour aux patients</Btn>
          : <Btn color={col.a} onClick={()=>setShowNouveauPatient(true)}><Icon name="plus" /> Nouveau patient</Btn>}
      </div>
      {!patientActif && <Card style={{ padding:"14px 20px", marginBottom:16 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}><Icon name="search" /><input value={searchPatient} onChange={e=>setSearchPatient(e.target.value)} placeholder="Rechercher un patient par nom…" style={{ width:"100%", padding:"10px 14px", border:`1.5px solid ${D.border}`, borderRadius:8, fontSize:13, color:D.slate, background:D.bg, outline:"none", boxSizing:"border-box" }} /></div>
      </Card>}
      {patientsError && <p role="alert" style={{ color:D.red }}>{patientsError}</p>}
      {patientsLoading && <p role="status" style={{ color:D.mid }}>Chargement des patients…</p>}
      {!patientActif && !patientsLoading && !patientsError && filtresPatients.length===0 && <Card><EmptyState icon="folder" text={searchPatient ? "Aucun patient ne correspond à cette recherche." : "Aucun patient enregistré dans votre établissement."} action="Créer un patient" onAction={()=>setShowNouveauPatient(true)} /></Card>}
      {patientActif && !patients.some(patient => patient.id === patientActif.id) && <p role="alert" style={{ color:D.red }}>Ce patient n’est plus disponible. Retournez à la liste et sélectionnez un dossier existant.</p>}
      {patientsAffiches.map(p=>{
        const consults = consultations.filter(c=>c.id_patient===p.id);
        const patientOrdonnances = ordonnances.filter(ordonnance=>ordonnance.patient_id===p.id);
        const patientEstPartage = Number(p.etablissement_id) !== Number(user.etablissement_id);
        const isOpen = patientActif?.id===p.id;
        return (
          <Card key={p.id}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", cursor:patientActif ? "default" : "pointer" }} onClick={!patientActif ? ()=>{
              setOrdonnances([]);
              setOrdonnancesError("");
              setExamens([]);
              setExamensError("");
              setOngletDossier("consultations");
              setPatientActif(p);
            } : undefined}>
              <div style={{ display:"flex", gap:14, alignItems:"center" }}>
                <div style={{ width:46, height:46, borderRadius:"50%", background:D.skySoft, display:"flex", alignItems:"center", justifyContent:"center" }}><Icon name="user" size={22} /></div>
                <div>
                  <div style={{ fontSize:15, fontWeight:800, color:D.slate }}>{p.nom}</div>
                  <div style={{ fontSize:12, color:D.mid, marginTop:2, display:"flex", alignItems:"center", gap:5 }}><Icon name="calendar" size={14} /> {p.ddn ? new Intl.DateTimeFormat("fr-FR").format(new Date(p.ddn)) : "Date de naissance non renseignée"} · <Icon name="phone" size={14} /> {p.tel || "Téléphone non renseigné"}</div>
                  <span style={{ fontFamily:"monospace", fontSize:12, color:col.a, fontWeight:700, display:"block", marginTop:4 }}>{p.dossier}</span>
                  {patientEstPartage && <Badge label="Dossier partagé · lecture seule" color={D.green} bg={D.greenL} />}
                </div>
              </div>
              {!patientActif && <Icon name="arrowRight" />}
            </div>
            {isOpen && (
              <div style={{ marginTop:18, borderTop:`1.5px solid ${D.bg}`, paddingTop:18 }}>
                <div style={{ display:"flex", gap:4, marginBottom:16, background:D.bg, padding:4, borderRadius:8, width:"fit-content" }}>
                  {[{id:"consultations",l:"Consultations",icon:"file"},{id:"ordonnances",l:"Ordonnances",icon:"prescription"},{id:"examens",l:"Examens",icon:"lab"}].map(o=>(
                    <button key={o.id} onClick={()=>setOngletDossier(o.id)} style={{ padding:"7px 16px", borderRadius:6, border:"none", cursor:"pointer", fontSize:12, fontWeight:700, background:ongletDossier===o.id?col.a:"transparent", color:ongletDossier===o.id?"#FFF":D.mid }}>
                      <><Icon name={o.icon} size={14} /> {o.l}</>
                    </button>
                  ))}
                </div>
                {ongletDossier==="consultations" && (
                  <div>
                    {!patientEstPartage && <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:12 }}>
                      <Btn sm color={col.a} onClick={()=>setShowConsult(true)}><Icon name="plus" /> Nouvelle consultation</Btn>
                    </div>}
                    {consults.length===0 ? <EmptyState icon="file" text="Aucune consultation enregistrée" /> :
                      consults.map(c=>(
                        <div key={c.id} style={{ background:D.bg, borderRadius:10, padding:"14px 16px", marginBottom:10 }}>
                          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                            <Badge label={<><Icon name="calendar" size={13} /> {formatDateLabel(c.date)}</>} color={col.a} bg={`${col.a}18`} />
                            <span style={{ fontSize:11, color:D.subtle }}>{c.medecin}</span>
                          </div>
                          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
                            {[{l:"Motif",v:c.motif},{l:"Diagnostic",v:c.diagnostic},{l:"Traitement",v:c.traitement}].map((x,i)=>(
                              <div key={i}><div style={{ fontSize:10, fontWeight:800, color:D.subtle, marginBottom:3 }}>{x.l.toUpperCase()}</div><div style={{ fontSize:12, color:D.slate }}>{x.v}</div></div>
                            ))}
                          </div>
                        </div>
                      ))
                    }
                  </div>
                )}
                {ongletDossier==="ordonnances" && (
                  <div>
                    {ordonnancesError && <p role="alert" style={{ color:D.red, margin:"0 0 12px" }}>Impossible de charger les ordonnances : {ordonnancesError}</p>}
                    <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:12 }}>
                      {!patientEstPartage && <Btn sm color={col.a} onClick={()=>{setPatientActif(p);setShowOrdonnance(true);}}><Icon name="plus" /> Ajouter une ordonnance</Btn>}
                    </div>
                    {!ordonnancesError && patientOrdonnances.length===0 ? <EmptyState icon="prescription" text="Aucune ordonnance enregistrée" /> :
                      patientOrdonnances.map(ordonnance=>(
                        <div key={ordonnance.id} style={{ background:D.bg, borderRadius:10, padding:"14px 16px", marginBottom:10 }}>
                          <div style={{ display:"flex", justifyContent:"space-between", gap:12, marginBottom:10 }}>
                            <strong style={{ color:D.slate, fontSize:14 }}>{ordonnance.medicament}</strong>
                            <Badge label={ordonnance.date_prescription ? new Intl.DateTimeFormat("fr-FR", { dateStyle:"short" }).format(new Date(ordonnance.date_prescription)) : "Date inconnue"} color={D.green} bg={D.greenL} />
                          </div>
                          <div style={{ fontSize:12, color:D.slate, marginBottom:6 }}><strong>Posologie :</strong> {ordonnance.posologie}</div>
                          {ordonnance.duree && <div style={{ fontSize:12, color:D.slate, marginBottom:6 }}><strong>Durée :</strong> {ordonnance.duree}</div>}
                          {ordonnance.instructions && <div style={{ fontSize:12, color:D.slate }}><strong>Instructions :</strong> {ordonnance.instructions}</div>}
                        </div>
                      ))
                    }
                  </div>
                )}
                {ongletDossier==="examens" && (
                  <div>
                    {examensError && <p role="alert" style={{ color:D.red }}>{examensError}</p>}
                    <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:12 }}>
                      {!patientEstPartage && <Btn sm color={col.a} onClick={()=>setShowExamen(true)}><Icon name="plus" /> Ajouter un examen</Btn>}
                    </div>
                    {!examensError && examens.filter(examen=>examen.patient_id===p.id).length===0
                      ? <EmptyState icon="lab" text="Aucun examen enregistré" />
                      : examens.filter(examen=>examen.patient_id===p.id).map(examen=>(
                        <div key={examen.id} style={{ background:D.bg, borderRadius:10, padding:"14px 16px", marginBottom:10 }}>
                          <div style={{ display:"flex", justifyContent:"space-between", gap:12 }}>
                            <strong style={{ color:D.slate }}>{examen.libelle}</strong>
                            <Badge label={examen.date_prescription ? new Intl.DateTimeFormat("fr-FR", { dateStyle:"short" }).format(new Date(examen.date_prescription)) : "Date inconnue"} color={D.purple} bg={D.purpleL} />
                          </div>
                          {examen.details && <div style={{ fontSize:12, marginTop:8 }}><strong>Instructions :</strong> {examen.details}</div>}
                          {examen.commentaires && <div style={{ fontSize:12, marginTop:6 }}><strong>Commentaires :</strong> {examen.commentaires}</div>}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );

  // ── DEMANDES REÇUES ──
  const PageDemandesRecues = () => (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div>
          <h2 style={{ margin:0, fontSize:20, fontWeight:800, color:D.slate }}>Demandes d'accès reçues</h2>
          <p style={{ margin:"4px 0 0", fontSize:13, color:D.mid }}>Médecins extérieurs souhaitant accéder aux dossiers de vos patients</p>
        </div>
      </div>
      <Grid4>
        <StatCard icon={<Icon name="clock" size={22} />} value={recues.filter(d=>d.statut==="en_attente").length} label="En attente" color={D.amber} />
        <StatCard icon={<Icon name="check" size={22} />} value={recues.filter(d=>d.statut==="accordee").length} label="Accordées" color={D.green} />
        <StatCard icon={<Icon name="close" size={22} />} value={recues.filter(d=>d.statut==="refusee").length} label="Refusées" color={D.red} />
        <StatCard icon={<Icon name="lock" size={22} />} value={recues.filter(d=>d.statut==="revoquee").length} label="Révoquées" color={D.mid} />
      </Grid4>
      {demandesLoading && <p role="status" style={{ color:D.mid }}>Chargement des demandes reçues…</p>}
      {demandesRecuesError && <p role="alert" style={{ color:D.red }}>Impossible de charger les demandes reçues : {demandesRecuesError}</p>}
      {!demandesLoading && !demandesRecuesError && recues.length===0 ? <Card><EmptyState icon="inbox" text="Aucune demande reçue" /></Card> :
        !demandesLoading && !demandesRecuesError && (
        recues.map(d=>(
          <Card key={d.id} style={{ borderLeft:d.statut==="en_attente"?`4px solid ${D.amber}`:"none" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12, flexWrap:"wrap" }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:15, fontWeight:800, color:D.slate, marginBottom:4 }}>{d.patient}</div>
                <div style={{ fontSize:12, color:D.mid, marginBottom:2 }}>Dossier : <span style={{ fontFamily:"monospace", color:col.a, fontWeight:700 }}>{d.dossier}</span></div>
                <div style={{ fontSize:12, color:D.mid, marginBottom:2 }}>Demandeur : {d.demandeur}{d.demandeurEtablissement ? ` — ${d.demandeurEtablissement}` : ""}</div>
                <div style={{ fontSize:12, color:D.mid, marginBottom:10 }}>Motif : <em>{d.motif}</em></div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  <Badge label={<><Icon name={d.niveau==="lecture"?"eye":"edit"} size={13} /> {d.niveau==="lecture"?"Lecture seule":"Modification"}</>} color={col.a} bg={`${col.a}15`} />
                  <Badge label={<><Icon name="calendar" size={13} /> {formatDateLabel(d.date)}</>} color={D.mid} bg={D.bg} />
                  <StatusBadge s={d.statut} />
                </div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                <Btn sm color={col.a} onClick={()=>{setDemandeSelectionnee(d);setShowDetailDemande(true);}}><Icon name="search" /> Examiner</Btn>
                {d.statut==="en_attente" && <>
                              <Btn sm variant="success" onClick={()=>traiterDemande(d.id,"accordee")}><Icon name="check" /> Accorder</Btn>
                  <Btn sm variant="danger"  onClick={()=>{setDemandeSelectionnee(d);setShowRefus(true);}}><Icon name="close" /> Refuser</Btn>
                </>}
                {d.statut==="accordee" &&
                  <Btn sm variant="amber" onClick={()=>revoquerAcces(d.id)}><Icon name="lock" /> Révoquer</Btn>
                }
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );

  // ── DEMANDES ENVOYÉES ──
  const PageDemandesEnvoyees = () => (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div>
          <h2 style={{ margin:0, fontSize:20, fontWeight:800, color:D.slate }}>Mes demandes d'accès</h2>
          <p style={{ margin:"4px 0 0", fontSize:13, color:D.mid }}>Demandes envoyées vers d'autres établissements</p>
        </div>
        <Btn color={col.a} onClick={()=>setShowEnvoyerDemande(true)}><Icon name="send" /> Nouvelle demande</Btn>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:20 }}>
        {[
          {l:"En attente",v:envoyees.filter(d=>d.statut==="en_attente").length,c:"#92400E",bg:"#FEF3C7"},
          {l:"Accordées", v:envoyees.filter(d=>d.statut==="accordee").length,  c:D.green,  bg:D.greenL },
          {l:"Refusées",  v:envoyees.filter(d=>d.statut==="refusee").length,   c:D.red,    bg:D.redL   },
        ].map((s,i)=>(
          <div key={i} style={{ background:s.bg, borderRadius:12, padding:"16px 20px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:13, fontWeight:700, color:s.c }}>{s.l}</span>
            <span style={{ fontSize:28, fontWeight:900, color:s.c }}>{s.v}</span>
          </div>
        ))}
      </div>
      {demandesEnvoyeesLoading && <p role="status" style={{ color:D.mid }}>Chargement des demandes envoyées…</p>}
      {demandesEnvoyeesError && <p role="alert" style={{ color:D.red }}>Impossible de charger les demandes envoyées : {demandesEnvoyeesError}</p>}
      {!demandesEnvoyeesLoading && !demandesEnvoyeesError && envoyees.length===0 ? <Card><EmptyState icon="send" text="Aucune demande envoyée" action="Envoyer une demande" onAction={()=>setShowEnvoyerDemande(true)} /></Card> : !demandesEnvoyeesLoading && !demandesEnvoyeesError && (
        <Card>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead><tr>{["Établissement cible","Dossier","Patient","Niveau","Date","Statut","Action"].map(c=><Th key={c} c={c} />)}</tr></thead>
            <tbody>
              {envoyees.map(d=>(
                <tr key={d.id}>
                  <Td><div style={{ fontWeight:700, fontSize:12 }}>{d.etablissement}</div></Td>
                  <Td><span style={{ fontFamily:"monospace", fontSize:12, color:col.a }}>{d.dossier}</span></Td>
                  <Td>{d.patient}</Td>
                  <Td><Badge label={<><Icon name={d.niveau==="lecture"?"eye":"edit"} size={13} /> {d.niveau==="lecture"?"Lecture":"Modif."}</>} color={col.a} bg={`${col.a}15`} /></Td>
                  <Td>{formatDateLabel(d.date)}</Td>
                  <Td><StatusBadge s={d.statut} /></Td>
                  <Td>
                    {d.statut==="accordee"
                      ? <Btn sm color={D.green} onClick={()=>{ const dp = dossiersPartages.find(x=>x.numero===d.dossier); if(dp){setDossierActif(dp);setShowDossierPartage(true);} }}><Icon name="folder" /> Consulter</Btn>
                      : <span style={{ fontSize:12, color:D.subtle }}>—</span>
                    }
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );

  // ── DOSSIERS PARTAGÉS ──
  const PageDossiersPartages = () => (
    <div>
      <h2 style={{ margin:"0 0 6px", fontSize:20, fontWeight:800, color:D.slate }}>Dossiers partagés</h2>
      <p style={{ margin:"0 0 20px", fontSize:13, color:D.mid }}>Dossiers auxquels vous avez obtenu l'accès via une demande accordée</p>
      {demandesEnvoyeesLoading && <p role="status" style={{ color:D.mid }}>Chargement des dossiers partagés…</p>}
      {demandesEnvoyeesError && <p role="alert" style={{ color:D.red }}>Impossible de charger les dossiers partagés : {demandesEnvoyeesError}</p>}
      {!demandesEnvoyeesLoading && !demandesEnvoyeesError && dossiersPartages.length===0 ? (
        <Card>
          <EmptyState icon="folder" text="Aucun dossier partagé disponible" action="Envoyer une demande d'accès" onAction={()=>setPage("demandesEnvoyees")} />
        </Card>
      ) : !demandesEnvoyeesLoading && !demandesEnvoyeesError && dossiersPartages.map(dp=>(
        <Card key={dp.id} style={{ borderLeft:`4px solid ${D.green}` }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
            <div>
              <div style={{ fontSize:15, fontWeight:800, color:D.slate }}>{dp.patient}</div>
              <div style={{ fontSize:12, color:D.mid, marginTop:2 }}>Dossier : <span style={{ fontFamily:"monospace", color:col.a, fontWeight:700 }}>{dp.numero}</span></div>
              <div style={{ fontSize:12, color:D.mid, marginTop:2 }}>Établissement : {dp.etab}</div>
              <div style={{ display:"flex", gap:8, marginTop:10 }}>
                <Badge label={<><Icon name={dp.niveau==="lecture"?"eye":"edit"} size={13} /> {dp.niveau==="lecture"?"Lecture seule":"Modification"}</>} color={D.green} bg={D.greenL} />
              </div>
            </div>
            <Btn sm color={col.a} onClick={()=>{setDossierActif(dp);setShowDossierPartage(true);}}><Icon name="folder" /> Ouvrir le dossier</Btn>
          </div>
          <Alert type="success">Accès accordé — dossier accessible en lecture seule jusqu’à révocation.</Alert>
        </Card>
      ))}
    </div>
  );

  // ─────────────────────────────────────────────
  return (
    <Layout role="medecin" user={user} nav={nav} page={page} setPage={setPage} onLogout={onLogout}>
      {page==="dashboard"        && <Dashboard />}
      {page==="patients"         && <PagePatients />}
      {page==="demandesRecues"   && <PageDemandesRecues />}
      {page==="demandesEnvoyees" && <PageDemandesEnvoyees />}
      {page==="dossiersPartages" && <PageDossiersPartages />}
      {page==="notifications"    && <PageNotifications accent={col.a} />}

      {/* ── MODAL NOUVEAU PATIENT ── */}
      <Modal open={showNouveauPatient} onClose={()=>setShowNouveauPatient(false)} title={<><Icon name="folder" /> Créer un nouveau patient</>} accent={col.a}>
        <Alert type="info">Un numéro de dossier unique sera généré automatiquement.</Alert>
        <Grid2>
          <Input label="Nom" placeholder="Nom de famille" onChange={e=>setFormPatient({...formPatient,nom:e.target.value})} />
          <Input label="Prénom" placeholder="Prénom" onChange={e=>setFormPatient({...formPatient,prenom:e.target.value})} />
          <Input label="Date de naissance" type="date" onChange={e=>setFormPatient({...formPatient,ddn:e.target.value})} />
          <Select label="Sexe" value={formPatient.sexe} options={[{v:"",l:"Non renseigné"},{v:"M",l:"Masculin"},{v:"F",l:"Féminin"}]} onChange={e=>setFormPatient({...formPatient,sexe:e.target.value})} />
          <Input label="Téléphone" placeholder="97000000" onChange={e=>setFormPatient({...formPatient,tel:e.target.value})} />
        </Grid2>
        <Input label="Adresse" placeholder="Quartier, Ville" value={formPatient.adresse} onChange={e=>setFormPatient({...formPatient, adresse:e.target.value})} />
        <div style={{ display:"flex", gap:10 }}>
          <Btn color={col.a} onClick={async ()=>{
            if (!formPatient.nom || !formPatient.prenom) {
              alert("Le nom et le prénom du patient sont obligatoires.");
              return;
            }
            try {
              const payload = {
                nom: formPatient.nom.trim(),
                prenom: formPatient.prenom,
                date_naissance: formPatient.ddn || null,
                sexe: formPatient.sexe ? formPatient.sexe === "M" ? "homme" : "femme" : null,
                telephone: formPatient.tel || null,
                adresse: formPatient.adresse,
              };
              const response = await api.post(routes.patients, payload);
              const newPatient = response?.patient ?? response?.data?.patient ?? response?.data ?? response;
              if (!newPatient?.id) throw new Error("Le serveur n’a pas retourné le patient créé.");
              setPatients(prev => [...prev, normalizePatients({ patients:[newPatient] })[0]]);
              setFormPatient({ nom:"", prenom:"", ddn:"", sexe:"", tel:"", adresse:"" });
              setShowNouveauPatient(false);
            } catch (error) {
              alert(error instanceof Error ? error.message : "Erreur lors de l’enregistrement du patient.");
            }
          }}><Icon name="check" /> Créer le dossier</Btn>
          <Btn variant="ghost" onClick={()=>setShowNouveauPatient(false)}>Annuler</Btn>
        </div>
      </Modal>

      {/* ── MODAL NOUVELLE CONSULTATION ── */}
      <Modal open={showConsult} onClose={()=>setShowConsult(false)} title={<><Icon name="file" /> Nouvelle consultation</>} accent={col.a}>
        {!patientActif?.id && <Select
          label="Patient concerné"
          value=""
          options={[
            {v:"",l:"Sélectionner un patient"},
            ...patients
              .filter(patient => Number(patient.etablissement_id) === Number(user.etablissement_id))
              .map(patient => ({v:String(patient.id),l:`${patient.nom} — ${patient.dossier}`})),
          ]}
          onChange={event => setPatientActif(patients.find(patient => String(patient.id) === event.target.value) ?? null)}
        />}
        <Textarea label="Motif de la consultation" placeholder="Ex : Fièvre persistante depuis 3 jours…" value={formConsult.motif} onChange={e=>setFormConsult({...formConsult,motif:e.target.value})} />
        <Textarea label="Diagnostic" placeholder="Diagnostic établi après examen clinique…" value={formConsult.diagnostic} onChange={e=>setFormConsult({...formConsult,diagnostic:e.target.value})} />
        <Textarea label="Traitement prescrit" placeholder="Médicaments, dosages, durée…" value={formConsult.traitement} onChange={e=>setFormConsult({...formConsult,traitement:e.target.value})} />
        <Textarea label="Observations" placeholder="Notes complémentaires…" value={formConsult.obs} onChange={e=>setFormConsult({...formConsult,obs:e.target.value})} />
        <div style={{ display:"flex", gap:10 }}>
          <Btn color={col.a} onClick={async ()=>{
            if (!formConsult.motif || !formConsult.diagnostic) {
              alert("Le motif et le diagnostic de la consultation sont obligatoires.");
              return;
            }
            try {
              if (!patientActif?.id) {
                throw new Error("Sélectionnez un patient avant d’ajouter une consultation.");
              }
              const response = await api.post(routes.consultations, {
                patient_id: patientActif.id,
                motif: formConsult.motif,
                diagnostic: formConsult.diagnostic,
                ordonnance: formConsult.traitement,
                notes: formConsult.obs,
                date_consultation: new Date().toISOString(),
              });
              const savedConsultation = response?.consultation ?? response?.data?.consultation ?? response?.data;
              if (!savedConsultation?.id) {
                throw new Error("Le serveur n’a pas retourné la consultation enregistrée.");
              }
              setConsultations(previous => [{
                id: savedConsultation.id,
                id_patient: savedConsultation.patient_id,
                motif: savedConsultation.motif,
                diagnostic: savedConsultation.diagnostic,
                traitement: savedConsultation.ordonnance,
                date: savedConsultation.date_consultation,
                medecin: user?.nom || "Médecin",
              }, ...previous]);
              setFormConsult({ motif:"", diagnostic:"", traitement:"", obs:"" });
              setShowConsult(false);
            } catch (error) {
              alert(error instanceof Error ? error.message : "Erreur lors de l’enregistrement de la consultation.");
            }
          }}><Icon name="check" /> Enregistrer</Btn>
          <Btn variant="ghost" onClick={()=>setShowConsult(false)}>Annuler</Btn>
        </div>
      </Modal>

      {/* ── MODAL NOUVELLE ORDONNANCE ── */}
      <Modal open={showOrdonnance} onClose={()=>setShowOrdonnance(false)} title={<><Icon name="prescription" /> Nouvelle ordonnance</>} accent={D.green}>
        <Input label="Médicament" placeholder="Ex : Amoxicilline 500 mg" value={formOrdonnance.medicament} onChange={e=>setFormOrdonnance({...formOrdonnance, medicament:e.target.value})} />
        <Textarea label="Posologie" placeholder="Ex : 1 comprimé matin et soir pendant 5 jours" value={formOrdonnance.posologie} onChange={e=>setFormOrdonnance({...formOrdonnance, posologie:e.target.value})} />
        <Input label="Durée" placeholder="Ex : 5 jours" value={formOrdonnance.duree} onChange={e=>setFormOrdonnance({...formOrdonnance, duree:e.target.value})} />
        <Textarea label="Instructions" placeholder="Ex : À prendre après le repas, hydrater bien…" value={formOrdonnance.instructions} onChange={e=>setFormOrdonnance({...formOrdonnance, instructions:e.target.value})} />
        <div style={{ display:"flex", gap:10 }}>
          <Btn color={D.green} onClick={async ()=>{
            if (!formOrdonnance.medicament || !formOrdonnance.posologie) {
              alert("Le médicament et la posologie sont obligatoires.");
              return;
            }
            try {
              if (!patientActif?.id) {
                throw new Error("Sélectionnez un patient avant de créer une ordonnance.");
              }
              const response = await api.post(routes.ordonnances, {
                patient_id: patientActif.id,
                medicament: formOrdonnance.medicament,
                posologie: formOrdonnance.posologie,
                duree: formOrdonnance.duree,
                instructions: formOrdonnance.instructions,
                date_prescription: new Date().toISOString(),
              });
              const savedOrdonnance = response?.ordonnance ?? response?.data?.ordonnance ?? response?.data;
              if (!savedOrdonnance?.id) {
                throw new Error("Le serveur n’a pas retourné l’ordonnance enregistrée.");
              }
              setOrdonnances(previous => [savedOrdonnance, ...previous]);
              setOrdonnanceReload(previous => previous + 1);
              setFormOrdonnance({ medicament:"", posologie:"", duree:"", instructions:"" });
              setShowOrdonnance(false);
            } catch (error) {
              alert(error instanceof Error ? error.message : "Erreur lors de l’enregistrement de l’ordonnance.");
            }
          }}><Icon name="check" /> Enregistrer</Btn>
          <Btn variant="ghost" onClick={()=>setShowOrdonnance(false)}>Annuler</Btn>
        </div>
      </Modal>

      {/* ── MODAL NOUVEL EXAMEN ── */}
      <Modal open={showExamen} onClose={()=>setShowExamen(false)} title={<><Icon name="lab" /> Ajouter un examen</>} accent={D.purple}>
        <Input label="Type d'examen" placeholder="Ex : NFS, ECG, Radiographie…" value={formExamen.type} onChange={e=>setFormExamen({...formExamen, type:e.target.value})} />
        <Input label="Date de prescription" type="date" value={formExamen.date} onChange={e=>setFormExamen({...formExamen, date:e.target.value})} />
        <Textarea label="Instructions / Demande" placeholder="Ex : À réaliser avant le prochain suivi, avec résultat à déposer dans le dossier…" value={formExamen.demande} onChange={e=>setFormExamen({...formExamen, demande:e.target.value})} />
        <Textarea label="Commentaires" placeholder="Observations complémentaires…" value={formExamen.commentaires} onChange={e=>setFormExamen({...formExamen, commentaires:e.target.value})} />
        <div style={{ display:"flex", gap:10 }}>
          <Btn color={D.purple} onClick={async ()=>{
            if (!formExamen.type.trim()) {
              alert("Le type d’examen est obligatoire.");
              return;
            }
            try {
              if (!patientActif?.id) throw new Error("Sélectionnez un patient avant d’ajouter un examen.");
              const consultation = consultations.find(item => item.id_patient === patientActif.id);
              if (!consultation) throw new Error("Ajoutez une consultation à ce patient avant de prescrire un examen.");
              const response = await api.post(routes.examens, {
                patient_id: patientActif.id,
                consultation_id: consultation.id,
                libelle: formExamen.type.trim(),
                date_prescription: formExamen.date || null,
                details: formExamen.demande,
                commentaires: formExamen.commentaires,
              });
              const savedExamen = response?.examen ?? response?.data?.examen;
              if (!savedExamen?.id) throw new Error("Le serveur n’a pas retourné l’examen enregistré.");
              setExamens(previous => [savedExamen, ...previous]);
              setFormExamen({ type:"", date:"", demande:"", commentaires:"" });
              setShowExamen(false);
            } catch (error) {
              alert(error instanceof Error ? error.message : "Erreur lors de l’enregistrement de l’examen.");
            }
          }}><Icon name="check" /> Enregistrer</Btn>
          <Btn variant="ghost" onClick={()=>setShowExamen(false)}>Annuler</Btn>
        </div>
      </Modal>

      {/* ── MODAL ENVOYER DEMANDE ── */}
      <Modal open={showEnvoyerDemande} onClose={()=>setShowEnvoyerDemande(false)} title={<><Icon name="send" /> Demande d'accès à un dossier externe</>} accent={col.a}>
        <Alert type="info">La demande sera envoyée à un médecin d’un autre établissement. Le patient sélectionné ne sera accessible au destinataire qu’après son accord.</Alert>
        {patientsError && <p role="alert" style={{ color:D.red }}>{patientsError}</p>}
        {medecinsCiblesError && <p role="alert" style={{ color:D.red }}>{medecinsCiblesError}</p>}
        <Select label="Patient concerné" value={formDemande.patient_id} options={[
          {v:"",l:"Sélectionner un patient"},
          ...patients.map(patient=>({v:String(patient.id),l:`${patient.nom} — ${patient.dossier}`})),
        ]} onChange={e=>setFormDemande({...formDemande,patient_id:e.target.value})} />
        <Select label="Médecin destinataire" value={formDemande.medecin_cible_id} options={[
          {v:"",l:"Sélectionner un médecin"},
          ...medecinsCibles.map(doctor=>({v:String(doctor.id),l:`${doctor.name} — ${doctor.etablissement?.nom || "Établissement inconnu"}`})),
        ]} onChange={e=>setFormDemande({...formDemande,medecin_cible_id:e.target.value})} />
        <Textarea label="Motif de la demande (obligatoire)" placeholder="Expliquez clairement la raison médicale de cette demande…" value={formDemande.motif} onChange={e=>setFormDemande({...formDemande,motif:e.target.value})} />
        <div style={{ display:"flex", gap:10 }}>
          <Btn color={col.a} onClick={async ()=>{
            if (!formDemande.patient_id || !formDemande.medecin_cible_id || !formDemande.motif.trim()) {
              alert("Sélectionnez un patient et un médecin destinataire, puis indiquez le motif.");
              return;
            }
            try {
              const response = await api.post(routes.demandes, {
                patient_id: Number(formDemande.patient_id),
                medecin_cible_id: Number(formDemande.medecin_cible_id),
                message: formDemande.motif.trim(),
              });
              const created = normalizeAccessRequests({ demandes:[response?.demande ?? response?.data?.demande] })[0];
              setEnvoyees(previous => [created, ...previous]);
              setFormDemande({ patient_id:"", medecin_cible_id:"", motif:"" });
              setShowEnvoyerDemande(false);
            } catch (error) {
              alert(error instanceof Error ? error.message : "Erreur lors de l’envoi de la demande.");
            }
          }}><Icon name="send" /> Envoyer la demande</Btn>
          <Btn variant="ghost" onClick={()=>setShowEnvoyerDemande(false)}>Annuler</Btn>
        </div>
      </Modal>

      {/* ── MODAL DÉTAIL DEMANDE REÇUE ── */}
      <Modal open={showDetailDemande&&!showRefus} onClose={()=>{setShowDetailDemande(false);setDemandeSelectionnee(null);}} title={<><Icon name="search" /> Détail de la demande reçue</>} accent={col.a}>
        {demandeSelectionnee && <>
          <Grid2>
            {[{l:"Patient concerné",v:demandeSelectionnee.patient},{l:"Dossier",v:demandeSelectionnee.dossier},{l:"Médecin demandeur",v:demandeSelectionnee.demandeur},{l:"Niveau d'accès",v:demandeSelectionnee.niveau},{l:"Date de demande",v:demandeSelectionnee.date},{l:"Statut",v:<StatusBadge s={demandeSelectionnee.statut}/>}].map((x,i)=>(
              <div key={i} style={{ background:D.bg, borderRadius:8, padding:"10px 14px" }}>
                <div style={{ fontSize:10, fontWeight:800, color:D.subtle, marginBottom:4 }}>{x.l.toUpperCase()}</div>
                <div style={{ fontSize:13, fontWeight:700, color:D.slate }}>{x.v}</div>
              </div>
            ))}
          </Grid2>
          <div style={{ background:`${col.a}12`, borderRadius:10, padding:"12px 16px", marginBottom:20, fontSize:13, color:D.slate }}>
            <strong>Motif de la demande :</strong> {demandeSelectionnee.motif}
          </div>
          {demandeSelectionnee.statut==="en_attente" && (
            <div style={{ display:"flex", gap:10 }}>
              <Btn variant="success" full onClick={()=>traiterDemande(demandeSelectionnee.id,"accordee")}><Icon name="check" /> Accorder l'accès</Btn>
              <Btn variant="danger"  full onClick={()=>setShowRefus(true)}><Icon name="close" /> Refuser l'accès</Btn>
            </div>
          )}
          {demandeSelectionnee.statut==="accordee" && (
            <Btn variant="amber" full onClick={()=>revoquerAcces(demandeSelectionnee.id)}><Icon name="lock" /> Révoquer l'accès</Btn>
          )}
        </>}
      </Modal>

      {/* ── MODAL REFUS ── */}
      <Modal open={showRefus} onClose={()=>{setShowRefus(false);setDemandeSelectionnee(null);}} title={<><Icon name="close" /> Refuser la demande</>} accent={D.red}>
        <Alert type="error">Le médecin demandeur sera notifié du refus avec le motif que vous indiquez.</Alert>
        <Textarea label="Motif du refus (obligatoire)" placeholder="Ex : Informations insuffisantes, patient non reconnu dans notre établissement…" value={motifRefus} onChange={e=>setMotifRefus(e.target.value)} />
        <div style={{ display:"flex", gap:10 }}>
          <Btn variant="danger" onClick={()=>{ if(demandeSelectionnee&&motifRefus) traiterDemande(demandeSelectionnee.id,"refusee",motifRefus); else alert("Le motif est obligatoire."); }} disabled={!motifRefus}><Icon name="close" /> Confirmer le refus</Btn>
          <Btn variant="ghost" onClick={()=>{setShowRefus(false);setDemandeSelectionnee(null);}}>Annuler</Btn>
        </div>
      </Modal>

      {/* ── MODAL DOSSIER PARTAGÉ ── */}
      <Modal open={showDossierPartage&&!!dossierActif} onClose={()=>{setShowDossierPartage(false);setDossierActif(null);}} title={<><Icon name="folder" /> Dossier partagé — Lecture</>} accent={D.green}>
        {dossierActif && <>
          <Alert type="success">Accès accordé · Lecture seule · Jusqu’à révocation</Alert>
          <div style={{ background:`linear-gradient(135deg,${D.slate},#0B3352)`, borderRadius:10, padding:"16px 20px", color:"#FFF", marginBottom:18 }}>
            <div style={{ fontSize:10, opacity:0.6, marginBottom:8, letterSpacing:1 }}>DOSSIER EXTERNE — {dossierActif.niveau==="lecture"?"LECTURE SEULE":"ACCÈS COMPLET"}</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              {[{l:"Patient",v:dossierActif.patient},{l:"N° Dossier",v:dossierActif.numero},{l:"Établissement",v:dossierActif.etab},{l:"Niveau d'accès",v:dossierActif.niveau}].map((x,i)=>(
                <div key={i}><div style={{ fontSize:10, opacity:0.6, marginBottom:3 }}>{x.l}</div><div style={{ fontSize:13, fontWeight:700 }}>{x.v}</div></div>
              ))}
            </div>
          </div>
          <CardTitle><Icon name="file" /> Consultations disponibles</CardTitle>
          {dossierActif.consultations.map((c,i)=>(
            <div key={i} style={{ background:D.bg, borderRadius:10, padding:"14px 16px", marginBottom:10 }}>
              <Badge label={<><Icon name="calendar" size={13} /> {formatDateLabel(c.date)}</>} color={D.green} bg={D.greenL} />
              <div style={{ marginTop:10, fontSize:13, color:D.slate, lineHeight:1.7 }}>
                <div><strong>Motif :</strong> {c.motif}</div>
                <div><strong>Diagnostic :</strong> {c.diagnostic}</div>
                <div><strong>Traitement :</strong> {c.traitement}</div>
              </div>
            </div>
          ))}
          {[...dossierActif.ordonnances, ...dossierActif.examens].map((item, index) => (
            <div key={`${item.id}-${index}`} style={{ background:D.bg, borderRadius:10, padding:"12px 16px", marginTop:10 }}>
              <strong>{item.medicament || item.libelle}</strong>
              <div style={{ fontSize:12, color:D.mid, marginTop:4 }}>{item.posologie || item.details || item.instructions || "—"}</div>
            </div>
          ))}
          <Alert type="warning">Accès en lecture seule — aucune modification autorisée sur ce dossier partagé.</Alert>
        </>}
      </Modal>
    </Layout>
  );
};

export default Medecin;