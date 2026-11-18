import { useEffect, useState } from "react";
import Layout from "../components/layout";
import PageNotifications from "./notifiacations";
import { D, ROLE_COLOR } from "../constants/design";
import Icon from "../components/icons";
import { Badge, Alert, Card, EmptyState } from "../components/UI";
import { api, normalizeConsultations, normalizePatients, routes } from "../services/api";

const Infirmier = ({ user, onLogout }) => {
  const [page, setPage] = useState("dossiers");
  const [search, setSearch] = useState("");
  const [patients, setPatients] = useState([]);
  const [patientsError, setPatientsError] = useState("");
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [selected, setSelected] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [consultationsError, setConsultationsError] = useState("");
  const [loadingConsultations, setLoadingConsultations] = useState(false);
  const col = ROLE_COLOR.infirmier;
  const nav = [
    { id:"dossiers", label:"Dossiers médicaux", icon:"folder" },
    { id:"notifications", label:"Notifications", icon:"bell" },
  ];

  useEffect(() => {
    let cancelled = false;
    api.get(routes.patients)
      .then(response => {
        if (!cancelled) setPatients(normalizePatients(response));
      })
      .catch(error => {
        if (!cancelled) setPatientsError(error instanceof Error ? error.message : "Impossible de charger les dossiers patients.");
      })
      .finally(() => {
        if (!cancelled) setLoadingPatients(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selected?.id) return undefined;
    let cancelled = false;
    setLoadingConsultations(true);
    setConsultationsError("");
    api.get(routes.consultations, { patient_id:selected.id })
      .then(response => {
        if (!cancelled) setConsultations(normalizeConsultations(response));
      })
      .catch(error => {
        if (!cancelled) setConsultationsError(error instanceof Error ? error.message : "Impossible de charger les consultations.");
      })
      .finally(() => {
        if (!cancelled) setLoadingConsultations(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selected?.id]);

  const filteredPatients = patients.filter(patient => patient.nom.toLowerCase().includes(search.toLowerCase()));

  return (
    <Layout role="infirmier" user={user} nav={nav} page={page} setPage={setPage} onLogout={onLogout}>
      {page==="dossiers" && (
        <div>
          <h2 style={{ margin:"0 0 6px", fontSize:20, fontWeight:800, color:D.slate }}>Dossiers médicaux</h2>
          <p style={{ margin:"0 0 14px", fontSize:13, color:D.mid }}>Accès en lecture seule</p>
          <Alert type="warning"><Icon name="warning" size={16} /> En tant qu'infirmier(ère), vous disposez d'un accès en lecture seule. Toute modification est réservée aux médecins.</Alert>
          <Card style={{ padding:"14px 20px", marginBottom:16 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}><Icon name="search" /><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher un patient…" style={{ width:"100%", padding:"10px 14px", border:`1.5px solid ${D.border}`, borderRadius:8, fontSize:13, color:D.slate, background:D.bg, outline:"none", boxSizing:"border-box" }} /></div>
          </Card>
          {patientsError && <p role="alert" style={{ color:D.red }}>{patientsError}</p>}
          {loadingPatients && <p role="status" style={{ color:D.mid }}>Chargement des patients…</p>}
          {!loadingPatients && !patientsError && filteredPatients.length===0 && <Card><EmptyState icon="folder" text={search ? "Aucun patient ne correspond à cette recherche." : "Aucun patient enregistré dans votre établissement."} /></Card>}
          {filteredPatients.map(patient=>{
            const isOpen = selected?.id===patient.id;
            return (
              <Card key={patient.id}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", cursor:"pointer" }} onClick={()=>setSelected(isOpen?null:patient)}>
                  <div style={{ display:"flex", gap:14, alignItems:"center" }}>
                    <div style={{ width:46, height:46, borderRadius:"50%", background:D.skySoft, display:"flex", alignItems:"center", justifyContent:"center" }}><Icon name="user" size={22} /></div>
                    <div>
                      <div style={{ fontSize:15, fontWeight:800, color:D.slate }}>{patient.nom}</div>
                      <div style={{ fontSize:12, color:D.mid, display:"flex", alignItems:"center", gap:5 }}><Icon name="calendar" size={14} /> {patient.ddn ? new Intl.DateTimeFormat("fr-FR").format(new Date(patient.ddn)) : "Date de naissance non renseignée"} · <Icon name="phone" size={14} /> {patient.tel || "Téléphone non renseigné"}</div>
                      <span style={{ fontFamily:"monospace", fontSize:12, color:col.a, fontWeight:700, display:"block", marginTop:3 }}>{patient.dossier}</span>
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                    <Badge label={<><Icon name="lock" size={13} /> Lecture seule</>} color={D.mid} bg={D.bg} />
                    <Icon name={isOpen?"chevronUp":"chevronDown"} />
                  </div>
                </div>
                {isOpen && (
                  <div style={{ marginTop:16, borderTop:`1.5px solid ${D.bg}`, paddingTop:16 }}>
                    {consultationsError && <p role="alert" style={{ color:D.red }}>{consultationsError}</p>}
                    {loadingConsultations && <p role="status" style={{ color:D.mid }}>Chargement des consultations…</p>}
                    {!loadingConsultations && !consultationsError && consultations.length===0 && <EmptyState icon="file" text="Aucune consultation enregistrée" />}
                    {consultations.map(consultation=>(
                      <div key={consultation.id} style={{ background:D.bg, borderRadius:10, padding:"14px 16px", marginBottom:10 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                          <Badge label={<><Icon name="calendar" size={13} /> {consultation.date ? new Intl.DateTimeFormat("fr-FR", { dateStyle:"short" }).format(new Date(consultation.date)) : "Date inconnue"}</>} color={col.a} bg={`${col.a}18`} />
                          <span style={{ fontSize:11, color:D.subtle }}>{consultation.medecin}</span>
                        </div>
                        <div style={{ fontSize:13, color:D.slate, lineHeight:1.7 }}>
                          <div><strong>Motif :</strong> {consultation.motif}</div>
                          <div><strong>Diagnostic :</strong> {consultation.diagnostic || "Non renseigné"}</div>
                          <div><strong>Traitement :</strong> {consultation.traitement || "Non renseigné"}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
      {page==="notifications" && <PageNotifications accent={col.a} />}
    </Layout>
  );
};

export default Infirmier;
