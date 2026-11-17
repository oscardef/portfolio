export const siteConfig = {
  name: 'Oscar de Francesca',
  title: 'Oscar de Francesca · Software Engineer',
  // About 150 characters, so search results show it whole
  description:
    'Oscar de Francesca, software engineer in systems and machine learning: real-time C++ at Bloomberg, language models, and a Master\'s thesis at ETH Zurich.',
  url: 'https://oscar.defrancesca.com',
  email: 'oscar.defrancesca@gmail.com',
  links: {
    github: 'https://github.com/oscardef',
    linkedin: 'https://www.linkedin.com/in/oscardef',
    email: 'mailto:oscar.defrancesca@gmail.com',
  },
  keywords: [
    'Oscar de Francesca',
    'software engineer',
    'Oscar de Francesca portfolio',
    'Oscar de Francesca Bloomberg',
    'Oscar de Francesca EPFL',
    'C++ engineer',
    'low-latency systems',
    'distributed systems',
    'machine learning engineer',
    'EPFL computer science',
    'Oscar de Francesca ETH Zurich',
  ],
} as const;

// Visitor analytics: Umami on Oscar's server (stack /opt/stacks/umami on m70q), reached
// through this site's own /v/ path. Only production builds on the real domain count.
export const analytics = {
  websiteId: 'daf44701-b8a7-461f-9ec5-c5745129aea7',
  domain: 'oscar.defrancesca.com',
} as const;

// Navigation: every link scrolls to a section of the home page, in page order.
// `page` is the index page that also counts as that item (/projects, /experience).
export const navItems = [
  { label: 'Projects', href: '/#work', section: 'work', page: '/projects' },
  { label: 'Experience', href: '/#experience', section: 'experience', page: '/experience' },
  { label: 'The route', href: '/#route', section: 'route' },
  { label: 'Places', href: '/#places', section: 'places' },
  { label: 'About', href: '/#about', section: 'about' },
] as const;
