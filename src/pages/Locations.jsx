import React, { useState } from "react";
import {
  MapPin,
  ArrowUpRight,
  Camera,
  Navigation,
  Heart,
  Map,
  Search,
} from "lucide-react";

import locations from "../data/locations";
import "./Locations.css";

export default function Locations() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] =
    useState(null);

  const filteredLocations = locations.filter(
    (location) =>
      location.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      location.country
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const featuredLocation =
    filteredLocations.length > 0
      ? filteredLocations[0]
      : locations[0];

  const handleLocationClick = (location) => {
    setSelectedLocation(location);
  };

  return (
    <div className="locations-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="locations-header">

        <div>

          <div className="locations-eyebrow">
            <MapPin size={16} />
            DISCOVER PLACES
          </div>

          <h1>
            Explore locations
          </h1>

          <p>
            Discover beautiful places and create
            unforgettable memories around India.
          </p>

        </div>

        <div className="locations-header-icon">
          <Map size={26} />
        </div>

      </section>


      {/* =====================================================
          SEARCH
      ===================================================== */}

      <section className="locations-search">

        <Search size={19} />

        <input
          type="text"
          value={searchTerm}
          onChange={(event) =>
            setSearchTerm(event.target.value)
          }
          placeholder="Search for a place..."
        />

      </section>


      {/* =====================================================
          FEATURED LOCATION
      ===================================================== */}

      {featuredLocation && (
        <section
          className="featured-location"
          onClick={() =>
            handleLocationClick(featuredLocation)
          }
        >

          <div className="featured-location-image">

            <img
              src={featuredLocation.image}
              alt={featuredLocation.name}
              loading="eager"
              onError={(event) => {
                event.currentTarget.style.display =
                  "none";
              }}
            />

          </div>

          <div className="featured-location-overlay"></div>

          <div className="featured-location-content">

            <div className="featured-location-label">
              <Camera size={16} />
              FEATURED LOCATION
            </div>

            <h2>
              {featuredLocation.name}
            </h2>

            <div className="featured-location-meta">

              <span>
                <MapPin size={15} />
                {featuredLocation.country}
              </span>

              <span>
                <Heart size={15} />
                {featuredLocation.memories} memories
              </span>

            </div>

            {featuredLocation.description && (
              <p>
                {featuredLocation.description}
              </p>
            )}

            <button
              type="button"
              className="featured-location-button"
              onClick={(event) => {
                event.stopPropagation();
                handleLocationClick(
                  featuredLocation
                );
              }}
            >
              Explore location
              <ArrowUpRight size={17} />
            </button>

          </div>

        </section>
      )}


      {/* =====================================================
          SECTION HEADER
      ===================================================== */}

      <section className="locations-section-header">

        <div>

          <div className="locations-section-label">
            <Navigation size={15} />
            POPULAR PLACES
          </div>

          <h2>
            Places worth remembering
          </h2>

          <p>
            Explore {locations.length} beautiful
            destinations across India.
          </p>

        </div>

        <div className="locations-count">

          <strong>
            {filteredLocations.length}
          </strong>

          <span>
            places
          </span>

        </div>

      </section>


      {/* =====================================================
          LOCATION GRID
      ===================================================== */}

      {filteredLocations.length > 0 ? (

        <section className="locations-grid">

          {filteredLocations.map(
            (location, index) => {

              const isFeatured =
                location.id ===
                featuredLocation?.id;

              return (
                <button
                  type="button"
                  className={`location-card ${
                    isFeatured
                      ? "location-card-featured"
                      : ""
                  }`}
                  key={
                    location.id ||
                    `${location.name}-${index}`
                  }
                  onClick={() =>
                    handleLocationClick(location)
                  }
                >

                  {/* Image */}

                  <div className="location-thumbnail">

                    <img
                      src={location.image}
                      alt={location.name}
                      loading={
                        index < 6
                          ? "eager"
                          : "lazy"
                      }
                      onError={(event) => {
                        event.currentTarget.style.display =
                          "none";
                      }}
                    />

                    <div className="location-image-overlay"></div>

                    <div className="location-number">
                      {String(index + 1).padStart(
                        2,
                        "0"
                      )}
                    </div>

                  </div>


                  {/* Information */}

                  <div className="location-info">

                    <strong>
                      {location.name}
                    </strong>

                    <span>
                      <MapPin size={13} />

                      {location.country ||
                        "India"}
                    </span>

                    <small>
                      {location.memories ||
                        0}{" "}
                      memories
                    </small>

                  </div>


                  {/* Arrow */}

                  <div className="location-arrow">

                    <ArrowUpRight
                      size={17}
                    />

                  </div>

                </button>
              );
            }
          )}

        </section>

      ) : (

        /* =================================================
           NO SEARCH RESULTS
        ================================================== */

        <section className="locations-empty">

          <div className="locations-empty-icon">
            <MapPin size={28} />
          </div>

          <h3>
            No locations found
          </h3>

          <p>
            Try searching for another
            destination.
          </p>

        </section>

      )}


      {/* =====================================================
          SELECTED LOCATION
      ===================================================== */}

      {selectedLocation && (

        <div
          className="location-modal"
          onClick={() =>
            setSelectedLocation(null)
          }
        >

          <div
            className="location-modal-card"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              type="button"
              className="location-modal-close"
              onClick={() =>
                setSelectedLocation(null)
              }
              aria-label="Close"
            >
              ×
            </button>

            <div className="location-modal-image">

              <img
                src={selectedLocation.image}
                alt={selectedLocation.name}
              />

            </div>

            <div className="location-modal-content">

              <div className="locations-eyebrow">
                <MapPin size={15} />
                LOCATION
              </div>

              <h2>
                {selectedLocation.name}
              </h2>

              <div className="location-modal-meta">

                <span>
                  <MapPin size={15} />
                  {selectedLocation.country ||
                    "India"}
                </span>

                <span>
                  <Heart size={15} />
                  {selectedLocation.memories ||
                    0}{" "}
                  memories
                </span>

              </div>

              {selectedLocation.description && (
                <p>
                  {selectedLocation.description}
                </p>
              )}

              <button
                type="button"
                className="featured-location-button"
                onClick={() =>
                  setSelectedLocation(null)
                }
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}