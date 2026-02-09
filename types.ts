
export enum TripStatus {
  UPCOMING = 'Upcoming',
  ONGOING = 'Ongoing',
  COMPLETED = 'Completed'
}

export enum PaymentStatus {
  PAID = 'Paid',
  PARTIAL = 'Partial',
  PENDING = 'Pending'
}

export enum PaymentMethod {
  CASH = 'Cash',
  UPI = 'UPI',
  CARD = 'Card'
}

export enum TransportType {
  BUS = 'Bus',
  TRAIN = 'Train',
  FLIGHT = 'Flight'
}

export enum FinanceType {
  INCOME = 'Income',
  EXPENSE = 'Expense'
}

export enum ServiceCategory {
  BOOKING = 'Trip Booking',
  PASSPORT = 'Passport Service',
  VISA = 'Visa Assistance',
  TICKET = 'Flight Ticket',
  INSURANCE = 'Travel Insurance',
  CURRENCY_EXCHANGE = 'Currency Exchange',
  OTHER = 'Other Service'
}

export interface User {
  id: string;
  username: string;
  password?: string;
  email: string;
  phone: string;
  profilePic: string;
  lastLogin?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  idProof?: string;
  notes?: string;
}

export interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  transport: TransportType;
  hotelDetails: string;
  costPerPerson: number;
  agencyProfit: number; 
  totalSeats: number;
  status: TripStatus;
  imageUrl?: string;
}

export interface Booking {
  id: string;
  customerId: string;
  tripId: string;
  bookingDate: string;
  numPersons: number;
  serviceFee: number; 
  totalAmount: number;
  paidAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
}

export interface FinanceEntry {
  id: string;
  type: FinanceType;
  category: ServiceCategory | string;
  amount: number; // Total amount collected
  baseAmount?: number; // Cost or exchange base
  profitAmount?: number; // Service fee or exchange profit
  date: string;
  tripId?: string;
  description: string;
  paymentMethod?: PaymentMethod;
  clientName?: string;
  clientContact?: string;
  invoiceNumber?: string;
}
