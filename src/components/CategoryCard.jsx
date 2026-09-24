function CategoryCard({ category }) {

  return (
    <button
      className={`category-card ${category.className}`}
    >

      <span className="category-emoji">
        {category.emoji}
      </span>

      <span className="category-name">
        {category.name}
      </span>

    </button>
  );
}

export default CategoryCard;