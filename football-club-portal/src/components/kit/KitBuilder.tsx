import { useState } from 'react';
import { Kit } from '@/types';

interface KitBuilderProps {
  kit?: Kit;
  onSave: (kit: Omit<Kit, 'id'>) => void;
  onCancel: () => void;
}

export default function KitBuilder({ kit, onSave, onCancel }: KitBuilderProps) {
  const [name, setName] = useState(kit?.name || '');
  const [type, setType] = useState<Kit['type']>(kit?.type || 'home');
  const [shirtColor, setShirtColor] = useState(kit?.shirtColor || '#FF0000');
  const [shortsColor, setShortsColor] = useState(kit?.shortsColor || '#000000');
  const [socksColor, setSocksColor] = useState(kit?.socksColor || '#FFFFFF');
  const [isActive, setIsActive] = useState(kit?.isActive ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('Please enter a kit name');
      return;
    }

    const kitData: Omit<Kit, 'id'> = {
      name: name.trim(),
      type,
      shirtColor,
      shortsColor,
      socksColor,
      isActive,
    };

    onSave(kitData);
  };

  return (
    <div className="card">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        {kit ? 'Edit Kit' : 'Create New Kit'}
      </h3>

      <form onSubmit={handleSubmit}>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column - Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Kit Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="e.g., Home Kit, Away Kit"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Kit Type *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as Kit['type'])}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="home">Home</option>
                <option value="away">Away</option>
                <option value="third">Third</option>
                <option value="goalkeeper">Goalkeeper</option>
                <option value="training">Training</option>
              </select>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Active Kit (available for selection)
                </span>
              </label>
            </div>
          </div>

          <div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Shirt Color *
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={shirtColor}
                  onChange={(e) => setShirtColor(e.target.value)}
                  className="h-10 w-20 rounded border border-gray-300 dark:border-gray-600"
                />
                <input
                  type="text"
                  value={shirtColor}
                  onChange={(e) => setShirtColor(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="#FF0000"
                />
              </div>
            </div>
            
             <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Shorts Color *
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={shortsColor}
                  onChange={(e) => setShortsColor(e.target.value)}
                  className="h-10 w-20 rounded border border-gray-300 dark:border-gray-600"
                />
                <input
                  type="text"
                  value={shortsColor}
                  onChange={(e) => setShortsColor(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="#000000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Socks Color *
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={socksColor}
                  onChange={(e) => setSocksColor(e.target.value)}
                  className="h-10 w-20 rounded border border-gray-300 dark:border-gray-600"
                />
                <input
                  type="text"
                  value={socksColor}
                  onChange={(e) => setSocksColor(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="#FFFFFF"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            {kit ? 'Update Kit' : 'Create Kit'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
