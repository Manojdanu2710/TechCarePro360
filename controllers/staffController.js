import Staff from '../models/Staff.js';

// Get all staff
export const getAllStaff = async (req, res) => {
  try {
    const staff = await Staff.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Staff fetched successfully',
      data: staff
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching staff'
    });
  }
};

// Create a new staff member
export const createStaff = async (req, res) => {
  try {
    const { name, phone, email, location, skills, active } = req.body;

    // Validation
    if (!name || !phone || !location) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, phone, location'
      });
    }

    const staff = await Staff.create({
      name,
      phone,
      email,
      location,
      skills: skills || [],
      active: active !== undefined ? active : true
    });

    res.status(201).json({
      success: true,
      message: 'Staff member created successfully',
      data: staff
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating staff member'
    });
  }
};

// Update staff member
export const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const staff = await Staff.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Staff member updated successfully',
      data: staff
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating staff member'
    });
  }
};

// Delete staff member
export const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;

    const staff = await Staff.findByIdAndDelete(id);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Staff member deleted successfully',
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting staff member'
    });
  }
};

// Get staff by ID
export const getStaffById = async (req, res) => {
  try {
    const { id } = req.params;

    const staff = await Staff.findById(id);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Staff member fetched successfully',
      data: staff
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching staff member'
    });
  }
};

