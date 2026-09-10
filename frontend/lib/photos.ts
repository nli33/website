export interface Photo {
  src: string;
  alt: string;
  caption: string;
}

export const photos: Photo[] = [
  {
    src: "/photos/mountains.jpg",
    alt: "Mist rolling through sandstone mountain pillars covered in forest",
    caption: "Fog rolling through the sandstone pillars, minutes after the rain stopped.",
  },
  {
    src: "/photos/sunset.jpg",
    alt: "A pink and orange sunset over a suburban street with melting snow",
    caption: "Late-winter sunset on my street, snow still hanging on in the corners.",
  },
  {
    src: "/photos/milky-way.jpg",
    alt: "The Milky Way galaxy with a faint meteor streak and Andromeda visible",
    caption: "The Milky Way on a clear night — if you look closely, that's Andromeda in the lower left.",
  },
];
