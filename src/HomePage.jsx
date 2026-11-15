import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from './lib/supabaseClient';
import './HomePage.css';

const HomePage = ({ session }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search and sort states
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('created_at');

  // New states for creating a post
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    // 1. Added 'username' and 'user_id' to the selected columns
    const { data, error } = await supabase
      .from('posts')
      .select('id, title, created_at, upvotes, username, user_id')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error.message);
    } else {
      setPosts(data || []);
    }
    setLoading(false);
  };

  // Create Post Handler
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!title.trim() || !session) return;

    setSubmitting(true);

    // Extract username safely from session metadata (with email fallback)
    const displayName =
      session.user.user_metadata?.username ||
      session.user.email?.split('@')[0] ||
      'Anonymous';

    // 2. Included username and user_id in the insert payload
    const { data, error } = await supabase
      .from('posts')
      .insert([
        {
          title: title.trim(),
          content: content.trim() || null,
          image_url: imageUrl.trim() || null,
          upvotes: 0,
          user_id: session.user.id,
          username: displayName,
        },
      ])
      .select('id, title, created_at, upvotes, username, user_id');

    if (error) {
      alert(`Error creating post: ${error.message}`);
    } else if (data) {
      // Prepend the new post to the feed and reset the form
      setPosts([data[0], ...posts]);
      setTitle('');
      setContent('');
      setImageUrl('');
      setShowCreateForm(false);
    }
    setSubmitting(false);
  };

  const filteredAndSortedPosts = posts
    .filter((post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortBy === 'upvotes') {
        return (b.upvotes || 0) - (a.upvotes || 0);
      }
      return new Date(b.created_at) - new Date(a.created_at);
    });

  if (loading) {
    return (
      <div className="page-wrapper">
        <p>Loading discussions...</p>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}
      >
        <h1 style={{ margin: 0 }}>Discussions</h1>

        {/* Only show '+ New Post' button if logged in */}
        {session && (
          <button
            type="button"
            onClick={() => setShowCreateForm(!showCreateForm)}
            style={{
              padding: '0.65rem 1.1rem',
              borderRadius: '6px',
              border: 'none',
              background: '#222',
              color: '#fff',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            {showCreateForm ? '✕ Close' : '+ New Post'}
          </button>
        )}
      </div>

      {/* Collapsible Create Post Form */}
      {showCreateForm && session && (
        <form
          onSubmit={handleCreatePost}
          className="create-post-form"
          style={{
            background: '#f9f9f9',
            padding: '1.25rem',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
            marginBottom: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
          }}
        >
          <h3 style={{ margin: 0 }}>Start a Discussion</h3>

          <input
            type="text"
            placeholder="Post title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{
              padding: '0.65rem 0.9rem',
              borderRadius: '6px',
              border: '1px solid #ccc',
              fontSize: '1rem',
            }}
          />

          <textarea
            placeholder="Share your thoughts, tips, or experience..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="4"
            style={{
              padding: '0.65rem 0.9rem',
              borderRadius: '6px',
              border: '1px solid #ccc',
              fontSize: '1rem',
              fontFamily: 'inherit',
            }}
          />

          <input
            type="url"
            placeholder="Optional image URL (https://...)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            style={{
              padding: '0.65rem 0.9rem',
              borderRadius: '6px',
              border: '1px solid #ccc',
              fontSize: '0.95rem',
            }}
          />

          {/* Live Image Preview */}
          {imageUrl.trim() && (
            <img
              src={imageUrl}
              alt="Preview"
              style={{
                maxHeight: '180px',
                width: 'fit-content',
                borderRadius: '6px',
                objectFit: 'cover',
              }}
              onError={(e) => (e.target.style.display = 'none')}
            />
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              alignSelf: 'flex-start',
              padding: '0.65rem 1.25rem',
              borderRadius: '6px',
              border: 'none',
              background: '#222',
              color: '#fff',
              fontWeight: '600',
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? 'Publishing...' : 'Publish Post'}
          </button>
        </form>
      )}

      {/* Search and Sort Controls */}
      <div
        className="feed-controls"
        style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
        }}
      >
        <input
          type="text"
          placeholder="Search posts by title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: 1,
            minWidth: '220px',
            padding: '0.65rem 1rem',
            borderRadius: '6px',
            border: '1px solid #ccc',
            fontSize: '1rem',
          }}
        />

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => setSortBy('created_at')}
            style={{
              padding: '0.65rem 1.0rem',
              borderRadius: '6px',
              border: '1px solid #ccc',
              cursor: 'pointer',
              fontWeight: sortBy === 'created_at' ? 'bold' : 'normal',
              background: sortBy === 'created_at' ? '#222' : '#fff',
              color: sortBy === 'created_at' ? '#fff' : '#222',
            }}
          >
            🕒 Newest
          </button>

          <button
            type="button"
            onClick={() => setSortBy('upvotes')}
            style={{
              padding: '0.65rem 1.0rem',
              borderRadius: '6px',
              border: '1px solid #ccc',
              cursor: 'pointer',
              fontWeight: sortBy === 'upvotes' ? 'bold' : 'normal',
              background: sortBy === 'upvotes' ? '#222' : '#fff',
              color: sortBy === 'upvotes' ? '#fff' : '#222',
            }}
          >
            ❤️ Top Upvoted
          </button>
        </div>
      </div>

      {/* Render Filtered & Sorted List */}
      {filteredAndSortedPosts.length === 0 ? (
        <p>
          {searchQuery
            ? `No posts found matching "${searchQuery}".`
            : 'No posts yet.'}
        </p>
      ) : (
        <div className="posts-feed">
          {filteredAndSortedPosts.map((post) => {
            const formattedTime = post.created_at
              ? new Date(post.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'Recently';

            return (
              <article key={post.id} className="feed-post-card">
                <div
                  className="post-meta-header"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.35rem',
                    fontSize: '0.85rem',
                    color: '#64748b',
                  }}
                >
                  {/* 3. Render the author's username */}
                  <span className="post-author">
                    @{post.username || 'Anonymous'}
                  </span>
                  <span className="post-timestamp">🕒 {formattedTime}</span>
                </div>

                <Link to={`/post/${post.id}`} className="post-title-link">
                  <h2>{post.title}</h2>
                </Link>

                <div className="post-footer-actions">
                  <span>❤️ {post.upvotes || 0} Upvotes</span>
                  <Link to={`/post/${post.id}`} className="read-more-link">
                    Read & Comment →
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

// (Keep export default HomePage as you had it!)
export default HomePage;
