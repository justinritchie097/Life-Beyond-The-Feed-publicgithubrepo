import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from './lib/supabaseClient';
import './CreatePost.css';

const CreatePost = ({ session }) => {
  const navigate = useNavigate();
  const displayName =
    session.user.user_metadata?.username ||
    session.user.email?.split('@')[0] ||
    'Anonymous';
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Please fill out both the title and content fields.');
      return;
    }

    setLoading(true);

    // Insert the new post into Supabase
    const { error } = await supabase.from('posts').insert([
      {
        title: title.trim(),
        content: content.trim() || null,
        image_url: imageUrl.trim() || null,
        upvotes: 0, // Starts at 0 upvotes
        user_id: session.user.id,
        username: displayName,
      },
    ]);

    setLoading(false);

    if (error) {
      alert(`Error creating post: ${error.message}`);
    } else {
      // Successfully created! Redirect back to the homepage
      navigate('/');
    }
  };

  return (
    <div className="page-wrapper">
      <div className="create-post-container">
        <div className="create-header">
          <Link to="/" className="btn-back">
            ← Back to Discussions
          </Link>
          <h2>Create a New Discussion</h2>
        </div>

        <form onSubmit={handleSubmit} className="create-post-form">
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              id="title"
              type="text"
              placeholder="What's on your mind?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="content">Content *</label>
            <textarea
              id="content"
              rows="6"
              placeholder="Provide details, background, or questions for your discussion..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="form-textarea"
            />
          </div>

          <div className="form-group">
            <label htmlFor="imageUrl">Image URL (Optional)</label>
            <input
              id="imageUrl"
              type="text"
              placeholder="https://example.com/image.png"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Publishing...' : 'Publish Post'}
            </button>
            <Link to="/" className="btn-cancel">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
