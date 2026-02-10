
import { User, Customer, Trip, Booking, FinanceEntry } from './types';
import { INITIAL_USERS } from './constants';

const getApiUrl = () => {
  // If the app is accessed without a port number (which means it's running in production on Vercel)
  // we route the API requests relative to the current domain, hitting the Vercel serverless function.
  if (!window.location.port) {
    return '/api';
  }
  
  // Local CPU / Local Network fallback
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  return `${protocol}//${hostname}:3001/api`;
};

const API_URL = getApiUrl();
const STORAGE_KEY = 'avenue_app_data_fallback';

export interface AppData {
  users: User[];
  customers: Customer[];
  trips: Trip[];
  bookings: Booking[];
  finance: FinanceEntry[];
}

let isLocalFallback = false;

const getLocalData = (): AppData => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return JSON.parse(stored);
  
  const initialData: AppData = {
    users: INITIAL_USERS,
    customers: [],
    trips: [],
    bookings: [],
    finance: [],
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
  return initialData;
};

const saveLocalData = (data: AppData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const fetchAppData = async (): Promise<AppData> => {
  try {
    const res = await fetch(`${API_URL}/data`);
    if (!res.ok) throw new Error('Network response was not ok');
    
    isLocalFallback = false;
    const data = await res.json();
    
    if (data.users.length === 0) {
       for (const u of INITIAL_USERS) {
         await saveEntity('users', u);
         data.users.push(u);
       }
    }
    return data;
  } catch (error) {
    console.warn(`Backend API not reachable at ${API_URL}. Falling back to Local Storage mode.`);
    isLocalFallback = true;
    return getLocalData();
  }
};

export const saveEntity = async (type: string, entity: any) => {
  if (isLocalFallback) {
    const data = getLocalData();
    const list = data[type as keyof AppData] as any[];
    const index = list.findIndex(e => e.id === entity.id);
    
    if (index >= 0) {
      list[index] = entity;
    } else {
      list.push(entity);
    }
    
    saveLocalData(data);
    return;
  }

  try {
    await fetch(`${API_URL}/data/${type}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entity)
    });
  } catch (error) {
    console.error(`Failed to save ${type} entity`, error);
  }
};

export const deleteEntity = async (type: string, id: string) => {
  if (isLocalFallback) {
    const data = getLocalData();
    const list = data[type as keyof AppData] as any[];
    (data as any)[type] = list.filter(e => e.id !== id);
    saveLocalData(data);
    return;
  }

  try {
    await fetch(`${API_URL}/data/${type}/${id}`, {
      method: 'DELETE'
    });
  } catch (error) {
    console.error(`Failed to delete ${type} entity`, error);
  }
};
