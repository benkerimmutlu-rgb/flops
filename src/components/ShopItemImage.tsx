import { LiveClockOverlay } from './LiveClockOverlay';
import { SynthPreview } from './SynthPreview';
import Image from 'next/image';
import { hourglassSand } from './clay/hourglass.js';
import { ActivityPreview } from './ActivityPreview';
import { musicRestMarkup } from './clay/music-props.js';
import { ACTIVITIES } from './clay/activity-plans.js';

export function ShopItemImage({ id, src, name, small = false }: { id: string; src: string; name: string; small?: boolean }) {
  const picture = <span className={`shop-item-picture ${small ? 'shop-item-small' : ''} ${id.startsWith('window_') ? 'shop-window-picture' : ''} ${id === 'hourglass' ? 'clay-hourglass' : ''}`}>
    <Image src={src} alt={name} width={112} height={112} className="h-full w-full object-contain" />
    <LiveClockOverlay id={id} />
    {id === 'premium_music_studio' && <span dangerouslySetInnerHTML={{__html:musicRestMarkup(id)}}/>}
    {id === 'hourglass' && <span dangerouslySetInnerHTML={{ __html: hourglassSand() }} />}
  </span>;
  if (id in ACTIVITIES) return <ActivityPreview id={id} src={src} name={name}>{picture}</ActivityPreview>;
  return id === 'synthesizer' ? <SynthPreview>{picture}</SynthPreview> : picture;
}
