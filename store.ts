
import { User, Customer, Trip, Booking, FinanceEntry } from './types';
import { INITIAL_USERS } from './constants';

// ============================================================================
// DEPLOYMENT INSTRUCTIONS:
// Once you deploy your backend/server.js folder to Railway, copy the URL 
// Railway gives you and paste it here instead of localhost.
// Example: const API_URL = 'https://avenue-backend-production.up.railway.app/api';
// ============================================================================
const API_URL = 'postgresql://postgres:ZtTMhsYIRLQArCFcsxYIQNFYSFneJxZj@postgres.railway.internal:5432/railway/api';
const STORAGE_KEY = 'avenue_app_data_fallback';

export interface AppData {
  users: User[];
  customers: Customer[];
  trips: Trip[];
  bookings: Booking[];
  finance: FinanceEntry[];
}

// Track whether we are running in local fallback mode
let isLocalFallback = false;

// --- LOCAL STORAGE FALLBACK LOGIC ---
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

// --- API CLIENT LOGIC ---

// Fetch all application data
export const fetchAppData = async (): Promise<AppData> => {
  try {
    const res = await fetch(`${API_URL}/data`);
    if (!res.ok) throw new Error('Network response was not ok');
    
    // Connection successful, ensure we are not in fallback mode
    isLocalFallback = false;
    const data = await res.json();
    
    // Seed initial admin users if the database is completely empty
    if (data.users.length === 0) {
       for (const u of INITIAL_USERS) {
         await saveEntity('users', u);
         data.users.push(u);
       }
    }
    return data;
  } catch (error) {
    console.warn("Backend API not reachable. Falling back to Local Storage mode for preview.");
    isLocalFallback = true;
    return getLocalData();
  }
};

// Insert or update an entity
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

// Delete an entity
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
