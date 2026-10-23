import Image from 'next/image';
import { products } from '@/lib/products';
export function Products() {
  return <div className="products-grid">{products.map(product => <article className={`product-card ${product.color} ${product.status === 'available' ? 'featured' : ''}`} key={product.id}>
    {product.image && <div className="product-visual"><Image src={product.image} alt={product.id === 'flops' ? 'Flops, our clay pug companion' : 'A sculpted Turkish tea glass'} width={340} height={300} /></div>}
    <div className="product-copy"><span className="eyebrow">{product.category}</span><h3>{product.name}</h3><p>{product.description}</p><div className="card-bottom"><span className={`status ${product.status}`}>{product.status === 'available' ? 'Available Now' : 'In Development'}</span>
    {product.href ? <a className="text-link" href={product.href} {...(product.href.startsWith('https:') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{product.action} <span aria-hidden="true">↗</span></a> : <button className="coming-soon" disabled>Coming Soon</button>}</div></div>
  </article>)}</div>;
}
