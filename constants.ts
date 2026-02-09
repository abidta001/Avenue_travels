
import { TripStatus, TransportType, FinanceType, PaymentStatus } from './types';

// Encoded or hosted version of the provided Avenue logo
export const LOGO_URL = "https://i.ibb.co/0V8N0f2/avenue-logo.png"; 

export const INITIAL_USERS = [
  {
    id: '1',
    username: 'Anaswara',
    password: 'Avenue@2026',
    email: 'anaswara@avenue.com',
    phone: '+91 9876543210',
    profilePic: 'https://picsum.photos/seed/anaswara/200'
  },
  {
    id: '2',
    username: 'Preethi',
    password: 'Avenue@0000',
    email: 'preethi@avenue.com',
    phone: '+91 8876543211',
    profilePic: 'https://picsum.photos/seed/preethi/200'
  }
];

export const MOCK_CUSTOMERS = [
  { id: 'c1', name: 'John Doe', phone: '9998887776', email: 'john@example.com', address: '123 Kerala St', notes: 'Frequent traveler' },
  { id: 'c2', name: 'Alice Smith', phone: '8887776665', email: 'alice@example.com', address: '456 Cochin Rd' }
];

export const MOCK_TRIPS = [
  { 
    id: 't1', 
    name: 'Munnar Bliss', 
    destination: 'Munnar, Kerala', 
    startDate: '2024-06-10', 
    endDate: '2024-06-15', 
    transport: TransportType.BUS, 
    hotelDetails: 'Cloud 9 Resort', 
    costPerPerson: 4500, 
    agencyProfit: 500,
    totalSeats: 20, 
    status: TripStatus.UPCOMING 
  },
  { 
    id: 't2', 
    name: 'Varkala Beach Tour', 
    destination: 'Varkala, Kerala', 
    startDate: '2024-05-20', 
    endDate: '2024-05-25', 
    transport: TransportType.TRAIN, 
    hotelDetails: 'Ocean View Residency', 
    costPerPerson: 3500, 
    agencyProfit: 400,
    totalSeats: 15, 
    status: TripStatus.ONGOING 
  }
];

export const MOCK_BOOKINGS = [
  { id: 'b1', customerId: 'c1', tripId: 't1', bookingDate: '2024-05-01', numPersons: 2, serviceFee: 500, totalAmount: 10000, paidAmount: 5000, paymentStatus: PaymentStatus.PARTIAL },
  { id: 'b2', customerId: 'c2', tripId: 't1', bookingDate: '2024-05-05', numPersons: 1, serviceFee: 500, totalAmount: 5000, paidAmount: 5000, paymentStatus: PaymentStatus.PAID }
];

export const MOCK_FINANCE = [
  { id: 'f1', type: FinanceType.INCOME, category: 'Booking', amount: 5000, date: '2024-05-01', tripId: 't1', description: 'Advance payment for John' },
  { id: 'f2', type: FinanceType.EXPENSE, category: 'Vehicle Fuel', amount: 2000, date: '2024-05-10', tripId: 't1', description: 'Petrol for mini bus' },
  { id: 'f3', type: FinanceType.INCOME, category: 'Booking', amount: 5000, date: '2024-05-05', tripId: 't1', description: 'Full payment for Alice' }
];
