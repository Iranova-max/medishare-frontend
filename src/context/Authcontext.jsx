import { useState, createContext, useContext } from "react";
const AuthCtx = createContext(null);
const useAuth = () => useContext(AuthCtx);