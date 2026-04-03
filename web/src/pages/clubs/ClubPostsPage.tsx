import { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  useClubById,
  useClubPosts,
  useCreateClubPost,
  useUpdateClubPost,
  useDeleteClubPost,
  CreateClubPostRequest,
  ClubPostDto,
  ClubPostType,
} from '@/api';
import PageTitle from '@/components/common/PageTitle';
import { usePageTitle } from '@/hooks/usePageTitle';

// -- Constants ----------------------------------------------------------------

const POST_TYPES: ClubPostType[] = [
  'match_report',
  'player_spotlight',
  'upcoming_fixture',
  'result',
  'clip',
];

const POST_TYPE_LABELS: Record<ClubPostType, string> = {
  match_report: 'Match Report',
  player_spotlight: 'Player Spotlight',
  upcoming_fixture: 'Upcoming Fixture',
  result: 'Result',
  clip: 'Clip',
};

const POST_TYPE_COLORS: Record<ClubPostType, string> = {
  match_report: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  player_spotlight: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  upcoming_fixture: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  result: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  clip: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
};

const EMPTY_FORM: CreateClubPostRequest = {
  title: '',
  postType: 'match_report',
  description: '',
  externalUrl: '',
  imageUrl: '',
  isPublic: false,
};

// -- Skeletons ----------------------------------------------------------------

function PageTitleSkeleton() {
  return (
    <div className="mb-6 animate-pulse">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2" />
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-72" />
    </div>
  );
}

function PostListSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="card">
          <div className="flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-48" />
              <div className="flex gap-2">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16" />
              </div>
            </div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

// -- Sub-components -----------------------------------------------------------

function PostTypeBadge({ type }: { type: ClubPostType }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${POST_TYPE_COLORS[type]}`}>
      {POST_TYPE_LABELS[type]}
    </span>
  );
}

function VisibilityBadge({ isPublic }: { isPublic: boolean }) {
  if (isPublic) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
        Public
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
      Members Only
    </span>
  );
}

function ShareUrlCard({ postId }: { postId: string }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/play/share/${postId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
      <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
        Share URL
      </p>
      <div className="flex items-center gap-2">
        <input
          type="text"
          readOnly
          value={shareUrl}
          className="flex-1 px-3 py-1.5 text-sm border border-blue-300 dark:border-blue-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
        <button
          type="button"
          onClick={handleCopy}
          className="btn btn-primary text-sm px-3 py-1.5"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  );
}

// -- Post Form ----------------------------------------------------------------

interface PostFormProps {
  initialData: CreateClubPostRequest;
  onSubmit: (data: CreateClubPostRequest) => Promise<ClubPostDto | null>;
  onCancel: () => void;
  isSubmitting: boolean;
  error: { message: string; validationErrors?: Record<string, string[]> } | null;
  submitLabel: string;
  /** Show share URL after successful submit */
  lastSavedPostId: string | null;
}

function PostForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  error,
  submitLabel,
  lastSavedPostId,
}: PostFormProps) {
  const [formData, setFormData] = useState<CreateClubPostRequest>(initialData);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <div className="card mb-4">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        {submitLabel === 'Create Post' ? 'New Post' : 'Edit Post'}
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm font-medium text-red-800 dark:text-red-300">
            {error.message}
          </p>
          {error.validationErrors && (
            <ul className="mt-2 list-disc list-inside text-sm text-red-700 dark:text-red-400">
              {Object.entries(error.validationErrors).map(([field, errors]) =>
                errors.map((msg, i) => (
                  <li key={`${field}-${i}`}>{field}: {msg}</li>
                ))
              )}
            </ul>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="Post title"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          {/* Post Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Post Type *
            </label>
            <select
              name="postType"
              value={formData.postType}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {POST_TYPES.map(type => (
                <option key={type} value={type}>
                  {POST_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description ?? ''}
            onChange={handleInputChange}
            rows={3}
            placeholder="Write a short description..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* External URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              External URL
            </label>
            <input
              type="url"
              name="externalUrl"
              value={formData.externalUrl ?? ''}
              onChange={handleInputChange}
              placeholder="https://..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Image URL
            </label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl ?? ''}
              onChange={handleInputChange}
              placeholder="https://... (for social media preview)"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Is Public toggle */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isPublic"
            name="isPublic"
            checked={formData.isPublic}
            onChange={handleCheckboxChange}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="isPublic" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Make this post public (visible to anyone with the share link)
          </label>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onCancel} className="btn btn-danger">
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
          >
            {isSubmitting ? 'Saving...' : submitLabel}
          </button>
        </div>
      </form>

      {lastSavedPostId && <ShareUrlCard postId={lastSavedPostId} />}
    </div>
  );
}

// -- Delete Confirmation ------------------------------------------------------

function DeleteConfirmation({
  postTitle,
  onConfirm,
  onCancel,
  isDeleting,
}: {
  postTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}) {
  return (
    <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
      <p className="text-sm text-red-800 dark:text-red-300">
        Are you sure you want to delete <strong>&ldquo;{postTitle}&rdquo;</strong>? This cannot be undone.
      </p>
      <div className="flex gap-2 mt-2">
        <button
          type="button"
          onClick={onConfirm}
          disabled={isDeleting}
          className="btn btn-danger text-sm"
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
        <button type="button" onClick={onCancel} className="btn btn-primary text-sm">
          Cancel
        </button>
      </div>
    </div>
  );
}

// -- Main Page ----------------------------------------------------------------

export default function ClubPostsPage() {
  usePageTitle(['Posts']);

  const { clubId } = useParams();

  // API hooks
  const { data: club, isLoading: clubLoading } = useClubById(clubId);
  const { data: posts, isLoading: postsLoading, error: postsError, refetch } = useClubPosts(clubId);
  const { createPost, isSubmitting: isCreating, error: createError } = useCreateClubPost(clubId || '');
  const { updatePost, isSubmitting: isUpdating, error: updateError } = useUpdateClubPost(clubId || '');
  const { deletePost, isDeleting, error: deleteError } = useDeleteClubPost(clubId || '');

  const isLoading = clubLoading || postsLoading;

  // UI state
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<ClubPostDto | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [lastSavedPostId, setLastSavedPostId] = useState<string | null>(null);

  const handleCreate = useCallback(async (data: CreateClubPostRequest): Promise<ClubPostDto | null> => {
    const result = await createPost(data);
    if (result) {
      setLastSavedPostId(result.id);
      setShowForm(false);
      refetch();
    }
    return result;
  }, [createPost, refetch]);

  const handleUpdate = useCallback(async (data: CreateClubPostRequest): Promise<ClubPostDto | null> => {
    if (!editingPost) return null;
    const result = await updatePost(editingPost.id, data);
    if (result) {
      setLastSavedPostId(result.id);
      setEditingPost(null);
      refetch();
    }
    return result;
  }, [editingPost, updatePost, refetch]);

  const handleDelete = useCallback(async (postId: string) => {
    const success = await deletePost(postId);
    if (success) {
      setDeletingPostId(null);
      if (lastSavedPostId === postId) setLastSavedPostId(null);
      refetch();
    }
  }, [deletePost, lastSavedPostId, refetch]);

  const handleStartEdit = (post: ClubPostDto) => {
    setEditingPost(post);
    setShowForm(false);
    setLastSavedPostId(null);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingPost(null);
    setLastSavedPostId(null);
  };

  const handleNewPost = () => {
    setShowForm(true);
    setEditingPost(null);
    setLastSavedPostId(null);
  };

  // Error state
  if (!isLoading && postsError && !posts.length) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Error loading posts</h2>
            <p className="text-sm text-red-600 dark:text-red-400">{postsError.message}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        {/* Header */}
        {isLoading ? (
          <PageTitleSkeleton />
        ) : (
          <PageTitle
            title="Posts"
            subtitle={club ? `Shareable content for ${club.name}` : 'Manage shareable club content'}
            action={
              !showForm && !editingPost
                ? { label: 'New Post', onClick: handleNewPost, variant: 'primary', icon: 'plus' }
                : undefined
            }
          />
        )}

        {/* Delete error banner */}
        {deleteError && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm font-medium text-red-800 dark:text-red-300">{deleteError.message}</p>
          </div>
        )}

        {/* Share URL banner (shown after create/update when form is closed) */}
        {lastSavedPostId && !showForm && !editingPost && (
          <ShareUrlCard postId={lastSavedPostId} />
        )}

        {isLoading ? (
          <PostListSkeleton />
        ) : (
          <>
            {/* Create form */}
            {showForm && (
              <PostForm
                initialData={EMPTY_FORM}
                onSubmit={handleCreate}
                onCancel={handleCancelForm}
                isSubmitting={isCreating}
                error={createError}
                submitLabel="Create Post"
                lastSavedPostId={null}
              />
            )}

            {/* Edit form */}
            {editingPost && (
              <PostForm
                initialData={{
                  title: editingPost.title,
                  postType: editingPost.postType,
                  description: editingPost.description ?? '',
                  externalUrl: editingPost.externalUrl ?? '',
                  imageUrl: editingPost.imageUrl ?? '',
                  isPublic: editingPost.isPublic,
                }}
                onSubmit={handleUpdate}
                onCancel={handleCancelForm}
                isSubmitting={isUpdating}
                error={updateError}
                submitLabel="Save Changes"
                lastSavedPostId={null}
              />
            )}

            {/* Posts list */}
            {posts.length === 0 && !showForm ? (
              <div className="card text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 mb-4">No posts yet. Create your first post to share with the world.</p>
                <button type="button" onClick={handleNewPost} className="btn btn-primary">
                  New Post
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {posts.map(post => (
                  <div key={post.id} className="card">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      {/* Post info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                          {post.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <PostTypeBadge type={post.postType} />
                          <VisibilityBadge isPublic={post.isPublic} />
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {post.externalUrl && (
                          <a
                            href={post.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1 block truncate"
                          >
                            {post.externalUrl}
                          </a>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(post)}
                          className="btn btn-primary text-sm"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingPostId(post.id)}
                          className="btn btn-danger text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Delete confirmation */}
                    {deletingPostId === post.id && (
                      <DeleteConfirmation
                        postTitle={post.title}
                        onConfirm={() => handleDelete(post.id)}
                        onCancel={() => setDeletingPostId(null)}
                        isDeleting={isDeleting}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
