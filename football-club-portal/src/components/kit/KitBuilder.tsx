import { useState } from 'react';
import { Kit, KitPattern } from '@/types';
import { KitShirtSvg, KitShortsSvg, KitSocksSvg } from './KitSvgParts';

interface KitBuilderProps {
  kit?: Kit;
  onSave: (kit: Omit<Kit, 'id'>) => void;
  onCancel: () => void;
}

const patternOptions: { value: KitPattern; label: string }[] = [
  { value: 'solid', label: 'Solid' },
  { value: 'vertical-stripes', label: 'Vertical Stripes' },
  { value: 'horizontal-stripes', label: 'Horizontal Stripes' },
];

export default function KitBuilder({ kit, onSave, onCancel }: KitBuilderProps) {
  const [name, setName] = useState(kit?.name || '');
  const [type, setType] = useState<Kit['type']>(kit?.type || 'home');
  const [pattern, setPattern] = useState<KitPattern>(kit?.shirt.pattern || 'solid');
  const [primaryColor, setPrimaryColor] = useState(kit?.shirt.primaryColor || '#FF0000');
  const [secondaryColor, setSecondaryColor] = useState(kit?.shirt.secondaryColor || '#FFFFFF');
  const [sleeveColor, setSleeveColor] = useState(kit?.shirt.sleeveColor || '');
  const [shortsColor, setShortsColor] = useState(kit?.shorts.color || '#000000');
  const [socksColor, setSocksColor] = useState(kit?.socks.color || '#FFFFFF');
  const [isActive, setIsActive] = useState(kit?.isActive ?? true);

  const needsSecondaryColor = pattern !== 'solid';
  const canHaveSleeveColor = pattern === 'solid';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('Please enter a kit name');
      return;
    }

    const kitData: Omit<Kit, 'id'> = {
      name: name.trim(),
      type,
      shirt: {
        pattern,
        primaryColor,
        ...(needsSecondaryColor && { secondaryColor }),
        ...(sleeveColor && canHaveSleeveColor && { sleeveColor }),
      },
      shorts: {
        color: shortsColor,
      },
      socks: {
        color: socksColor,
      },
      isActive,
    };

    onSave(kitData);
  };

  // Generate preview of the kit
  const getShirtPreview = () => {
    const previewKitId = `builder-${kit?.id ?? 'new'}`;

    const shirt = {
      pattern,
      primaryColor,
      secondaryColor: pattern === 'solid' ? undefined : secondaryColor,
      sleeveColor: sleeveColor || undefined,
    };

    return (
      <div className="space-y-4">
        {/* Shirt Preview */}
        <div>
          <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Shirt</h4>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 flex justify-center">
            <KitShirtSvg kitId={previewKitId} shirt={shirt} className="w-48 h-auto text-gray-700 dark:text-gray-200" />
          </div>
        </div>
        
        {/* Shorts Preview */}
        <div>
          <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Shorts</h4>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 flex justify-center">
            <KitShortsSvg shortsColor={shortsColor} className="w-48 h-auto text-gray-700 dark:text-gray-200" />
          </div>
        </div>
        
        {/* Socks Preview */}
        <div>
          <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Socks</h4>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 flex justify-center">
            <KitSocksSvg socksColor={socksColor} className="h-28 w-auto text-gray-700 dark:text-gray-200" />
          </div>
        </div>
      </div>
    );
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Shirt Pattern *
              </label>
              <select
                value={pattern}
                onChange={(e) => setPattern(e.target.value as KitPattern)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {patternOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Primary Shirt Color *
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-10 w-20 rounded border border-gray-300 dark:border-gray-600"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="#FF0000"
                />
              </div>
            </div>

            {needsSecondaryColor && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Secondary Shirt Color *
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="h-10 w-20 rounded border border-gray-300 dark:border-gray-600"
                  />
                  <input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="#FFFFFF"
                  />
                </div>
              </div>
            )}

            {canHaveSleeveColor && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sleeve Color (Optional)
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    type="color"
                    value={sleeveColor || primaryColor}
                    onChange={(e) => setSleeveColor(e.target.value)}
                    className="h-10 w-20 rounded border border-gray-300 dark:border-gray-600"
                  />
                  <input
                    type="text"
                    value={sleeveColor}
                    onChange={(e) => setSleeveColor(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Leave empty for same as primary"
                  />
                </div>
              </div>
            )}

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

          {/* Right Column - Preview */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Preview</h4>
            {getShirtPreview()}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
