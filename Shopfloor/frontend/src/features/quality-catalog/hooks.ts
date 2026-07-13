import { useEffect,useState } from 'react';
import { qualityCatalogApi, type QualityCodeDto } from './api';
export function useQualityCatalog(){const [defects,setDefects]=useState<QualityCodeDto[]>([]);const [causes,setCauses]=useState<QualityCodeDto[]>([]);const [error,setError]=useState<string|null>(null);useEffect(()=>{Promise.all([qualityCatalogApi.defects(),qualityCatalogApi.causes()]).then(([d,c])=>{setDefects(d);setCauses(c);}).catch(e=>setError(e instanceof Error?e.message:'Falha ao carregar motivos.'));},[]);return{defects,causes,error};}
