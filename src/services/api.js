const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "/api").replace(/\/+$/, "");

const getAuthToken = () => localStorage.getItem("ms_token");

export const setAuthToken = (token) => {
  if (!token) {
    localStorage.removeItem("ms_token");
    return;
  }
  localStorage.setItem("ms_token", token);
};

export const clearAuthToken = () => localStorage.removeItem("ms_token");

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("ms_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setStoredUser = (user) => {
  if (!user) {
    localStorage.removeItem("ms_user");
    return;
  }
  localStorage.setItem("ms_user", JSON.stringify(user));
};

export const clearStoredUser = () => localStorage.removeItem("ms_user");

const buildUrl = (endpoint, params = {}) => {
  if (/^https?:\/\//i.test(endpoint)) {
    const url = new URL(endpoint);
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      url.searchParams.append(key, String(value));
    });
    return url.toString();
  }

  const normalized = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = new URL(`${API_BASE_URL}${normalized}`, window.location.origin);
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    url.searchParams.append(key, String(value));
  });
  return url.toString();
};

export const apiRequest = async (endpoint, options = {}) => {
  const {
    method = "GET",
    body,
    params = {},
    headers = {},
    requireAuth = true,
  } = options;

  const token = requireAuth ? getAuthToken() : null;

  let response;
  try {
    response = await fetch(buildUrl(endpoint, params), {
      method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined || body === null ? undefined : JSON.stringify(body),
      credentials: "include",
    });
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Impossible de joindre le backend.");
  }

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    const message = payload?.message || payload?.error || payload?.detail || payload || `Erreur API (${response.status})`;
    throw new Error(typeof message === "string" ? message : "Erreur API");
  }

  return payload;
};

export const routes = {
  auth: {
    login: "/auth/login",
    verifyLogin: "/auth/verify-login",
    logout: "/auth/logout",
  },
  etablissements: "/etablissements",
  users: "/users",
  patients: "/patients",
  consultations: "/consultations",
  ordonnances: "/ordonnances",
  examens: "/examens",
  demandes: "/demandes",
  accessRequests: "/access-requests",
  notifications: "/notifications",
  audit: "/audit",
};

export const normalizeUsers = (payload) => {
  const data = payload?.data ?? payload;
  const users = Array.isArray(data) ? data : data?.users ?? data?.utilisateurs;

  if (!Array.isArray(users)) {
    throw new Error("La réponse de l’API ne contient pas de liste d’utilisateurs.");
  }

  return users.map((user) => ({
    ...user,
    nom: user.nom ?? user.name ?? "",
    etab: user.etab ?? user.etablissement?.nom ?? user.etablissement ?? "",
    statut: user.statut ?? user.status ?? "actif",
  }));
};

export const normalizePatients = (payload) => {
  const data = payload?.data ?? payload;
  const patients = Array.isArray(data) ? data : data?.patients;

  if (!Array.isArray(patients)) {
    throw new Error("La réponse de l’API ne contient pas de liste de patients.");
  }

  return patients.map(patient => ({
    ...patient,
    nom: [patient.nom, patient.prenom].filter(Boolean).join(" "),
    ddn: patient.date_naissance ?? "",
    sexe: patient.sexe === "femme" ? "F" : patient.sexe === "homme" ? "M" : "",
    tel: patient.telephone ?? "",
    dossier: patient.numero_dossier ?? "",
  }));
};

export const normalizeConsultations = (payload) => {
  const data = payload?.data ?? payload;
  const consultations = Array.isArray(data) ? data : data?.consultations;

  if (!Array.isArray(consultations)) {
    throw new Error("La réponse de l’API ne contient pas de liste de consultations.");
  }

  return consultations.map(consultation => ({
    ...consultation,
    id_patient: consultation.patient_id,
    traitement: consultation.ordonnance ?? "",
    date: consultation.date_consultation ?? consultation.created_at ?? "",
    medecin: consultation.medecin?.name ?? "",
  }));
};

export const normalizeAccessRequests = (payload) => {
  const data = payload?.data ?? payload;
  const requests = Array.isArray(data) ? data : data?.demandes;

  if (!Array.isArray(requests)) {
    throw new Error("La réponse de l’API ne contient pas de liste de demandes d’accès.");
  }

  return requests.map(request => ({
    ...request,
    patient: [request.patient?.nom, request.patient?.prenom].filter(Boolean).join(" "),
    patientRecord: request.patient ? {
      ...request.patient,
      consultations: Array.isArray(request.patient.consultations)
        ? normalizeConsultations(request.patient.consultations)
        : [],
      ordonnances: Array.isArray(request.patient.ordonnances) ? request.patient.ordonnances : [],
      examens: Array.isArray(request.patient.examens) ? request.patient.examens : [],
    } : null,
    dossier: request.patient?.numero_dossier ?? request.dossier?.numero ?? "",
    demandeur: request.demandeur?.name ?? "",
    demandeurEtablissement: request.demandeur?.etablissement?.nom ?? "",
    etablissement: request.medecin_cible?.etablissement?.nom
      ?? request.demandeur?.etablissement?.nom
      ?? "",
    medecinCible: request.medecin_cible ?? null,
    niveau: "lecture",
    motif: request.message ?? "",
    date: request.created_at ?? "",
    statut: request.statut === "acceptee" ? "accordee" : request.statut === "revoquee" ? "revoquee" : request.statut,
  }));
};

export const normalizeEtablissements = (payload) => {
  const data = payload?.data ?? payload;
  const etablissements = Array.isArray(data) ? data : data?.etablissements;

  if (!Array.isArray(etablissements)) {
    throw new Error("La réponse de l’API ne contient pas de liste d’établissements.");
  }

  return etablissements;
};

export const api = {
  get: (endpoint, params = {}, options = {}) => apiRequest(endpoint, { ...options, method: "GET", params }),
  post: (endpoint, body, options = {}) => apiRequest(endpoint, { ...options, method: "POST", body }),
  put: (endpoint, body, options = {}) => apiRequest(endpoint, { ...options, method: "PUT", body }),
  patch: (endpoint, body, options = {}) => apiRequest(endpoint, { ...options, method: "PATCH", body }),
  delete: (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: "DELETE" }),
};

export const saveWithFallback = async (payload, endpoints, options = {}) => {
  const candidates = [...new Set((endpoints || []).filter(Boolean))];
  if (!candidates.length) {
    throw new Error("Aucune route API configurée pour cette création.");
  }

  let lastError = null;
  for (const endpoint of candidates) {
    try {
      return await api.post(endpoint, payload, { ...(options || {}), requireAuth: options.requireAuth ?? true });
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Impossible d’enregistrer les données dans la base.");
};

export default api;