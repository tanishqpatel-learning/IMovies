import Theatre from '../models/Theatre.js';

// @desc  Get all theatres
// @route GET /api/theatres
export const getTheatres = async (req, res, next) => {
  try {
    const { city, page = 1, limit = 20 } = req.query;
    const filter = { isActive: true };
    if (city) filter['address.city'] = { $regex: city, $options: 'i' };

    const skip = (page - 1) * limit;
    const [theatres, total] = await Promise.all([
      Theatre.find(filter).skip(skip).limit(Number(limit)).sort({ name: 1 }),
      Theatre.countDocuments(filter),
    ]);

    res.json({ success: true, data: theatres, total });
  } catch (error) {
    next(error);
  }
};

// @desc  Get theatre by ID
// @route GET /api/theatres/:id
export const getTheatreById = async (req, res, next) => {
  try {
    const theatre = await Theatre.findById(req.params.id);
    if (!theatre) return res.status(404).json({ success: false, message: 'Theatre not found' });
    res.json({ success: true, data: theatre });
  } catch (error) {
    next(error);
  }
};

// @desc  Admin: Create theatre
// @route POST /api/theatres
export const createTheatre = async (req, res, next) => {
  try {
    const theatre = await Theatre.create({ ...req.body, admin: req.user.id });
    res.status(201).json({ success: true, data: theatre });
  } catch (error) {
    next(error);
  }
};

// @desc  Admin: Update theatre
// @route PUT /api/theatres/:id
export const updateTheatre = async (req, res, next) => {
  try {
    const theatre = await Theatre.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!theatre) return res.status(404).json({ success: false, message: 'Theatre not found' });
    res.json({ success: true, data: theatre });
  } catch (error) {
    next(error);
  }
};

// @desc  Admin: Delete theatre
// @route DELETE /api/theatres/:id
export const deleteTheatre = async (req, res, next) => {
  try {
    const theatre = await Theatre.findByIdAndDelete(req.params.id);
    if (!theatre) return res.status(404).json({ success: false, message: 'Theatre not found' });
    res.json({ success: true, message: 'Theatre deleted' });
  } catch (error) {
    next(error);
  }
};
