import express from 'express';
import SupportTicket from '../models/SupportTicket.js';
import { protect } from '../middleware/auth.js';
import { adminOnly } from '../middleware/admin.js';

import User from '../models/User.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// POST /api/support — Create a new support ticket
router.post('/', protect, async (req, res) => {
  try {
    const { subject, category, message, priority } = req.body;
    if (!subject || !message) {
      return res.status(400).json({ message: 'Subject and message are required.' });
    }
    const ticket = await SupportTicket.create({
      user: req.user.id,
      subject,
      category: category || 'general_query',
      messages: [{ sender: 'user', text: message }],
      priority: priority || 'medium',
    });

    // Notify Admin
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await Notification.create({
        user: admin._id,
        message: `New support ticket raised: ${subject}`,
        type: 'general'
      });
    }

    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create ticket', error: err.message });
  }
});

// GET /api/support/my-tickets — Get all tickets for logged-in user
router.get('/my-tickets', protect, async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tickets' });
  }
});

// GET /api/support/all — Admin: get all tickets
router.get('/all', protect, adminOnly, async (req, res) => {
  try {
    const tickets = await SupportTicket.find()
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tickets' });
  }
});

// PUT /api/support/:id/reply — Admin: reply + update status
router.put('/:id/reply', protect, adminOnly, async (req, res) => {
  try {
    const { adminReply, status } = req.body;
    const ticket = await SupportTicket.findById(req.params.id);
    
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    ticket.messages.push({
      sender: 'admin',
      text: adminReply,
      timestamp: new Date()
    });
    
    if (status) ticket.status = status;
    else ticket.status = 'resolved';
    
    ticket.repliedAt = new Date();
    await ticket.save();

    // Notify User
    await Notification.create({
      user: ticket.user,
      message: `Admin replied to your ticket: ${ticket.subject}`,
      type: 'general'
    });

    res.json(ticket);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update ticket' });
  }
});

// POST /api/support/:id/message — Send follow-up message (User or Admin)
router.post('/:id/message', protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Message text is required.' });

    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found.' });

    // Authorization check
    if (req.user.role !== 'admin' && ticket.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to message this ticket.' });
    }

    const senderRole = req.user.role === 'admin' ? 'admin' : 'user';
    ticket.messages.push({
      sender: senderRole,
      text,
      timestamp: new Date()
    });

    if (senderRole === 'admin') {
      ticket.status = 'in_review'; // Admin responding often means it's under review
      ticket.repliedAt = new Date();
    } else {
      ticket.status = 'open'; // User follow-up puts it back to open
    }

    await ticket.save();

    // Notify the other party
    if (senderRole === 'user') {
      const admins = await User.find({ role: 'admin' });
      for (const admin of admins) {
        await Notification.create({
          user: admin._id,
          message: `New message on ticket: ${ticket.subject}`,
          type: 'general'
        });
      }
    } else {
      await Notification.create({
        user: ticket.user,
        message: `New admin message on ticket: ${ticket.subject}`,
        type: 'general'
      });
    }

    res.json(ticket);
  } catch (err) {
    res.status(500).json({ message: 'Failed to send message', error: err.message });
  }
});

// PUT /api/support/:id/close — User: close their own ticket
router.put('/:id/close', protect, async (req, res) => {
  try {
    const ticket = await SupportTicket.findOne({ _id: req.params.id, user: req.user.id });
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    ticket.status = 'closed';
    await ticket.save();
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ message: 'Failed to close ticket' });
  }
});

export default router;
