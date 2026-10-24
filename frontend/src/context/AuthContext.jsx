import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
 const [user,setUser]=useState(()=>{try{return JSON.parse(localStorage.getItem('dd_user'))}catch{return null}}); const [loading,setLoading]=useState(Boolean(localStorage.getItem('dd_token')));
 useEffect(()=>{if(!localStorage.getItem('dd_token')){setLoading(false);return} api.get('/auth/me').then(r=>{setUser(r.data.user);localStorage.setItem('dd_user',JSON.stringify(r.data.user))}).catch(()=>{setUser(null)}).finally(()=>setLoading(false))},[]);
 const login=async credentials=>{const {data}=await api.post('/auth/login',credentials);localStorage.setItem('dd_token',data.token);localStorage.setItem('dd_user',JSON.stringify(data.user));setUser(data.user);return data.user};
 const register=async details=>{const {data}=await api.post('/auth/register',details);localStorage.setItem('dd_token',data.token);localStorage.setItem('dd_user',JSON.stringify(data.user));setUser(data.user);return data.user};
 const logout=()=>{localStorage.removeItem('dd_token');localStorage.removeItem('dd_user');setUser(null);window.location.href='/'};
 const updateUser=u=>{setUser(u);localStorage.setItem('dd_user',JSON.stringify(u))};
 return <AuthContext.Provider value={{user,loading,login,register,logout,updateUser}}>{children}</AuthContext.Provider>
}
export const useAuth=()=>useContext(AuthContext);
