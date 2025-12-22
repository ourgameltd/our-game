import { useState, useRef } from 'react';
import { PlayerImage } from '@/types';
import { Plus } from 'lucide-react';

interface ImageAlbumProps {
  images: PlayerImage[];
  onAddImage?: (image: Omit<PlayerImage, 'id'>) => void;
  onDeleteImage?: (imageId: string) => void;
  editable?: boolean;
}

export default function ImageAlbum({ images, onAddImage, onDeleteImage, editable = false }: ImageAlbumProps) {
  const [selectedImage, setSelectedImage] = useState<PlayerImage | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterTag, setFilterTag] = useState<string>('all');
  const [isDragging, setIsDragging] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newImage, setNewImage] = useState({
    url: '',
    caption: '',
    tags: [] as string[]
  });

  // Get unique tags from all images
  const allTags = Array.from(new Set(images.flatMap(img => img.tags || [])));
  
  // Common tag suggestions
  const suggestedTags = ['training', 'match', 'award', 'team', 'highlight', 'achievement'];
  
  // Combine existing and suggested tags
  const availableTags = Array.from(new Set([...suggestedTags, ...allTags]));
  
  // Filter images by tag
  const filteredImages = filterTag === 'all' 
    ? images 
    : images.filter(img => img.tags?.includes(filterTag));

  const handleAddImage = () => {
    if (onAddImage && newImage.url) {
      onAddImage({
        url: newImage.url,
        caption: newImage.caption,
        date: new Date(),
        tags: newImage.tags
      });
      setNewImage({ url: '', caption: '', tags: [] });
      setShowAddForm(false);
    }
  };

  const handleTagToggle = (tag: string) => {
    setNewImage(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleAddNewTag = () => {
    const trimmedTag = newTagInput.trim().toLowerCase();
    if (trimmedTag && !newImage.tags.includes(trimmedTag)) {
      setNewImage(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }));
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewImage(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tagToRemove)
    }));
  };

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setNewImage(prev => ({ ...prev, url: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with filters and add button */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterTag('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filterTag === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            All ({images.length})
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setFilterTag(tag)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize ${
                filterTag === tag
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {tag} ({images.filter(img => img.tags?.includes(tag)).length})
            </button>
          ))}
        </div>
        
        {editable && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
            title="Add Image"
          >
            <Plus className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Add Image Form */}
      {showAddForm && editable && (
        <div className="card bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold mb-4">Add New Image</h3>
          <div className="space-y-4">
            {/* Drag and Drop Area */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragging
                  ? 'border-blue-500 bg-blue-100 dark:bg-blue-900/30'
                  : newImage.url
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
              {newImage.url ? (
                <div className="space-y-2">
                  <div className="relative w-full max-w-md mx-auto">
                    <img
                      src={newImage.url}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setNewImage(prev => ({ ...prev, url: '' }));
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                    ✓ Image loaded - Click to change
                  </p>
                </div>
              ) : (
                <>
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">
                    {isDragging ? 'Drop image here' : 'Drag and drop an image'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    or click to browse your files
                  </p>
                </>
              )}
            </div>

            {/* Alternative: URL Input */}
            <div>
              <label className="block text-sm font-medium mb-2">Or paste an image URL</label>
              <input
                type="text"
                value={newImage.url.startsWith('data:') ? '' : newImage.url}
                onChange={(e) => setNewImage(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://example.com/image.jpg"
                className="input"
                disabled={newImage.url.startsWith('data:')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Caption</label>
              <input
                type="text"
                value={newImage.caption}
                onChange={(e) => setNewImage(prev => ({ ...prev, caption: e.target.value }))}
                placeholder="Describe this image..."
                className="input"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Tags</label>
              
              {/* Selected Tags Display */}
              {newImage.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3 p-3 bg-gray-100 dark:bg-gray-900 rounded-lg">
                  {newImage.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-medium capitalize"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:bg-blue-700 rounded-full p-0.5 transition-colors"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Tag Selection */}
              <div className="flex flex-wrap gap-2 mb-3">
                {availableTags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors ${
                      newImage.tags.includes(tag)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Add Custom Tag */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddNewTag())}
                  placeholder="Add custom tag..."
                  className="input flex-1"
                />
                <button
                  type="button"
                  onClick={handleAddNewTag}
                  disabled={!newTagInput.trim()}
                  className="btn-secondary btn-md disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-2"
                  title="Add Tag"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAddImage}
                disabled={!newImage.url}
                className="btn-primary btn-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Image
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewImage({ url: '', caption: '', tags: [] });
                  setNewTagInput('');
                }}
                className="btn-secondary btn-md"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Grid */}
      {filteredImages.length === 0 ? (
        <div className="card text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-600 dark:text-gray-400">
            {filterTag === 'all' ? 'No images in album yet' : `No images with tag "${filterTag}"`}
          </p>
          {editable && filterTag === 'all' && (
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary btn-md mt-4"
            >
              Add Your First Image
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredImages.map(image => (
            <div
              key={image.id}
              className="card p-0 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group"
              onClick={() => setSelectedImage(image)}
            >
              <div className="aspect-video bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
                <img
                  src={image.url}
                  alt={image.caption || 'Player image'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {editable && onDeleteImage && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteImage(image.id);
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <div className="p-4">
                {image.caption && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{image.caption}</p>
                )}
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>{image.date.toLocaleDateString('en-GB')}</span>
                  {image.tags && image.tags.length > 0 && (
                    <div className="flex gap-1">
                      {image.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded-full capitalize">
                          {tag}
                        </span>
                      ))}
                      {image.tags.length > 2 && (
                        <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded-full">
                          +{image.tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-[1000] flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="max-w-6xl w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedImage.url}
              alt={selectedImage.caption || 'Player image'}
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
            {(selectedImage.caption || selectedImage.tags) && (
              <div className="bg-white dark:bg-gray-800 rounded-lg mt-4 p-4">
                {selectedImage.caption && (
                  <p className="text-gray-900 dark:text-white mb-2">{selectedImage.caption}</p>
                )}
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>{selectedImage.date.toLocaleDateString('en-GB', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                  {selectedImage.tags && selectedImage.tags.length > 0 && (
                    <div className="flex gap-2">
                      {selectedImage.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full capitalize">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
