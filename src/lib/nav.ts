/** Sidebar structure, deliberately mirroring the public site's own sections. */
export const navGroups = [
  {
    label: "Overview",
    items: [{ href: "/", label: "Dashboard" }],
  },
  {
    label: "Home page",
    items: [
      { href: "/hero", label: "Hero" },
      { href: "/about", label: "About me" },
      { href: "/content-portfolio", label: "Content portfolio" },
      { href: "/platforms/instagram", label: "Instagram", match: "/platforms/instagram" },
      { href: "/platforms/tiktok", label: "TikTok", match: "/platforms/tiktok" },
      { href: "/platforms/youtube", label: "YouTube", match: "/platforms/youtube" },
      { href: "/journey", label: "Professional journey" },
      { href: "/projects", label: "Projects & campaigns" },
      { href: "/collaborations", label: "Collaborations" },
      { href: "/podcast-media", label: "Podcast & media" },
      { href: "/career", label: "Career snapshot & CV" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    label: "Content pages",
    items: [
      { href: "/works/professional-work", label: "Professional work" },
      { href: "/works/self-content", label: "Self content" },
      { href: "/content-split", label: "Content landing" },
    ],
  },
  {
    label: "Manage",
    items: [
      { href: "/submissions", label: "Contact submissions" },
      { href: "/media", label: "Media library" },
      { href: "/navigation", label: "Site menu" },
    ],
  },
] as const;
