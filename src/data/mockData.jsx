export const currentUser = {
  id: 1,
  name: "Srihari Sandu",
  username: "@srihari",
  avatar: "https://i.pravatar.cc/150?img=12",
};


export const posts = [

  {
    id: 1,

    user: {
      id: 101,
      name: "Priya Sharma",
      username: "@priyasharma",
      avatar: "https://i.pravatar.cc/150?img=47",
      verified: true,
    },

    title: "Goa Trip 2026",

    description:
      "Amazing trip with friends! The beaches, food and vibes were just perfect. Can't wait to go back! ❤️",

    image:
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1400&q=90",

    location: "Goa, India",

    category: "Travel",

    time: "2h ago",

    likes: 245,

    comments: 32,

    liked: false,

    saved: false,

    images: 5,
  },


  {
    id: 2,

    user: {
      id: 102,
      name: "Rahul Verma",
      username: "@rahulverma",
      avatar: "https://i.pravatar.cc/150?img=12",
      verified: true,
    },

    title: "A Peaceful Mountain Escape",

    description:
      "Sometimes all you need is a little mountain air, good company and a beautiful sunset.",

    image:
      "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1400&q=90",

    location: "Manali, India",

    category: "Travel",

    time: "5h ago",

    likes: 189,

    comments: 21,

    liked: true,

    saved: false,

    images: 8,
  },


  {
    id: 3,

    user: {
      id: 103,
      name: "Ankit Kumar",
      username: "@ankitkumar",
      avatar: "https://i.pravatar.cc/150?img=33",
      verified: false,
    },

    title: "Weekend With The Gang",

    description:
      "Good friends, great conversations and memories that will stay forever.",

    image:
      "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1400&q=90",

    location: "Hyderabad, India",

    category: "Events",

    time: "Yesterday",

    likes: 143,

    comments: 18,

    liked: false,

    saved: true,

    images: 4,
  },


  {
    id: 4,

    user: {
      id: 104,
      name: "Sneha Reddy",
      username: "@snehareddy",
      avatar: "https://i.pravatar.cc/150?img=44",
      verified: true,
    },

    title: "Little Moments 🌸",

    description:
      "Beautiful little moments are sometimes the memories we remember the longest.",

    image:
      "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1400&q=90",

    location: "Kerala, India",

    category: "Nature",

    time: "2 days ago",

    likes: 321,

    comments: 42,

    liked: false,

    saved: false,

    images: 6,
  },

];


export const suggestedUsers = [

  {
    id: 201,
    name: "Rahul Verma",
    username: "@rahulverma",
    avatar: "https://i.pravatar.cc/150?img=12",
    memories: "124 memories",
  },

  {
    id: 202,
    name: "Priya Singh",
    username: "@priyasingh",
    avatar: "https://i.pravatar.cc/150?img=32",
    memories: "98 memories",
  },

  {
    id: 203,
    name: "Ankit Kumar",
    username: "@ankitkumar",
    avatar: "https://i.pravatar.cc/150?img=33",
    memories: "76 memories",
  },

  {
    id: 204,
    name: "Sneha Reddy",
    username: "@snehareddy",
    avatar: "https://i.pravatar.cc/150?img=44",
    memories: "64 memories",
  },

];


export const categories = [

  {
    name: "Travel",
    emoji: "✈️",
    className: "category-blue",
  },

  {
    name: "Wedding",
    emoji: "💍",
    className: "category-pink",
  },

  {
    name: "Events",
    emoji: "🎉",
    className: "category-purple",
  },

  {
    name: "Nature",
    emoji: "🌿",
    className: "category-green",
  },

  {
    name: "Family",
    emoji: "👨‍👩‍👧",
    className: "category-orange",
  },

  {
    name: "Food",
    emoji: "🍴",
    className: "category-yellow",
  },

];


export const locations = [

  {
    id: 1,
    name: "Goa",
    memories: "2.4K memories",
    image:
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=300&q=80",
  },

  {
    id: 2,
    name: "Manali",
    memories: "1.8K memories",
    image:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=300&q=80",
  },

  {
    id: 3,
    name: "Kerala",
    memories: "1.3K memories",
    image:
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=300&q=80",
  },

  {
    id: 4,
    name: "Bengaluru",
    memories: "980 memories",
    image:
      "https://images.unsplash.com/photo-1596176530529-78163a4f8909?auto=format&fit=crop&w=300&q=80",
  },

];