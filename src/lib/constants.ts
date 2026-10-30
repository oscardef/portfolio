export const siteConfig = {
  name: 'Oscar de Francesca',
  title: 'Oscar de Francesca · Software Engineer',
  description:
    'Oscar de Francesca: software engineer, Swedish and American, raised across Asia, the Middle East and Europe. Systems and machine learning, from real-time C++ at Bloomberg to language models and a Master\'s thesis at ETH Zurich.',
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

// Sections of the home page, in order, for the navigation
export const sections = [
  { id: 'journey', label: 'Route' },
  { id: 'places', label: 'Places' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
] as const;
