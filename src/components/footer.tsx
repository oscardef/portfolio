import { Github, Linkedin, Mail } from 'lucide-react';
import { siteConfig } from '@/lib/constants';

const socialLinks = [
  { href: siteConfig.links.github, icon: Github, label: 'GitHub' },
  { href: siteConfig.links.linkedin, icon: Linkedin, label: 'LinkedIn' },
  { href: siteConfig.links.email, icon: Mail, label: 'Email' },
];

export function Footer() {
  return (
    <footer className="border-t border-border mt-24">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-text-muted">
            © {new Date().getFullYear()} {siteConfig.name}. Built with Next.js &amp; Tailwind.
          </p>
          <div className="flex items-center gap-4">
            {socialLinks.map(({ href, icon: Icon, label }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith('mailto:') ? undefined : '_blank'}
                rel={href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                className="text-text-muted hover:text-text-primary transition-colors p-2"
                aria-label={label}
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
