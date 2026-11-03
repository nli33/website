export interface MediaItem {
  image: string;
  title: string;
  subtitle: string;
  ovr: number;
}

export const media: MediaItem[] = [
  { image: "/media/ats.png", title: "A Thousand Suns", subtitle: "album", ovr: 99 },
  { image: "/media/montecristo.png", title: "The Count of Monte Cristo", subtitle: "novel", ovr: 99 },
  { image: "/media/3bp.png", title: "The Three-Body Problem", subtitle: "novel", ovr: 98 },
  { image: "/media/prestige.png", title: "The Prestige", subtitle: "movie", ovr: 94 },
  { image: "/media/matrix.png", title: "The Matrix", subtitle: "movie", ovr: 93 },
  { image: "/media/hamilton.png", title: "Hamilton", subtitle: "musical", ovr: 85 },
];
