
import { User, Customer, Trip, Booking, FinanceEntry } from './types';
import { INITIAL_USERS, MOCK_CUSTOMERS, MOCK_TRIPS, MOCK_BOOKINGS, MOCK_FINANCE } from './constants';

const STORAGE_KEY = 'avenue_app_data';

interface AppData {
  users: User[];
  customers: Customer[];
  trips: Trip[];
  bookings: Booking[];
  finance: FinanceEntry[];
}

export const getAppData = (): AppData => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return JSON.parse(stored);
  
  const initialData: AppData = {
    users: INITIAL_USERS, // Store full user objects including initial passwords
    customers: MOCK_CUSTOMERS,
    trips: MOCK_TRIPS,
    bookings: MOCK_BOOKINGS,
    finance: MOCK_FINANCE,
  };
  saveAppData(initialData);
  return initialData;
};

export const saveAppData = (data: AppData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};
