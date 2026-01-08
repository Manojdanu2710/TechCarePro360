import Service from '../models/Service.js';

// Get all services (Public - for booking form)
export const getServices = async (req, res) => {
  try {
    const services = await Service.find({ active: true })
      .sort({ category: 1, displayOrder: 1 });

    // Group by category
    const grouped = {
      amc: services.filter(s => s.category === 'amc'),
      homeIT: services.filter(s => s.category === 'homeIT')
    };

    res.status(200).json({
      success: true,
      message: 'Services fetched successfully',
      data: grouped
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching services'
    });
  }
};

// Get all services (Admin - includes inactive)
export const getAllServices = async (req, res) => {
  try {
    const services = await Service.find()
      .sort({ category: 1, displayOrder: 1 });

    res.status(200).json({
      success: true,
      message: 'Services fetched successfully',
      data: services
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching services'
    });
  }
};

// Get service by ID
export const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Service fetched successfully',
      data: service
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching service'
    });
  }
};

// Create service
export const createService = async (req, res) => {
  try {
    const { name, description, category, price, basePrice, currency, active, displayOrder } = req.body;

    // Validation
    if (!name || !category || !price) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, category, and price'
      });
    }

    if (!['amc', 'homeIT'].includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Category must be either "amc" or "homeIT"'
      });
    }

    const service = await Service.create({
      name,
      description,
      category,
      price,
      basePrice: basePrice || 0,
      currency: currency || 'INR',
      active: active !== undefined ? active : true,
      displayOrder: displayOrder || 0
    });

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: service
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating service'
    });
  }
};

// Update service
export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate category if provided
    if (updateData.category && !['amc', 'homeIT'].includes(updateData.category)) {
      return res.status(400).json({
        success: false,
        message: 'Category must be either "amc" or "homeIT"'
      });
    }

    const service = await Service.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      data: service
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating service'
    });
  }
};

// Delete service
export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findByIdAndDelete(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Service deleted successfully',
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting service'
    });
  }
};
