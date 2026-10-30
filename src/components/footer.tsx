import Link from 'next/link';
import { Github, Linkedin, Mail } from 'lucide-react';
import { siteConfig } from '@/lib/constants';

const socialLinks = [
  { href: siteConfig.links.github, icon: Github, label: 'GitHub' },
  { href: siteConfig.links.linkedin, icon: Linkedin, label: 'LinkedIn' },
  { href: siteConfig.links.email, icon: Mail, label: 'Email' },
];

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="container-page py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-text-muted">
            © {new Date().getFullYear()} {siteConfig.name}.{' '}
            <Link href="/projects/portfolio" scroll={false} className="underline decoration-border-hover underline-offset-4 hover:text-text-primary">
              How this site is built
            </Link>
          </p>
          <div className="flex items-center gap-4">
            {socialLinks.map(({ href, icon: Icon, label }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith('mailto:') ? undefined : '_blank'}
                rel={href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                className="text-text-muted hover:text-accent transition-colors p-2"
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
