import React from "react";

import {
  Plane,
  Heart,
  Camera,
  Utensils,
  Trees,
  Cake,
  Music,
  BookOpen,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

import "./Categories.css";

const categories = [
  {
    name: "Travel",
    count: "2.4K memories",
    description: "Trips, adventures and unforgettable journeys.",
    Icon: Plane,
    className: "category-blue",
  },
  {
    name: "Family",
    count: "1.9K memories",
    description: "Special moments shared with the people you love.",
    Icon: Heart,
    className: "category-pink",
  },
  {
    name: "Photography",
    count: "1.6K memories",
    description: "Your favourite photographs and visual stories.",
    Icon: Camera,
    className: "category-purple",
  },
  {
    name: "Food",
    count: "982 memories",
    description: "Restaurants, recipes and delicious experiences.",
    Icon: Utensils,
    className: "category-orange",
  },
  {
    name: "Nature",
    count: "1.3K memories",
    description: "Mountains, beaches, forests and peaceful places.",
    Icon: Trees,
    className: "category-green",
  },
  {
    name: "Birthdays",
    count: "756 memories",
    description: "Birthday celebrations and special surprises.",
    Icon: Cake,
    className: "category-yellow",
  },
  {
    name: "Music",
    count: "634 memories",
    description: "Concerts, songs and moments connected to music.",
    Icon: Music,
    className: "category-red",
  },
  {
    name: "Books",
    count: "421 memories",
    description: "Favourite books, reading moments and ideas.",
    Icon: BookOpen,
    className: "category-indigo",
  },
];

export default function Categories() {
  return (
    <div className="categories-page">

      {/* Header */}
      <div className="categories-heading">

        <div>
          <div className="categories-eyebrow">
            <Sparkles size={15} />
            DISCOVER
          </div>

          <h1>Memory Categories</h1>

          <p>
            Explore memories organized by what matters.
          </p>
        </div>

        <button className="categories-explore-button">
          Explore memories
          <ArrowUpRight size={17} />
        </button>

      </div>

      {/* Featured category */}
      <section className="categories-featured">

        <div className="categories-featured-icon">
          <Plane size={31} />
        </div>

        <div className="categories-featured-text">
          <span>Most popular</span>
          <h2>Travel memories</h2>
          <p>
            Explore your journeys, destinations and
            unforgettable adventures.
          </p>
        </div>

        <div className="categories-featured-count">
          <strong>2.4K</strong>
          <span>memories</span>
        </div>

      </section>

      {/* Categories */}
      <div className="categories-section-heading">
        <div>
          <h2>Browse categories</h2>
          <p>
            Find memories based on your favourite moments.
          </p>
        </div>
      </div>

      <div className="categories-grid">

        {categories.map((category) => {

          const Icon = category.Icon;

          return (
            <button
              className={`memory-category-card ${category.className}`}
              key={category.name}
              type="button"
            >

              <div className="category-card-top">

                <div className="category-icon">
                  <Icon size={25} />
                </div>

                <div className="category-arrow">
                  <ArrowUpRight size={18} />
                </div>

              </div>

              <div className="category-card-content">

                <h3>
                  {category.name}
                </h3>

                <span>
                  {category.count}
                </span>

                <p>
                  {category.description}
                </p>

              </div>

            </button>
          );
        })}

      </div>

    </div>
  );
}