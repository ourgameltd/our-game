import { Kit } from '@/types';
import { KitShirtSvg } from './KitSvgParts';

interface KitSelectorProps {
  kit?: Kit;
  size?: 'small' | 'medium' | 'large';
}

export default function KitSelector({ kit, size = 'small' }: KitSelectorProps) {
  if (!kit) return null;

  const getShirtSvg = () => <KitShirtSvg kitId={`selector-${kit.id}`} shirt={kit.shirt} className="w-full h-auto text-gray-700 dark:text-gray-200" />;

  return (
    <div className="inline-flex items-center gap-2">
      <div style={{ width: size === 'small' ? '40px' : size === 'medium' ? '60px' : '80px' }}>
        {getShirtSvg()}
      </div>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {kit.name}
      </span>
    </div>
  );
}
