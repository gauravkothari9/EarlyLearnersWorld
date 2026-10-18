import { useState } from 'react';
import StyleCanvas from './StyleCanvas';

/** Style card. The preview is drawn live and plays while the pointer is over the card. */
export default function CategoryCard({ category, settings, onSelect }) {
  const [hover, setHover] = useState(false);
  return (
    <button type="button" className="category-card" onClick={() => onSelect(category)}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)} onBlur={() => setHover(false)}>
      <div className="category-media">
        <StyleCanvas styleId={category.id} settings={settings} playing={hover} />
        <span className="group-badge">{category.group}</span>
        {category.published > 0 && <span className="count-badge">{category.published} published</span>}
      </div>
      <div className="category-body">
        <span className="category-name">{category.name}</span>
        <span className="category-desc">{category.description}</span>
      </div>
    </button>
  );
}
