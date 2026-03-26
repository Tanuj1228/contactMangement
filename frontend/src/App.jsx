import { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { User, Mail, Phone, Edit2, Trash2, Plus, Star, Download, Upload, Search, LogOut, QrCode, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;
const CATEGORIES = ['General', 'Work', 'Family', 'Friends'];

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

  const handleLogin = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <Routes>
      <Route path="/login" element={!token ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
      <Route path="/register" element={!token ? <Register onLogin={handleLogin} /> : <Navigate to="/" />} />
      <Route path="/" element={token ? <Dashboard token={token} user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
    </Routes>
  );
}

function Login({ onLogin }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/auth/login`, formData);
      onLogin(res.data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-96">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">Login</h2>
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" placeholder="Email" required className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-400" onChange={e => setFormData({...formData, email: e.target.value})} />
          <input type="password" placeholder="Password" required className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-400" onChange={e => setFormData({...formData, password: e.target.value})} />
          <button className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700">Login</button>
        </form>
        <p className="text-center text-sm mt-4">Don't have an account? <span className="text-blue-600 cursor-pointer" onClick={() => navigate('/register')}>Register</span></p>
      </div>
    </div>
  );
}

function Register({ onLogin }) {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/auth/register`, formData);
      onLogin(res.data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-96">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">Register</h2>
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Name" required className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-400" onChange={e => setFormData({...formData, name: e.target.value})} />
          <input type="email" placeholder="Email" required className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-400" onChange={e => setFormData({...formData, email: e.target.value})} />
          <input type="password" placeholder="Password" required className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-400" onChange={e => setFormData({...formData, password: e.target.value})} />
          <button className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700">Register</button>
        </form>
        <p className="text-center text-sm mt-4">Already have an account? <span className="text-blue-600 cursor-pointer" onClick={() => navigate('/login')}>Login</span></p>
      </div>
    </div>
  );
}

function Dashboard({ token, user, onLogout }) {
  const [contacts, setContacts] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', category: 'General', isFavorite: false });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [showFavorites, setShowFavorites] = useState(false);
  const [selectedQR, setSelectedQR] = useState(null);
  const fileInputRef = useRef(null);

  const authAxios = axios.create({
    baseURL: `${API_URL}/contacts`,
    headers: { 'x-auth-token': token }
  });

  useEffect(() => {
    fetchContacts();
  }, [searchTerm, filterCategory, showFavorites]);

  const fetchContacts = async () => {
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (filterCategory !== 'All') params.append('category', filterCategory);
    if (showFavorites) params.append('favorites', 'true');
    const res = await authAxios.get(`?${params.toString()}`);
    setContacts(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await authAxios.put(`/${editingId}`, formData);
    } else {
      await authAxios.post('/', formData);
    }
    setFormData({ name: '', email: '', phone: '', category: 'General', isFavorite: false });
    setEditingId(null);
    fetchContacts();
  };

  const handleEdit = (contact) => {
    setFormData({ name: contact.name, email: contact.email, phone: contact.phone, category: contact.category || 'General', isFavorite: contact.isFavorite || false });
    setEditingId(contact._id);
  };

  const handleDelete = async (id) => {
    await authAxios.delete(`/${id}`);
    fetchContacts();
  };

  const toggleFavorite = async (contact) => {
    await authAxios.put(`/${contact._id}`, { ...contact, isFavorite: !contact.isFavorite });
    fetchContacts();
  };

  const exportCSV = () => {
    const headers = ['Name,Email,Phone,Category,Favorite\n'];
    const csvData = contacts.map(c => `"${c.name}","${c.email}","${c.phone}","${c.category || 'General'}","${c.isFavorite || false}"`).join('\n');
    const blob = new Blob([headers + csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contacts.csv';
    a.click();
  };

  const importCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const rows = text.split('\n').slice(1);
      const newContacts = rows.filter(row => row.trim() !== '').map(row => {
        const cols = row.split(',').map(c => c.replace(/(^"|"$)/g, ''));
        return { name: cols[0], email: cols[1], phone: cols[2], category: cols[3], isFavorite: cols[4] === 'true' };
      });
      await authAxios.post('/bulk', newContacts);
      fetchContacts();
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const generateVCard = (contact) => {
    return `BEGIN:VCARD\nVERSION:3.0\nFN:${contact.name}\nEMAIL:${contact.email}\nTEL:${contact.phone}\nCATEGORIES:${contact.category}\nEND:VCARD`;
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-gray-50 text-gray-900 font-sans relative">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-600">Contact Manager</h1>
            <p className="text-gray-500 text-sm">Welcome, {user?.name}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={importCSV} />
            <button onClick={() => fileInputRef.current.click()} className="flex items-center gap-2 bg-white border px-4 py-2 rounded-lg hover:bg-gray-50 transition shadow-sm text-sm">
              <Upload size={16} /> Import
            </button>
            <button onClick={exportCSV} className="flex items-center gap-2 bg-white border px-4 py-2 rounded-lg hover:bg-gray-50 transition shadow-sm text-sm">
              <Download size={16} /> Export
            </button>
            <button onClick={onLogout} className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-100 px-4 py-2 rounded-lg hover:bg-red-100 transition shadow-sm text-sm">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <input type="text" placeholder="Name" required className="col-span-1 md:col-span-2 border p-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            <input type="email" placeholder="Email" required className="col-span-1 md:col-span-2 border p-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            <input type="tel" placeholder="Phone" required className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            <select className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none bg-white" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <button type="submit" className="col-span-1 md:col-span-6 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 mt-2">
              {editingId ? <Edit2 size={18} /> : <Plus size={18} />} {editingId ? 'Update Contact' : 'Add New Contact'}
            </button>
          </form>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input type="text" placeholder="Search contacts..." className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <select className="border px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none bg-white" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="All">All Categories</option>
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <button onClick={() => setShowFavorites(!showFavorites)} className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition ${showFavorites ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 'bg-white hover:bg-gray-50'}`}>
            <Star size={18} className={showFavorites ? "fill-yellow-400 text-yellow-400" : "text-gray-400"} /> Favorites
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contacts.map(contact => (
            <div key={contact._id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition relative group">
              <button onClick={() => toggleFavorite(contact)} className="absolute top-4 right-4 focus:outline-none z-10">
                <Star size={20} className={`transition ${contact.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}`} />
              </button>
              <button onClick={() => setSelectedQR(contact)} className="absolute top-4 right-12 text-gray-300 hover:text-blue-500 transition z-10 focus:outline-none">
                <QrCode size={20} />
              </button>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                  <User size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{contact.name}</h3>
                  <span className="text-xs font-medium bg-gray-100 px-2 py-1 rounded-full text-gray-600">{contact.category}</span>
                </div>
              </div>
              <div className="space-y-3 text-gray-600 text-sm mb-6">
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-gray-400" />
                  <a href={`mailto:${contact.email}`} className="hover:text-blue-600 truncate">{contact.email}</a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-gray-400" />
                  <a href={`tel:${contact.phone}`} className="hover:text-blue-600">{contact.phone}</a>
                </div>
              </div>
              <div className="flex gap-2 pt-4 border-t border-gray-50">
                <button onClick={() => handleEdit(contact)} className="flex-1 flex justify-center items-center gap-2 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition">
                  <Edit2 size={16} /> Edit
                </button>
                <button onClick={() => handleDelete(contact._id)} className="flex-1 flex justify-center items-center gap-2 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-red-50 hover:text-red-600 transition">
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          ))}
          {contacts.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-100 border-dashed">
              No contacts found matching your criteria.
            </div>
          )}
        </div>

        {selectedQR && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-xl relative shadow-2xl flex flex-col items-center">
              <button onClick={() => setSelectedQR(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
                <X size={24} />
              </button>
              <h3 className="text-xl font-bold mb-6 text-gray-800">Scan to Save Contact</h3>
              <div className="bg-white p-4 border rounded-xl shadow-sm mb-4">
                <QRCodeSVG value={generateVCard(selectedQR)} size={200} level="H" />
              </div>
              <p className="text-gray-600 font-medium">{selectedQR.name}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}