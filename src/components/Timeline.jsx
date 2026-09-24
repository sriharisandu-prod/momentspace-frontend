// src/components/Timeline.jsx
import { Link } from "react-router-dom";

const Timeline = ({ memories }) => {
  // Group memories by month
  const grouped = memories.reduce((acc, memory) => {
    const month = new Date(memory.createdAt).toLocaleString("default", { month: "long", year: "numeric" });
    if (!acc[month]) acc[month] = [];
    acc[month].push(memory);
    return acc;
  }, {});

  return (
    <div className="mt-6">
      {Object.keys(grouped).map((month) => (
        <div key={month} className="mb-6">
          <h2 className="text-xl font-semibold mb-3">{month}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {grouped[month].map((m) => (
              <Link to={`/memory/${m.id}`} key={m.id}>
                <img
                  src={m.imageUrl}
                  alt={m.title}
                  className="w-full h-40 object-cover rounded-md shadow"
                />
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Timeline;
