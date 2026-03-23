export interface Project {
  slug: string;
  title: string;
  description: string;
  bullets: string[];
  github: string;
  demo: "chess" | "video" | "screenshot" | null;
  videoUrl?: string;       // YouTube embed URL or direct gif/mp4
  screenshotUrl?: string;  // path to screenshot image
}

export const projects: Project[] = [
  {
    slug: "rl-agent-racecar",
    title: "rl-agent-racecar",
    description: "Reinforcement learning race car agent trained with PPO",
    bullets: [
      "Designed and optimized the reward function with waypoints, stagnation penalties, and crash avoidance",
      "Debugged slow/circular driving and crashes via reward and environment shaping",
      "Tuned PPO hyperparameters to balance exploration and exploitation, improving training outcomes",
    ],
    github: "https://github.com/nli33/rl-agent-racecar",
    demo: "video",
    videoUrl: "", // TODO: paste YouTube embed URL or gif link
  },
  {
    slug: "silverfish",
    title: "silverfish",
    description: "Chess engine with a neural network position evaluator",
    bullets: [
      "Trained an efficiently updatable neural network in PyTorch to evaluate Chess positions",
      "Increased search speed by 57% by using bitboards to store positions and profiling bottlenecks",
      "Reduced NN evaluation overhead by 44%, increasing engine throughput and positions searched",
      "Maintained project with automated CI pipeline with GitHub Actions",
    ],
    github: "https://github.com/nli33/silverfish",
    demo: "chess",
  },
  {
    slug: "website-time-tracker",
    title: "website-time-tracker",
    description: "Privacy-first Chrome extension for tracking time spent per website",
    bullets: [
      "Implemented event-driven time tracking using Manifest V3 APIs to accurately measure active browsing time",
      "Designed a local-only persistence layer with per-day aggregation and timeline visualization",
    ],
    github: "https://github.com/nli33/website-time-tracker",
    demo: "screenshot",
    screenshotUrl: "", // TODO: add screenshot path or URL
  },
  {
    slug: "vodka",
    title: "vodka",
    description: "Password manager in Rust with AES-256 encryption",
    bullets: [
      "Implemented secure storage using AES-256 encryption within an SQLite database",
      "Developed master key authentication using Argon2id",
      "Improved user experience through secure clipboard integration for quick password retrieval",
    ],
    github: "https://github.com/nli33/vodka",
    demo: "screenshot",
    screenshotUrl: "", // TODO: add screenshot path or URL
  },
];
