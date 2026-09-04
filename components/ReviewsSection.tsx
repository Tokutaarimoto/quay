"use client";

import { useState, useEffect } from "react";

interface Review {
  id: number;
  server_id: string;
  rating: number;
  title: string | null;
  content: string | null;
  author: string;
  created_at: string;
}

interface ReviewsSectionProps {
  serverId: string;
}

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`${star <= rating ? "text-warning" : "text-text-muted"}`}
          width={size}
          height={size}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export function ReviewsSection({ serverId }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<{ count: number; avgRating: number | null }>({ count: 0, avgRating: null });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ rating: 5, title: "", content: "", author: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverId]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/servers/${encodeURIComponent(serverId)}/reviews`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews);
        setStats(data.stats);
      }
    } catch {
      console.error("Failed to fetch reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch(`/api/servers/${encodeURIComponent(serverId)}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setShowForm(false);
        setFormData({ rating: 5, title: "", content: "", author: "" });
        fetchReviews();
      }
    } catch {
      console.error("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="text-[12px] font-medium uppercase tracking-widest text-text-secondary">
          Reviews
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-[13px] text-accent hover:underline"
        >
          {showForm ? "Cancel" : "Write a review"}
        </button>
      </div>

      {stats.count > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 rounded-card bg-surface border border-border">
          <StarRating rating={Math.round(stats.avgRating || 0)} size={16} />
          <span className="text-[14px] font-medium text-text-primary">
            {stats.avgRating}
          </span>
          <span className="text-[13px] text-text-muted">
            ({stats.count} {stats.count === 1 ? "review" : "reviews"})
          </span>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="p-4 rounded-card bg-surface border border-border mb-4">
          <div className="mb-4">
            <label className="block text-[12px] font-medium text-text-secondary mb-2">Rating</label>
            <StarRating rating={formData.rating} size={20} />
            <input
              type="range"
              min="1"
              max="5"
              value={formData.rating}
              onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
              className="w-full mt-2"
            />
          </div>
          <div className="mb-4">
            <label className="block text-[12px] font-medium text-text-secondary mb-2">Title (optional)</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 rounded-button bg-background border border-border text-[13px] text-text-primary focus:border-accent/40 focus:outline-none"
              placeholder="Summarize your experience"
            />
          </div>
          <div className="mb-4">
            <label className="block text-[12px] font-medium text-text-secondary mb-2">Review (optional)</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-3 py-2 rounded-button bg-background border border-border text-[13px] text-text-primary focus:border-accent/40 focus:outline-none resize-none"
              rows={3}
              placeholder="Share your experience with this server"
            />
          </div>
          <div className="mb-4">
            <label className="block text-[12px] font-medium text-text-secondary mb-2">Your name</label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              className="w-full px-3 py-2 rounded-button bg-background border border-border text-[13px] text-text-primary focus:border-accent/40 focus:outline-none"
              placeholder="Your name"
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 rounded-button text-[13px] font-medium text-white bg-accent hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-3 rounded-card bg-surface border border-border animate-shimmer h-20" />
          ))}
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review.id} className="p-4 rounded-card bg-surface border border-border">
              <div className="flex items-center gap-2 mb-2">
                <StarRating rating={review.rating} size={12} />
                <span className="text-[13px] font-medium text-text-primary">{review.author}</span>
                <span className="text-[11px] text-text-muted">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>
              {review.title && (
                <div className="text-[13px] font-medium text-text-primary mb-1">{review.title}</div>
              )}
              {review.content && (
                <div className="text-[13px] text-text-secondary">{review.content}</div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-[13px] text-text-muted">
          No reviews yet. Be the first to review this server.
        </div>
      )}
    </div>
  );
}
