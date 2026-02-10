import { User, Customer, Trip, Booking, FinanceEntry } from './types';

/**
 * API base URL
 * Must point to your BACKEND (Railway), not the database.
 * Example:
 * VITE_API_URL=https://avenue-backend-production.up.railway.app/api
 */
const API_URL = import.meta.env.VITE_API_URL;

export interface AppData {
  users: User[];
  customers: Customer[];
  trips: Trip[];
  bookings: Booking[];
  finance: FinanceEntry[];
}

/**
 * Fetch all application data from backend
 */
export const fetchAppData = async (): Promise<AppData> => {
  const res = await fetch(`${API_URL}/data`, {
    headers: {
      'Content-Type': 'application/json',
      // add auth later
      // Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch app data');
  }

  return res.json();
};

/**
 * Create or update an entity
 */
export const saveEntity = async <T>(
  type: keyof AppData,
  entity: T
): Promise<void> => {
  const res = await fetch(`${API_URL}/${type}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(entity),
  });

  if (!res.ok) {
    throw new Error(`Failed to save ${type}`);
  }
};

/**
 * Delete an entity
 */
export const deleteEntity = async (
  type: keyof AppData,
  id: string
): Promise<void> => {
  const res = await fetch(`${API_URL}/${type}/${id}`, {
    method: 'DELETE',
    headers: {
      // Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to delete ${type}`);
  }
};