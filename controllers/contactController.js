import Contact from '../models/Contact.js';

// Create a new contact message
export const createContact = async (req, res) => {
  try {
    const { name, phone, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, message'
      });
    }

    const contact = await Contact.create({
      name,
      phone,
      email,
      subject,
      message
    });

    res.status(201).json({
      success: true,
      message: 'Contact message sent successfully',
      data: contact
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error sending message'
    });
  }
};

// Get all contact messages (Admin)
export const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Contact messages fetched successfully',
      data: contacts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching contact messages'
    });
  }
};

