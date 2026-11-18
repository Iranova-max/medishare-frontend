import { Children, Fragment, cloneElement, isValidElement, useState } from "react";
import { D } from "../constants/design";
import Icon from "./icons";

const Badge = ({ label, color=D.mid, bg=D.bg }) => (
  <span style={{ padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700, color, background:bg, display:"inline-block", whiteSpace:"nowrap" }}>{label}</span>
);
const StatusBadge = ({ s }) => {
  const m = { en_attente:{l:"En attente",c:D.skyDark,bg:D.skySoft}, accordee:{l:"Accordée",c:D.green,bg:D.greenL}, refusee:{l:"Refusée",c:D.red,bg:D.redL}, revoquee:{l:"Révoquée",c:D.mid,bg:D.bg}, actif:{l:"Actif",c:D.green,bg:D.greenL}, inactif:{l:"Inactif",c:D.red,bg:D.redL} };
  const x = m[s]||m.en_attente;
  return <Badge label={x.l} color={x.c} bg={x.bg} />;
};
const colorButtonIcons = (children, color) => Children.map(children, child => {
  if (!isValidElement(child)) return child;
  if (child.type === Icon) return cloneElement(child, { color });
  if (child.type === Fragment) return cloneElement(child, {}, colorButtonIcons(child.props.children, color));
  return child;
});
const Btn = ({ children, onClick, variant="primary", sm, full, color, disabled }) => {
  const [hovered, setHovered] = useState(false);
  const base = { border:"none", borderRadius:sm?7:9, padding:sm?"6px 13px":"11px 22px", fontSize:sm?12:13, fontWeight:750, letterSpacing:"0.01em", cursor:disabled?"not-allowed":"pointer", display:"inline-flex", alignItems:"center", gap:7, opacity:disabled?0.56:1, width:full?"100%":"auto", justifyContent:"center", flexShrink:0, transition:"transform 160ms ease, box-shadow 180ms ease, background-color 180ms ease, opacity 180ms ease", transform:hovered&&!disabled?"translateY(-2px)":"translateY(0)", outline:"none" };
  const v = { primary:{background:color||D.sky,color:"#FFF", boxShadow:hovered?"0 12px 24px rgba(14, 165, 233, 0.3)":"0 5px 12px rgba(14, 165, 233, 0.17)"}, ghost:{background:hovered?D.skySoft:"transparent",color:color||D.mid,boxShadow:`inset 0 0 0 1.5px ${hovered?D.sky:D.border}`}, danger:{background:D.red,color:"#FFF", boxShadow:hovered?"0 10px 20px rgba(220, 38, 38, 0.24)":"0 4px 10px rgba(220, 38, 38, 0.13)"}, success:{background:D.green,color:"#FFF", boxShadow:hovered?"0 10px 20px rgba(22, 163, 74, 0.24)":"0 4px 10px rgba(22, 163, 74, 0.13)"}, amber:{background:D.amber,color:"#FFF", boxShadow:hovered?"0 10px 20px rgba(217, 119, 6, 0.24)":"0 4px 10px rgba(217, 119, 6, 0.13)"}, purple:{background:D.purple,color:"#FFF", boxShadow:hovered?"0 10px 20px rgba(124, 58, 237, 0.24)":"0 4px 10px rgba(124, 58, 237, 0.13)"} };
  return <button type="button" onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)} onFocus={()=>setHovered(true)} onBlur={()=>setHovered(false)} onClick={onClick} disabled={disabled} style={{...base,...v[variant], ...(disabled?{transform:"none",boxShadow:"none"}:{})}}>{colorButtonIcons(children, v[variant].color)}</button>;
};
const Input = ({ label, ...p }) => (
  <div style={{ marginBottom:14 }}>
    {label && <label style={{ fontSize:12, fontWeight:700, color:D.slate, display:"block", marginBottom:5 }}>{label}</label>}
    <input {...p} style={{ width:"100%", padding:"10px 13px", border:`1.5px solid ${D.border}`, borderRadius:8, fontSize:13, color:D.slate, background:"#FFF", outline:"none", boxSizing:"border-box", ...p.style }} />
  </div>
);
const Select = ({ label, options, ...p }) => (
  <div style={{ marginBottom:14 }}>
    {label && <label style={{ fontSize:12, fontWeight:700, color:D.slate, display:"block", marginBottom:5 }}>{label}</label>}
    <select {...p} style={{ width:"100%", padding:"10px 13px", border:`1.5px solid ${D.border}`, borderRadius:8, fontSize:13, color:D.slate, background:"#FFF", outline:"none", boxSizing:"border-box" }}>
      {options.map(o=><option key={o.v ?? o} value={o.v ?? o}>{o.l ?? o}</option>)}
    </select>
  </div>
);
const Textarea = ({ label, ...p }) => (
  <div style={{ marginBottom:14 }}>
    {label && <label style={{ fontSize:12, fontWeight:700, color:D.slate, display:"block", marginBottom:5 }}>{label}</label>}
    <textarea {...p} style={{ width:"100%", padding:"10px 13px", border:`1.5px solid ${D.border}`, borderRadius:8, fontSize:13, color:D.slate, resize:"vertical", minHeight:80, fontFamily:"inherit", boxSizing:"border-box" }} />
  </div>
);
const Card = ({ children, style }) => (
  <div style={{ background:D.white, borderRadius:12, padding:24, boxShadow:"0 1px 4px rgba(28,43,58,0.07)", marginBottom:18, ...style }}>{children}</div>
);
const CardTitle = ({ children, accent }) => (
  <div style={{ fontSize:14, fontWeight:800, color:accent||D.slate, marginBottom:16, paddingBottom:12, borderBottom:`1.5px solid ${D.bg}` }}>{children}</div>
);
const Th = ({ c }) => <th style={{ textAlign:"left", padding:"10px 14px", fontSize:11, fontWeight:800, color:D.subtle, background:D.bg, borderBottom:`1.5px solid ${D.border}`, whiteSpace:"nowrap" }}>{c}</th>;
const Td = ({ children }) => <td style={{ padding:"13px 14px", fontSize:13, color:D.slate, borderBottom:`1px solid ${D.bg}`, verticalAlign:"middle" }}>{children}</td>;
const StatCard = ({ icon, value, label, color }) => (
  <div style={{ background:D.white, borderRadius:12, padding:"18px 20px", boxShadow:"0 1px 4px rgba(28,43,58,0.07)", borderTop:`3px solid ${color}` }}>
    <div style={{ marginBottom:8 }}>{icon}</div>
    <div style={{ fontSize:28, fontWeight:900, color:D.slate, lineHeight:1 }}>{value}</div>
    <div style={{ fontSize:12, color:D.mid, marginTop:5 }}>{label}</div>
  </div>
);
const EmptyState = ({ icon, text, action, onAction }) => (
  <div style={{ textAlign:"center", padding:"40px 24px", color:D.subtle }}>
    <div style={{ marginBottom:10 }}><Icon name={icon || "info"} size={36} /></div>
    <div style={{ fontSize:14, fontWeight:600, color:D.mid, marginBottom:14 }}>{text}</div>
    {action && <Btn onClick={onAction}>{action}</Btn>}
  </div>
);
const Modal = ({ open, onClose, title, children, accent }) => {
  if (!open) return null;
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(28,43,58,0.55)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ background:D.white, borderRadius:14, width:"100%", maxWidth:540, maxHeight:"88vh", overflow:"auto", boxShadow:"0 20px 60px rgba(28,43,58,0.25)" }}>
        <div style={{ padding:"18px 24px", borderBottom:`1.5px solid ${D.bg}`, display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, background:D.white, zIndex:1 }}>
          <div style={{ fontSize:15, fontWeight:800, color:accent||D.slate }}>{title}</div>
          <button className="ui-utility-button" type="button" onClick={onClose} aria-label="Fermer" style={{ background:"none", border:"none", borderRadius:6, fontSize:22, cursor:"pointer", color:D.subtle, lineHeight:1, padding:"2px 7px" }}>×</button>
        </div>
        <div style={{ padding:24 }}>{children}</div>
      </div>
    </div>
  );
};
const Alert = ({ type, children }) => {
  const cfg = { info:{c:"#1D4ED8",bg:"#EFF6FF",b:"#BFDBFE"}, success:{c:D.green,bg:D.greenL,b:"#A7F3D0"}, warning:{c:"#92400E",bg:"#FEF3C7",b:"#FDE68A"}, error:{c:D.red,bg:D.redL,b:"#FECACA"} };
  const x = cfg[type]||cfg.info;
  return <div style={{ background:x.bg, border:`1px solid ${x.b}`, borderRadius:8, padding:"11px 14px", fontSize:13, color:x.c, marginBottom:14 }}>{children}</div>;
};
const Grid2 = ({ children }) => <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>{children}</div>;
const Grid4 = ({ children }) => <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:20 }}>{children}</div>;

export { Badge, StatusBadge, Btn, Input, Select, Textarea, Card, CardTitle, Th, Td, StatCard, EmptyState, Modal, Alert, Grid2, Grid4 };