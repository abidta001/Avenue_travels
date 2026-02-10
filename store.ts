
import { User, Customer, Trip, Booking, FinanceEntry } from './types';
import { INITIAL_USERS } from './constants';

// For production, change this to your deployed backend URL
const API_URL = 'http://localhost:3001/api';

export interface AppData {
  users: User[];
  customers: Customer[];
  trips: Trip[];
  bookings: Booking[];
  finance: FinanceEntry[];
}

// Fetch all application data from the PostgreSQL backend
export const fetchAppData = async (): Promise<AppData> => {
  try {
    const res = await fetch(`${API_URL}/data`);
    if (!res.ok) throw new Error('Network response was not ok');
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
    console.error("Failed to connect to the backend database. Ensure server.js is running.", error);
    // Return empty fallback state to prevent UI crashes if server is offline
    return { users: INITIAL_USERS, customers: [], trips: [], bookings: [], finance: [] };
  }
};

// Insert or update an entity in the PostgreSQL database
export const saveEntity = async (type: string, entity: any) => {
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

// Delete an entity from the PostgreSQL database
export const deleteEntity = async (type: string, id: string) => {
  try {
    await fetch(`${API_URL}/data/${type}/${id}`, {
      method: 'DELETE'
    });
  } catch (error) {
    console.error(`Failed to delete ${type} entity`, error);
  }
};
