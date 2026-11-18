import { useEffect, useState } from "react";
import { D, ROLE_COLOR } from "../constants/design";
import Icon from "./icons";
import { api, routes } from "../services/api";

const Layout = ({ role, user, nav, page, setPage, onLogout, children }) => {
  const [unread, setUnread] = useState(0);
  const [unreadError, setUnreadError] = useState("");
  const col = ROLE_COLOR[role]||ROLE_COLOR.medecin;

  useEffect(() => {
    let cancelled = false;
    const loadUnread = () => {
      api.get(routes.notifications)
        .then(response => {
          const notifications = response?.notifications ?? response?.data?.notifications ?? [];
          if (!Array.isArray(notifications)) throw new Error("La réponse de l’API ne contient pas de liste de notifications.");
          if (!cancelled) {
            setUnread(notifications.filter(notification => !notification.lu).length);
            setUnreadError("");
          }
        })
        .catch(error => {
          if (!cancelled) setUnreadError(error instanceof Error ? error.message : "Impossible de charger les notifications.");
        });
    };
    loadUnread();
    window.addEventListener("medishare:notifications-updated", loadUnread);

    return () => {
      cancelled = true;
      window.removeEventListener("medishare:notifications-updated", loadUnread);
    };
  }, [page]);
  return (
    <div style={{ display:"flex", minHeight:"100vh", fontFamily:"system-ui,-apple-system,sans-serif", background:D.bg }}>
      <div style={{ width:224, background:"linear-gradient(180deg, "+col.p+", #0A6FB8)", display:"flex", flexDirection:"column", position:"fixed", top:0, left:0, height:"100vh", zIndex:100, boxShadow:"0 20px 40px rgba(14, 165, 233, 0.12)" }}>
        <div style={{ padding:"20px 18px 16px", borderBottom:"1px solid rgba(255,255,255,0.12)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:9, background:"#FFF", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 8px 18px rgba(56, 189, 248, 0.28)" }}>
              <Icon name="hospital" size={18} />
            </div>
            <div>
              <div style={{ color:"#FFF", fontSize:16, fontWeight:800 }}>MediShare</div>
              <div style={{ color:"rgba(255,255,255,0.7)", fontSize:10, marginTop:1 }}>{user.role_label}</div>
            </div>
          </div>
        </div>
        <nav style={{ flex:1, padding:"10px 0", overflowY:"auto" }}>
          {nav.map(item => {
            const active = page===item.id;
            const iconName = typeof item.icon === "string" ? item.icon : "hospital";
            return (
              <div key={item.id} onClick={()=>setPage(item.id)} style={{ display:"flex", alignItems:"center", gap:11, padding:"11px 18px", cursor:"pointer", color:active?"#FFF":"rgba(255,255,255,0.7)", background:active?"rgba(255,255,255,0.15)":"transparent", borderLeft:active?`3px solid ${col.a}`:"3px solid transparent", fontSize:13, fontWeight:active?700:400, transition:"all 0.2s ease", userSelect:"none", boxShadow:active?"inset 0 0 0 1px rgba(255,255,255,0.06)":"none" }}>
                <Icon name={iconName} size={16} color="#7DD3FC" />
                <span style={{ flex:1 }}>{item.label}</span>
                {item.id==="notifications" && unread>0 && (
                  <span style={{ background:D.sky, color:"#FFF", borderRadius:10, padding:"1px 7px", fontSize:10, fontWeight:800 }}>{unread}</span>
                )}
                {item.badge && <span style={{ background:item.badgeColor||D.sky, color:"#FFF", borderRadius:10, padding:"1px 7px", fontSize:10, fontWeight:800 }}>{item.badge}</span>}
              </div>
            );
          })}
          {unreadError && <div role="alert" style={{ color:"#FECACA", fontSize:11, padding:"8px 18px" }}>Erreur notifications : {unreadError}</div>}
        </nav>
        <div style={{ padding:"14px 18px", borderTop:"1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
            <div style={{ width:34, height:34, borderRadius:"50%", background:col.a, display:"flex", alignItems:"center", justifyContent:"center", color:"#FFF", fontSize:14, fontWeight:800, flexShrink:0 }}>{user.nom?.charAt(0)||"U"}</div>
            <div style={{ minWidth:0 }}>
              <div style={{ color:"#FFF", fontSize:12, fontWeight:700, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user.nom}</div>
              <div style={{ color:"rgba(255,255,255,0.45)", fontSize:10, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user.etab}</div>
            </div>
          </div>
          <button className="ui-utility-button" onClick={onLogout} style={{ width:"100%", background:"rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.75)", border:"none", borderRadius:6, padding:"7px 0", fontSize:12, cursor:"pointer", fontWeight:600 }}>Déconnexion</button>
        </div>
      </div>
      <div style={{ marginLeft:224, flex:1 }}>
        <div style={{ background:D.white, padding:"13px 28px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:`1.5px solid ${D.border}`, position:"sticky", top:0, zIndex:90 }}>
          <div style={{ fontSize:16, fontWeight:800, color:D.slate }}>{nav.find(n=>n.id===page)?.label}</div>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ fontSize:12, color:D.subtle }}>{user.etab}</span>
            <div style={{ width:32, height:32, borderRadius:"50%", background:col.a, color:"#FFF", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800 }}>{user.nom?.charAt(0)}</div>
          </div>
        </div>
        <div style={{ padding:28 }}>{children}</div>
      </div>
    </div>
  );
};

export default Layout;