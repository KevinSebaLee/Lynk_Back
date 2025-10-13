import express from 'express';
import * as categoryService from '../services/categoryService.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const categories = await categoryService.getAllCategories();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

export default router;
