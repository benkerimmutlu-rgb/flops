export function Approach() {
  const principles = [
    ['01', 'Play to Learn', 'Meaningful challenges turn curiosity into discovery.'],
    ['02', 'Learn by Doing', 'Practice with interactive tasks and real-life situations.'],
    ['03', 'Powered by Science', 'Inspired by cognitive and behavioral psychology, with room to test and improve.'],
    ['04', 'Made for Everyone', 'Experiences for children, adults, and professionals.'],
  ];
  return <section className="approach section"><div className="section-heading"><span className="eyebrow">Our approach</span><h2>We believe learning should be <em>experienced</em>, not just consumed.</h2></div><div className="principles">{principles.map(([n, title, text]) => <article key={n}><span className="principle-number">{n}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section>;
}
