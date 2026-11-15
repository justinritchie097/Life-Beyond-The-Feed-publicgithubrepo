import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from './lib/supabaseClient';
import './PostDetail.css';

const PostDetail = ({ session }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  // Content toggle and comments state
  const [showContent, setShowContent] = useState(false);
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');

  // Editing comments state
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');

  // New states for editing the main post
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');

  useEffect(() => {
    fetchSinglePost();
    fetchComments();
  }, [id]);

  const fetchSinglePost = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching post:', error.message);
    } else {
      setPost(data);
      // Initialize edit fields
      setEditTitle(data.title);
      setEditContent(data.content || '');
      setEditImageUrl(data.image_url || '');
    }
    setLoading(false);
  };

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching comments:', error.message);
    } else {
      setComments(data || []);
    }
  };

  // Upvote Handler
  const handleUpvote = async () => {
    const newUpvotes = (post.upvotes || 0) + 1;

    const { data, error } = await supabase
      .from('posts')
      .update({ upvotes: newUpvotes })
      .eq('id', id)
      .select();

    if (error) {
      alert(`Error upvoting: ${error.message}`);
    } else if (data) {
      setPost(data[0]);
    }
  };

  // Update Post Handler
  const handleUpdatePost = async (e) => {
    e.preventDefault();
    if (!editTitle.trim()) return;

    const { data, error } = await supabase
      .from('posts')
      .update({
        title: editTitle.trim(),
        content: editContent.trim() || null,
        image_url: editImageUrl.trim() || null,
      })
      .eq('id', id)
      .select();

    if (error) {
      alert(`Error updating post: ${error.message}`);
    } else if (data) {
      setPost(data[0]);
      setIsEditingPost(false);
    }
  };

  // Delete Post Handler
  const handleDeletePost = async () => {
    if (
      !window.confirm('Are you sure you want to delete this discussion post?')
    )
      return;

    const { error } = await supabase.from('posts').delete().eq('id', id);

    if (error) {
      alert(`Error deleting post: ${error.message}`);
    } else {
      navigate('/');
    }
  };

  // Add Comment Handler
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim() || !session) return;

    const displayName =
      session.user.user_metadata?.username ||
      session.user.email?.split('@')[0] ||
      'Anonymous';

    const { data, error } = await supabase
      .from('comments')
      .insert([
        {
          post_id: id,
          content: newCommentText.trim(),
          user_id: session.user.id,
          username: displayName,
        },
      ])
      .select();

    if (error) {
      alert(`Error adding comment: ${error.message}`);
    } else if (data) {
      setComments([data[0], ...comments]);
      setNewCommentText('');
    }
  };

  // Start Editing a Comment
  const handleStartEdit = (comment) => {
    setEditingCommentId(comment.id);
    setEditCommentText(comment.content);
  };

  // Save Updated Comment
  const handleUpdateComment = async (commentId) => {
    if (!editCommentText.trim()) return;

    const { data, error } = await supabase
      .from('comments')
      .update({ content: editCommentText.trim() })
      .eq('id', commentId)
      .select();

    if (error) {
      alert(`Error updating comment: ${error.message}`);
    } else if (data) {
      setComments(comments.map((c) => (c.id === commentId ? data[0] : c)));
      setEditingCommentId(null);
      setEditCommentText('');
    }
  };

  // Delete Comment Handler
  const handleDeleteComment = async (commentId) => {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      alert(`Error deleting comment: ${error.message}`);
    } else {
      setComments(comments.filter((c) => c.id !== commentId));
    }
  };

  if (loading)
    return (
      <div className="page-wrapper">
        <p>Loading discussion...</p>
      </div>
    );
  if (!post)
    return (
      <div className="page-wrapper">
        <p>
          Post not found. <Link to="/">Return Home</Link>
        </p>
      </div>
    );

  // Check if current logged-in user is the author of this post
  const isAuthor = session?.user?.id && session.user.id === post.user_id;

  // Format timestamp nicely
  const formattedTime = post.created_at
    ? new Date(post.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Recently';

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
        <Link to="/" className="back-link">
          ← Back to Discussions
        </Link>

        {/* Post Actions (Edit / Delete) - Show ONLY if logged-in user is the author */}
        {isAuthor && !isEditingPost && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setIsEditingPost(true)}
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.85rem',
                borderRadius: '4px',
                border: '1px solid #ccc',
                background: '#fff',
                cursor: 'pointer',
              }}
            >
              Edit Post
            </button>
            <button
              type="button"
              onClick={handleDeletePost}
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.85rem',
                borderRadius: '4px',
                border: '1px solid #e0b4b4',
                background: '#fff5f5',
                color: '#c92a2a',
                cursor: 'pointer',
              }}
            >
              Delete Post
            </button>
          </div>
        )}
      </div>

      <article className="single-post-card">
        {isEditingPost ? (
          /* Post Edit Form */
          <form
            onSubmit={handleUpdatePost}
            style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}
          >
            <h3 style={{ margin: 0 }}>Edit Post</h3>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Post title..."
              required
              style={{
                padding: '0.65rem',
                borderRadius: '6px',
                border: '1px solid #ccc',
                fontSize: '1rem',
              }}
            />
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows="5"
              placeholder="Post content..."
              style={{
                padding: '0.65rem',
                borderRadius: '6px',
                border: '1px solid #ccc',
                fontSize: '1rem',
                fontFamily: 'inherit',
              }}
            />
            <input
              type="url"
              value={editImageUrl}
              onChange={(e) => setEditImageUrl(e.target.value)}
              placeholder="Image URL (optional)..."
              style={{
                padding: '0.65rem',
                borderRadius: '6px',
                border: '1px solid #ccc',
                fontSize: '0.95rem',
              }}
            />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="submit"
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  border: 'none',
                  background: '#222',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditingPost(false);
                  setEditTitle(post.title);
                  setEditContent(post.content || '');
                  setEditImageUrl(post.image_url || '');
                }}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  background: '#fff',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          /* Normal Post View */
          <>
            <div
              className="post-meta-header"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '0.5rem',
                fontSize: '0.9rem',
                color: '#64748b',
              }}
            >
              <span className="post-author">
                @{post.username || 'Anonymous'}
              </span>
              <span className="post-timestamp">🕒 {formattedTime}</span>
            </div>

            <h1
              className="single-post-title"
              onClick={() => setShowContent(!showContent)}
              style={{ cursor: 'pointer' }}
            >
              {post.title}
              <span
                style={{
                  fontSize: '0.85rem',
                  marginLeft: '0.5rem',
                  color: '#64748b',
                }}
              >
                {showContent ? ' ▲ Hide Text' : ' ▼ Click to View Text'}
              </span>
            </h1>

            {/* Fully displayed image (no cropping) */}
            {post.image_url && (
              <div
                className="single-post-image-container"
                style={{ margin: '1rem 0' }}
              >
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="full-display-image"
                  style={{ maxWidth: '100%', borderRadius: '6px' }}
                />
              </div>
            )}

            {/* Content viewable only when toggled open */}
            {showContent && (
              <div
                className="single-post-content"
                style={{ margin: '1rem 0', whiteSpace: 'pre-wrap' }}
              >
                <p>{post.content}</p>
              </div>
            )}

            {/* Upvote Action Section */}
            <div
              className="post-footer-actions"
              style={{ marginTop: '1.5rem' }}
            >
              <button
                onClick={handleUpvote}
                className="upvote-btn"
                style={{
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  borderRadius: '6px',
                  border: '1px solid #ccc',
                  background: '#fff',
                }}
              >
                ❤️ Upvote ({post.upvotes || 0})
              </button>
            </div>
          </>
        )}
      </article>

      {/* Comments Section */}
      <section className="comments-section" style={{ marginTop: '2rem' }}>
        <h3>Comments ({comments.length})</h3>

        {session ? (
          <form
            onSubmit={handleAddComment}
            className="comment-form"
            style={{ marginTop: '1rem', marginBottom: '1.5rem' }}
          >
            <textarea
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Write a comment..."
              rows="3"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '6px',
                border: '1px solid #ccc',
                marginBottom: '0.5rem',
                fontFamily: 'inherit',
              }}
              required
            />
            <button
              type="submit"
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: 'none',
                background: '#222',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              Post Comment
            </button>
          </form>
        ) : (
          <p
            style={{ margin: '1rem 0', color: '#64748b', fontSize: '0.95rem' }}
          >
            <Link to="/auth">Sign in</Link> to leave a comment.
          </p>
        )}

        <div className="comments-list">
          {comments.length === 0 ? (
            <p style={{ color: '#666' }}>
              No comments yet. Be the first to comment!
            </p>
          ) : (
            comments.map((comment) => {
              const isCommentAuthor =
                session?.user?.id && session.user.id === comment.user_id;

              return (
                <div
                  key={comment.id}
                  className="comment-card"
                  style={{
                    background: '#f9f9f9',
                    padding: '1rem',
                    borderRadius: '6px',
                    marginBottom: '1rem',
                    border: '1px solid #eee',
                  }}
                >
                  {editingCommentId === comment.id ? (
                    /* Edit Mode */
                    <div>
                      <textarea
                        value={editCommentText}
                        onChange={(e) => setEditCommentText(e.target.value)}
                        rows="3"
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          borderRadius: '4px',
                          border: '1px solid #ccc',
                          marginBottom: '0.5rem',
                          fontFamily: 'inherit',
                        }}
                      />
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          type="button"
                          onClick={() => handleUpdateComment(comment.id)}
                          style={{
                            padding: '0.35rem 0.75rem',
                            borderRadius: '4px',
                            border: 'none',
                            background: '#222',
                            color: '#fff',
                            cursor: 'pointer',
                          }}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCommentId(null)}
                          style={{
                            padding: '0.35rem 0.75rem',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                            background: '#fff',
                            cursor: 'pointer',
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Display Mode */
                    <>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '0.35rem',
                          fontSize: '0.85rem',
                          color: '#64748b',
                        }}
                      >
                        <strong>@{comment.username || 'Anonymous'}</strong>
                        <span>
                          {new Date(comment.created_at).toLocaleDateString(
                            'en-US',
                            {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            },
                          )}
                        </span>
                      </div>

                      <p
                        style={{
                          margin: '0 0 0.75rem 0',
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {comment.content}
                      </p>

                      {/* Show edit/delete for comment author only */}
                      {isCommentAuthor && (
                        <div
                          style={{
                            display: 'flex',
                            gap: '0.5rem',
                            justifyContent: 'flex-end',
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => handleStartEdit(comment)}
                            style={{
                              padding: '0.25rem 0.6rem',
                              fontSize: '0.8rem',
                              borderRadius: '4px',
                              border: '1px solid #ccc',
                              background: '#fff',
                              cursor: 'pointer',
                            }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteComment(comment.id)}
                            style={{
                              padding: '0.25rem 0.6rem',
                              fontSize: '0.8rem',
                              borderRadius: '4px',
                              border: '1px solid #e0b4b4',
                              background: '#fff5f5',
                              color: '#c92a2a',
                              cursor: 'pointer',
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};

export default PostDetail;
