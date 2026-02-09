
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MapPin, Calendar, Users as UsersIcon, Train, Plane, Bus, ArrowRight, Trash2, AlertTriangle, Edit, Image as ImageIcon, TrendingUp } from 'lucide-react';
import { Trip, TripStatus, TransportType } from '../types';

interface TripsProps {
  trips: Trip[];
  onAdd: (t: Omit<Trip, 'id'>) => void;
  onUpdate: (t: Trip) => void;
  onDelete: (id: string) => void;
}

const Trips: React.FC<TripsProps> = ({ trips, onAdd, onUpdate, onDelete }) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [tripToDelete, setTripToDelete] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      destination: formData.get('destination') as string,
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string,
      transport: formData.get('transport') as TransportType,
      hotelDetails: formData.get('hotelDetails') as string,
      costPerPerson: Number(formData.get('costPerPerson')),
      agencyProfit: Number(formData.get('agencyProfit')),
      totalSeats: Number(formData.get('totalSeats')),
      status: formData.get('status') as TripStatus,
      imageUrl: formData.get('imageUrl') as string || undefined,
    };

    if (editingTrip) {
      onUpdate({ ...data, id: editingTrip.id });
    } else {
      onAdd(data);
    }
    setIsModalOpen(false);
    setEditingTrip(null);
  };

  const confirmDelete = () => {
    if (tripToDelete) {
      onDelete(tripToDelete);
      setTripToDelete(null);
    }
  };

  const getTransportIcon = (type: TransportType) => {
    switch (type) {
      case TransportType.BUS: return <Bus size={16} />;
      case TransportType.TRAIN: return <Train size={16} />;
      case TransportType.FLIGHT: return <Plane size={16} />;
      default: return <Bus size={16} />;
    }
  };

  const getStatusColor = (status: TripStatus) => {
    switch (status) {
      case TripStatus.UPCOMING: return 'bg-blue-100 text-blue-700';
      case TripStatus.ONGOING: return 'bg-orange-100 text-orange-700';
      case TripStatus.COMPLETED: return 'bg-green-100 text-green-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getTripImage = (trip: Trip) => {
    if (trip.imageUrl && trip.imageUrl.trim() !== '') return trip.imageUrl;
    const keywords = trip.destination.split(',')[0].trim().replace(/\s+/g, ',');
    return `https://loremflickr.com/800/400/${keywords},travel,nature?lock=${trip.id}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800">Trip Packages</h3>
        <button
          onClick={() => { setEditingTrip(null); setIsModalOpen(true); }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={18} className="mr-2" />
          Create Trip
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {trips.map((trip) => (
          <div key={trip.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden group hover:border-blue-200 transition-colors relative">
            <div className="h-48 bg-slate-200 relative overflow-hidden">
               <img 
                 src={getTripImage(trip)} 
                 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                 alt={trip.destination}
                 onError={(e) => {
                   (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80`;
                 }}
               />
               <div className="absolute top-4 right-4 flex space-x-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(trip.status)} shadow-sm`}>
                    {trip.status}
                  </span>
                  <button 
                    onClick={() => setTripToDelete(trip.id)}
                    className="p-1.5 bg-white/80 backdrop-blur-md text-red-600 rounded-full hover:bg-red-50 hover:text-red-700 transition-colors shadow-sm opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
               </div>
               <div className="absolute bottom-4 left-4 text-white">
                  <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-lg flex items-center text-xs font-medium">
                    <MapPin size={12} className="mr-1" /> {trip.destination}
                  </div>
               </div>
            </div>
            
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{trip.name}</h3>
                  <div className="flex items-center text-sm text-slate-500 mt-1">
                    <Calendar size={14} className="mr-1" />
                    {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">Package Total</p>
                  <p className="text-xl font-black text-blue-600">₹{(trip.costPerPerson + trip.agencyProfit).toLocaleString()}</p>
                  <p className="text-[10px] text-slate-400 font-bold">(Base: ₹{trip.costPerPerson} + Profit: ₹{trip.agencyProfit})</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 py-4 border-y border-slate-50 mb-4">
                <div className="text-center">
                  <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Transport</p>
                  <div className="flex items-center justify-center text-slate-700">
                    {getTransportIcon(trip.transport)}
                    <span className="ml-1 text-xs font-medium">{trip.transport}</span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Capacity</p>
                  <div className="flex items-center justify-center text-slate-700">
                    <UsersIcon size={16} />
                    <span className="ml-1 text-xs font-medium">{trip.totalSeats} Pax</span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Hotel</p>
                  <div className="flex items-center justify-center text-slate-700">
                    <span className="text-xs font-medium truncate px-2">{trip.hotelDetails}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <button 
                  onClick={() => { setEditingTrip(trip); setIsModalOpen(true); }}
                  className="flex items-center text-sm font-medium text-slate-500 hover:text-blue-600"
                >
                  <Edit size={14} className="mr-1" /> Edit Package
                </button>
                {trip.status !== TripStatus.COMPLETED ? (
                  <button 
                    onClick={() => navigate('/bookings', { state: { tripId: trip.id } })}
                    className="flex items-center px-4 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-600 hover:text-white transition-all"
                  >
                    Book Now <ArrowRight size={16} className="ml-1" />
                  </button>
                ) : (
                  <span className="text-xs font-bold text-slate-400 italic">Booking Closed</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800">
                {editingTrip ? 'Update Trip Package' : 'Create New Package'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <Plus size={20} className="rotate-45" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-600 mb-1 uppercase text-xs">Trip Name</label>
                  <input name="name" defaultValue={editingTrip?.name} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1 uppercase text-xs">Destination</label>
                  <input name="destination" defaultValue={editingTrip?.destination} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none" placeholder="e.g. Munnar, Kerala" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1 uppercase text-xs">Transport</label>
                  <select name="transport" defaultValue={editingTrip?.transport || TransportType.BUS} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none">
                    <option value={TransportType.BUS}>Bus</option>
                    <option value={TransportType.TRAIN}>Train</option>
                    <option value={TransportType.FLIGHT}>Flight</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1 uppercase text-xs">Start Date</label>
                  <input name="startDate" type="date" defaultValue={editingTrip?.startDate} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1 uppercase text-xs">End Date</label>
                  <input name="endDate" type="date" defaultValue={editingTrip?.endDate} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none" />
                </div>
                
                <div className="p-4 bg-blue-50 rounded-xl md:col-span-2 border border-blue-100">
                  <h4 className="text-xs font-black text-blue-800 uppercase mb-3 flex items-center">
                    <TrendingUp size={14} className="mr-1" /> Pricing Structure
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Base Cost (per person)</label>
                      <input name="costPerPerson" type="number" defaultValue={editingTrip?.costPerPerson || 0} required className="w-full p-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-1">Agency Profit (per person)</label>
                      <input name="agencyProfit" type="number" defaultValue={editingTrip?.agencyProfit || 0} required className="w-full p-2 bg-white border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold text-blue-600" />
                    </div>
                  </div>
                  <p className="text-[10px] text-blue-500 mt-2 font-medium">This profit margin will be automatically applied to all bookings for this trip.</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1 uppercase text-xs">Total Seats</label>
                  <input name="totalSeats" type="number" defaultValue={editingTrip?.totalSeats} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1 uppercase text-xs">Hotel Details</label>
                  <input name="hotelDetails" defaultValue={editingTrip?.hotelDetails} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-600 mb-1 uppercase text-xs">Status</label>
                  <select name="status" defaultValue={editingTrip?.status || TripStatus.UPCOMING} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none">
                    <option value={TripStatus.UPCOMING}>Upcoming</option>
                    <option value={TripStatus.ONGOING}>Ongoing</option>
                    <option value={TripStatus.COMPLETED}>Completed</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-600 mb-1 uppercase text-xs flex items-center"><ImageIcon size={14} className="mr-1" /> Image URL (Optional)</label>
                  <input name="imageUrl" defaultValue={editingTrip?.imageUrl} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none" placeholder="https://..." />
                </div>
              </div>
              <div className="pt-6 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg">Cancel</button>
                <button type="submit" className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg font-bold">
                  {editingTrip ? 'Save Package Changes' : 'Publish Trip Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {tripToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-6 text-center animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Remove Trip?</h3>
            <p className="text-sm text-slate-500 mb-6">Are you sure you want to delete this trip package?</p>
            <div className="flex space-x-3">
              <button onClick={() => setTripToDelete(null)} className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors shadow-sm">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trips;
