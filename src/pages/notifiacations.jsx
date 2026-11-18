import { useEffect, useState } from "react";
import { D } from "../constants/design";
import Icon from "../components/icons";
import { Btn } from "../components/UI";
import { api, routes } from "../services/api";

const CONFIG = {
  demande: { icon:"info", color:"#38BDF8", bg:"#E0F2FE" },
  succes: { icon:"check", color:"#38BDF8", bg:"#E0F2FE" },
  info: { icon:"info", color:"#38BDF8", bg:"#E0F2FE" },
  alerte: { icon:"warning", color:"#38BDF8", bg:"#E0F2FE" },
};

const PageNotifications = ({ accent }) => {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api.get(routes.notifications)
      .then(response => {
        if (!cancelled) {
          const list = response?.notifications ?? response?.data?.notifications ?? [];
          if (!Array.isArray(list)) throw new Error("La réponse de l’API ne contient pas de liste de notifications.");
          setNotifications(list);
        }
      })
      .catch(requestError => {
        if (!cancelled) setError(requestError instanceof Error ? requestError.message : "Impossible de charger les notifications.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const markRead = async (notification) => {
    if (notification.lu) return;
    try {
      await api.put(`${routes.notifications}/${notification.id}/lire`);
      setNotifications(previous => previous.map(item => item.id === notification.id ? { ...item, lu:true } : item));
      window.dispatchEvent(new Event("medishare:notifications-updated"));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Impossible de marquer la notification comme lue.");
    }
  };

  const markAllRead = async () => {
    try {
      await api.put(`${routes.notifications}/lire-tout`);
      setNotifications(previous => previous.map(notification => ({ ...notification, lu:true })));
      window.dispatchEvent(new Event("medishare:notifications-updated"));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Impossible de marquer les notifications comme lues.");
    }
  };

  const formatDate = value => {
    if (!value) return "";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? ""
      : new Intl.DateTimeFormat("fr-FR", { dateStyle:"short", timeStyle:"short" }).format(date);
  };

  const unreadCount = notifications.filter(notification => !notification.lu).length;

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div>
          <h2 style={{ margin:0, fontSize:20, fontWeight:800, color:D.slate }}>Notifications</h2>
          <p style={{ margin:"4px 0 0", fontSize:13, color:D.mid }}>{unreadCount} non lue(s)</p>
        </div>
        {unreadCount > 0 && <Btn variant="ghost" onClick={markAllRead}>Tout marquer comme lu</Btn>}
      </div>
      {error && <p role="alert" style={{ color:D.red, margin:"0 0 14px" }}>Impossible de synchroniser les notifications : {error}</p>}
      {loading && <p role="status" style={{ color:D.mid }}>Chargement des notifications…</p>}
      {!loading && !error && notifications.length === 0 && <p style={{ textAlign:"center", color:D.mid, padding:24 }}>Aucune notification.</p>}
      {notifications.map(notification => {
        const config = CONFIG[notification.type] || CONFIG.info;
        return (
          <div key={notification.id} onClick={()=>markRead(notification)} style={{ background:D.white, borderRadius:10, padding:"14px 18px", marginBottom:10, display:"flex", gap:14, alignItems:"flex-start", opacity:notification.lu?0.6:1, borderLeft:notification.lu?"none":`3px solid ${accent||D.teal}`, cursor:notification.lu?"default":"pointer", boxShadow:"0 1px 3px rgba(28,43,58,0.06)" }}>
            <div style={{ width:38, height:38, borderRadius:9, background:config.bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><Icon name={config.icon} size={16} color={config.color} /></div>
            <div style={{ flex:1 }}>
              {notification.titre && <div style={{ fontSize:14, fontWeight:750, color:D.slate, marginBottom:3 }}>{notification.titre}</div>}
              <div style={{ fontSize:13, color:D.slate, lineHeight:1.5 }}>{notification.message}</div>
              <div style={{ fontSize:11, color:D.subtle, marginTop:4 }}>{formatDate(notification.created_at)}</div>
            </div>
            {!notification.lu && <div style={{ width:8, height:8, borderRadius:"50%", background:accent||D.teal, flexShrink:0, marginTop:5 }} />}
          </div>
        );
      })}
    </div>
  );
};

export default PageNotifications;
