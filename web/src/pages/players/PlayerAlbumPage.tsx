import { useParams } from 'react-router-dom';
import { getPlayerById } from '@data/players';
import PageTitle from '@components/common/PageTitle';
import ImageAlbum from '@components/player/ImageAlbum';
import { PlayerImage } from '@/types';
import { useState } from 'react';

export default function PlayerAlbumPage() {
  const { playerId } = useParams();
  const player = getPlayerById(playerId!);
  const [albumImages, setAlbumImages] = useState<PlayerImage[]>(player?.album || []);

  if (!player) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Player not found</h2>
          </div>
        </main>
      </div>
    );
  }

  const handleAddImage = (newImage: Omit<PlayerImage, 'id'>) => {
    const imageWithId: PlayerImage = {
      ...newImage,
      id: `img-${Date.now()}-${playerId}`
    };
    setAlbumImages([imageWithId, ...albumImages]);
  };

  const handleDeleteImage = (imageId: string) => {
    if (confirm('Are you sure you want to delete this image?')) {
      setAlbumImages(albumImages.filter(img => img.id !== imageId));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        {/* Page Header */}
        <div className="mb-4">
          <PageTitle
            title={`${player.firstName} ${player.lastName}'s Album`}
            subtitle={`${albumImages.length} ${albumImages.length === 1 ? 'image' : 'images'}`}
          />
        </div>

        {/* Album Info Card - Only show when there are no images */}
        {albumImages.length === 0 && (
          <div className="card mb-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-2">Player Image Album</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Keep track of {player.firstName}'s football journey with photos from training sessions, matches, 
                  awards, and special moments. Click on any image to view it in full size.
                </p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span>Use tags to organize images</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Add captions to provide context</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Album Component */}
        <ImageAlbum
          images={albumImages}
          onAddImage={handleAddImage}
          onDeleteImage={handleDeleteImage}
          editable={true}
        />
      </main>
    </div>
  );
}
