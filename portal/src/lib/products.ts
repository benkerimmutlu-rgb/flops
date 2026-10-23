export type Product = {
  id: string; name: string; category: string; description: string;
  status: 'available' | 'development'; href?: string; action?: string;
  image?: string; color: string;
};
export const products: Product[] = [
  { id: 'flops', name: 'FLOPS', category: 'Geography & Culture', description: 'Explore countries, discover cultures, collect flags, and travel the world with your friendly pug companion.', status: 'available', href: '/flops', action: 'Play Now', image: '/viva/flops.webp', color: 'peach' },
  { id: 'lafla', name: 'LaФla', category: 'Language Learning', description: 'Learn Turkish through real-life situations, everyday expressions, and cultural discoveries.', status: 'available', href: 'https://lafla.app', action: 'Open LaФla', image: '/viva/turkish-tea.webp', color: 'sage' },
  { id: 'iznanka', name: 'IZNANKA', category: 'Psychology & Self-Development', description: 'Explore human behavior and psychological concepts through interactive learning experiences.', status: 'development', color: 'lavender' },
  { id: 'groups', name: 'Group Dynamics Lab', category: 'Leadership & Team Dynamics', description: 'Practice understanding and leading groups through realistic interactive simulations.', status: 'development', color: 'blue' },
  { id: 'business', name: 'Business Partner Academy', category: 'Professional Development', description: 'Develop business acumen, HR expertise, and change management skills through practical business simulations.', status: 'development', color: 'sand' },
];
// Future access belongs to each product; no shared child profiles or payment data.
export type AccessOffering = 'premium' | 'family' | 'corporate';
export type ProductAccess = { productId: Product['id']; offering: AccessOffering; accountId: string };
