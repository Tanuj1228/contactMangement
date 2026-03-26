require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Contact = require('./models/Contact');
const User = require('./models/User');
const auth = require('./middleware/auth');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    user = new User({ name, email, password });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    const payload = { user: { id: user.id } };
    
    // Check if JWT_SECRET exists to avoid 500 errors
    if (!process.env.JWT_SECRET) {
        console.error("FATAL ERROR: JWT_SECRET is not defined in .env");
        return res.status(500).json({ msg: 'Server configuration error' });
    }

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    });
  } catch (err) {
    console.error("Registration Error:", err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

    const payload = { user: { id: user.id } };
    
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    });
  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Contact Routes (Protected)
app.get('/api/contacts', auth, async (req, res) => {
  const { search, category, favorites } = req.query;
  let query = { user: req.user.id };
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } }
    ];
  }
  if (category && category !== 'All') query.category = category;
  if (favorites === 'true') query.isFavorite = true;

  try {
    const contacts = await Contact.find(query).sort({ createdAt: -1 });
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

app.post('/api/contacts', auth, async (req, res) => {
  try {
    const newContact = new Contact({ ...req.body, user: req.user.id });
    await newContact.save();
    res.json(newContact);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

app.post('/api/contacts/bulk', auth, async (req, res) => {
  try {
    const contactsWithUser = req.body.map(c => ({ ...c, user: req.user.id }));
    const contacts = await Contact.insertMany(contactsWithUser);
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/contacts/:id', auth, async (req, res) => {
  try {
    let contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ msg: 'Contact not found' });
    if (contact.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    contact = await Contact.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(contact);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

app.delete('/api/contacts/:id', auth, async (req, res) => {
  try {
    let contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ msg: 'Contact not found' });
    if (contact.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    await Contact.findByIdAndDelete(req.params.id);
    res.json({ message: 'Contact deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));  