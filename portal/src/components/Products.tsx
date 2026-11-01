import Image from 'next/image';
import { products } from '@/lib/products';

// Чередование фирменных тинтов обложки: бирюза (по умолчанию) · жёлтый · розовый.
const TINTS = ['', 'yellow', 'pink', '', 'yellow'];

export function Products() {
  return <div className="products-grid">{products.map((product, i) => {
    const kind = TINTS[i % TINTS.length];
    const available = product.status === 'available';
    return <article className="product-card" key={product.id}>
      <div className={`cover ${kind} ${product.image ? 'has-media' : ''}`.trim()}>
        <b>{product.category}</b>
        {product.image
          ? <Image src={product.image} alt={product.id === 'flops' ? 'Flops, our clay pug companion' : 'A sculpted Turkish tea glass'} width={320} height={260} />
          : <span className="chev" aria-hidden="true" />}
      </div>
      <div className="card-body">
        <span className={`badge ${available ? kind : 'muted'}`.trim()}>{available ? 'Available Now' : 'In Development'}</span>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <div className="card-actions">
          {product.href
            ? <a className="button secondary" href={product.href} {...(product.href.startsWith('https:') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{product.action}</a>
            : <button className="button secondary" disabled>Coming Soon</button>}
        </div>
      </div>
    </article>;
  })}</div>;
}
