import express from 'express';
import db from '../database'; // should be correct if in routes/
const router = express.Router();

router.get('/newsfeed', async (req, res) => {
  try {
    const posts = await db.all(
      `SELECT * FROM posts WHERE mode = 'main' ORDER BY createdAt DESC`
    );
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

export default router;
