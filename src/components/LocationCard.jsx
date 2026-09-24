import {
  ChevronRight,
  MapPin,
} from "lucide-react";


function LocationCard({ location }) {

  return (
    <button className="location-card">

      <div className="location-thumbnail">

        <img
          src={location.image}
          alt={location.name}
        />

      </div>


      <div className="location-info">

        <strong>
          {location.name}
        </strong>

        <span>
          {location.memories}
        </span>

      </div>


      <div className="location-arrow">

        <ChevronRight size={17} />

      </div>

    </button>
  );
}

export default LocationCard;
