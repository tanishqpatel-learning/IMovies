import express from 'express';
import { protect, adminOnly } from '../middleware/auth.middleware.js';
import {
  getDashboardStats, getAllUsers, toggleUserStatus, updateUserRole,
  searchOmdb, importOmdbMovie,
} from '../controllers/admin.controller.js';

const router = express.Router();

router.use(protect, adminOnly);

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/toggle', toggleUserStatus);
router.put('/users/:id/role', updateUserRole);

// OMDb movie import routes
router.get('/omdb/search', searchOmdb);
router.post('/omdb/import', importOmdbMovie);

export default router;

