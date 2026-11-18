import { useState } from "react";
import api from "../services/api";
import { Btn, Input, Alert } from "../components/UI";
import Icon from "../components/icons";
import { ROLE_COLOR } from "../constants/design";
import LoadingOverlay from "../components/LoadingOverlay";
import { routes } from "../services/api";
import "./login.css";

const MINIMUM_LOADING_MS = 4000;

const ROLE_LABELS = {
  super_admin: "Super administrateur",
  admin: "Administrateur",
  medecin: "Médecin",
  infirmier: "Infirmier(ère)",
};

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [challengeToken, setChallengeToken] = useState("");
  const [verificationEmail, setVerificationEmail] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const finishLogin = (payload) => {
    const account = payload?.user;
    const token = payload?.token ?? payload?.access_token;

    if (!account?.id || !account?.role || !token) {
      throw new Error("La réponse de connexion est incomplète. Réessayez ou contactez l’administrateur.");
    }

    const user = {
      ...account,
      nom: account.name ?? "",
      etab: account.etablissement?.nom ?? "",
      role_label: ROLE_LABELS[account.role] ?? account.role,
    };
    onLogin(user, token);
  };

  const submit = async () => {
    if (!email.trim() || !pwd) {
      setErr("Saisissez votre adresse email et votre mot de passe.");
      return;
    }

    setLoading(true);
    setErr("");
    const minimumLoading = new Promise(resolve => window.setTimeout(resolve, MINIMUM_LOADING_MS));

    try {
      const payload = await api.post(
        routes.auth.login,
        { email: email.trim(), password: pwd },
        { requireAuth: false }
      );

      if (payload?.requires_verification && payload?.challenge_token) {
        await minimumLoading;
        setChallengeToken(payload.challenge_token);
        setVerificationEmail(payload.email ?? email.trim());
        setVerificationCode("");
        setPwd("");
        return;
      }

      await minimumLoading;
      finishLogin(payload);
    } catch (error) {
      await minimumLoading;
      setErr(error instanceof Error ? error.message : "Impossible de se connecter.");
    } finally {
      setLoading(false);
    }
  };

  const verifyIdentity = async () => {
    if (!/^\d{6}$/.test(verificationCode)) {
      setErr("Saisissez le code de vérification à 6 chiffres reçu par e-mail.");
      return;
    }

    setLoading(true);
    setErr("");
    const minimumLoading = new Promise(resolve => window.setTimeout(resolve, MINIMUM_LOADING_MS));

    try {
      const payload = await api.post(
        routes.auth.verifyLogin,
        { challenge_token: challengeToken, code: verificationCode },
        { requireAuth: false }
      );
      await minimumLoading;
      finishLogin(payload);
    } catch (error) {
      await minimumLoading;
      setErr(error instanceof Error ? error.message : "Impossible de confirmer votre identité.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg, #E0F2FE 0%, #F8FDFF 45%, #EAF7FF 100%)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"system-ui,sans-serif", padding:20 }}>
      <div className="login-card">
        <section className="login-illustration" aria-label="Bienvenue sur MediShare">
          <div>
            <h1>La santé connectée,<br />au service de chacun</h1>
            <p>Un espace sécurisé pour mieux coordonner les soins et partager les dossiers médicaux.</p>
          </div>
          <img className="login-doctor-image" src="/doctor-stethoscope.svg" alt="Illustration d’un médecin portant une blouse et un stéthoscope" />
        </section>
        <section className="login-form-panel">
          <div className="login-brand">
            <div className="login-brand-mark"><Icon name="hospital" size={23} color="#7DD3FC" /></div>
            <div>
              <div className="login-brand-name">MediShare</div>
              <div className="login-brand-caption">Plateforme de partage de dossiers médicaux</div>
            </div>
          </div>
          {!challengeToken ? <>
            <h2 className="login-form-title">Connexion à votre compte professionnel</h2>
            <Input label="Email" type="email" autoComplete="username" placeholder="nom@etablissement.com" value={email} onChange={e=>setEmail(e.target.value)} />
            <Input label="Mot de passe" name="password" type="password" autoComplete="current-password" placeholder="••••••••" value={pwd} onChange={e=>setPwd(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} />
            {err && <Alert type="error">{err}</Alert>}
            <Btn full onClick={submit} disabled={loading} color={ROLE_COLOR.medecin.a}>{loading?"Connexion…":<>Se connecter <Icon name="arrowRight" color="#FFF" /></>}</Btn>
          </> : <>
            <h2 className="login-form-title">Confirmez votre identité</h2>
            <p style={{ margin:"-8px 0 18px", fontSize:13, lineHeight:1.6, color:"#475569" }}>
              Un code à 6 chiffres a été envoyé à <strong>{verificationEmail}</strong>. Il est valable pendant 10 minutes.
            </p>
            <Input
              label="Code de vérification"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              maxLength={6}
              value={verificationCode}
              onChange={event=>setVerificationCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
              onKeyDown={event=>event.key==="Enter"&&verifyIdentity()}
            />
            {err && <Alert type="error">{err}</Alert>}
            <Btn full onClick={verifyIdentity} disabled={loading} color={ROLE_COLOR.medecin.a}>{loading?"Vérification…":<>Confirmer et se connecter <Icon name="check" color="#FFF" /></>}</Btn>
            <div style={{ marginTop:10 }}>
              <Btn full variant="ghost" disabled={loading} onClick={()=>{setChallengeToken("");setVerificationCode("");setVerificationEmail("");setErr("");}}>
                <Icon name="arrowLeft" /> Retour à la connexion
              </Btn>
            </div>
          </>}
        </section>
      </div>
    </div>
    {loading && <LoadingOverlay message={challengeToken ? "Confirmation de votre identité…" : "Connexion à votre espace MediShare…"} />}
    </>
  );
};

export default Login;
