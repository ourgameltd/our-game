import { Kit } from '@/types';

interface KitSelectorProps {
  kit?: Kit;
  size?: 'small' | 'medium' | 'large';
}

export default function KitSelector({ kit, size = 'small' }: KitSelectorProps) {
  if (!kit) return null;

  const swatchSize = size === 'small' ? 'w-3 h-3' : size === 'medium' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <div className="inline-flex items-center gap-2">
      <div className={`flex gap-1 ${swatchSize}`}>
        <div 
          className={`${swatchSize} rounded border border-gray-300 dark:border-gray-600`}
          style={{ backgroundColor: kit.shirtColor }}
          title="Shirt"
        />
        <div 
          className={`${swatchSize} rounded border border-gray-300 dark:border-gray-600`}
          style={{ backgroundColor: kit.shortsColor }}
          title="Shorts"
        />
        <div 
          className={`${swatchSize} rounded border border-gray-300 dark:border-gray-600`}
          style={{ backgroundColor: kit.socksColor }}
          title="Socks"
        />
      </div>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {kit.name}
      </span>
    </div>
  );
}
