import React, { useEffect, useState } from 'react';
import { Trash2, Loader2, Star, CheckCircle, MessageSquare } from 'lucide-react';
import { adminAPI } from '../../api/index';
import { formatDate } from '../../utils/helpers';
import { useToast } from '../../context/ToastContext';
import StarRating from '../../components/common/StarRating';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [deletingId, setDeletingId] = useState(null);
  const { showToast } = useToast();

  const fetchReviews = (p = page) => {
    setLoading(true);
    adminAPI.getReviews({ page: p, size: 15 })
      .then((r) => {
        setReviews(r.data?.content || r.data || []);
        setTotalPages(r.data?.totalPages || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReviews(page);
  }, [page]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this customer review?')) return;
    setDeletingId(id);
    try {
      await adminAPI.deleteReview(id);
      showToast('Review deleted', 'success');
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to delete review', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Review Moderation</h1>
        <p className="text-sm text-gray-500 mt-1">Review customer feedback and moderate inappropriate content</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3.5 font-medium text-gray-500">Product</th>
                <th className="text-left px-5 py-3.5 font-medium text-gray-500">Customer</th>
                <th className="text-left px-5 py-3.5 font-medium text-gray-500">Rating</th>
                <th className="text-left px-5 py-3.5 font-medium text-gray-500">Comment</th>
                <th className="text-left px-5 py-3.5 font-medium text-gray-500">Date</th>
                <th className="text-right px-5 py-3.5 font-medium text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto" />
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    No customer reviews found
                  </td>
                </tr>
              ) : (
                reviews.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 font-medium text-gray-900 max-w-[200px] truncate">
                      {r.productName || `Product #${r.productId}`}
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {r.customerName || r.customerEmail || 'Customer'}
                    </td>
                    <td className="px-5 py-4">
                      <StarRating rating={r.rating} size="sm" />
                    </td>
                    <td className="px-5 py-4 text-gray-700 max-w-sm">
                      <p className="line-clamp-2">{r.comment || <span className="italic text-gray-400">No comment</span>}</p>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500">{formatDate(r.createdAt)}</td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleDelete(r.id)}
                        disabled={deletingId === r.id}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete review"
                      >
                        {deletingId === r.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between text-sm">
            <span className="text-gray-500">
              Page {page + 1} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReviews;
