import express from 'express';
import db from '../db'; // or wherever your SQLite setup is
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
