
import { User, Customer, Trip, Booking, FinanceEntry } from './types';

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

  const emptyData: AppData = {
    users: [],
    customers: [],
    trips: [],
    bookings: [],
    finance: [],
  };

  saveAppData(emptyData);
  return emptyData;
};

export const saveAppData = (data: AppData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};
