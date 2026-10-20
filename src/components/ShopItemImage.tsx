import { SynthPreview } from './SynthPreview';
import Image from 'next/image';
import { hourglassSand } from './clay/hourglass.js';

export function ShopItemImage({ id, src, name, small = false }: { id: string; src: string; name: string; small?: boolean }) {
  const picture = <span className={`shop-item-picture ${small ? 'shop-item-small' : ''} ${id === 'hourglass' ? 'clay-hourglass' : ''}`}>
    <Image src={src} alt={name} width={112} height={112} className="h-full w-full object-contain" />
    {id === 'hourglass' && <span dangerouslySetInnerHTML={{ __html: hourglassSand() }} />}
  </span>;
  return id === 'synthesizer' ? <SynthPreview>{picture}</SynthPreview> : picture;
}
