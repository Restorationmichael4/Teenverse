import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

interface Post {
  id: number;
  userId: number;
  content: string;
  likes: number;
  createdAt: string;
}

const Home = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await axios.get('/api/posts/newsfeed');
      setPosts(res.data);
    } catch (err) {
      console.error('Error fetching posts:', err);
    }
  };

  return (
    <div style={containerStyle}>
      <h1 style={headingStyle}>News Feed</h1>
      <p style={textStyle}>Wagwan {user?.username}, welcome to your street feed.</p>

      {posts.length === 0 ? (
        <p>No posts yet, be the first to shake the timeline!</p>
      ) : (
        posts.map((post) => (
          <div key={post.id} style={postStyle}>
            <p>{post.content}</p>
            <span style={{ fontSize: '12px', color: '#aaa' }}>
              Likes: {post.likes} | Posted: {new Date(post.createdAt).toLocaleString()}
            </span>
          </div>
        ))
      )}
    </div>
  );
};

const containerStyle = {
  padding: '20px',
};

const headingStyle = {
  color: '#8E44AD',
  fontSize: '28px',
};

const textStyle = {
  marginBottom: '20px',
};

const postStyle = {
  backgroundColor: '#333',
  padding: '15px',
  borderRadius: '10px',
  marginBottom: '15px',
  color: '#fff',
};

export default Home;
