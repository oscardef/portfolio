import Link from 'next/link';
import { Github, Linkedin, Mail } from 'lucide-react';
import { siteConfig } from '@/lib/constants';

const socialLinks = [
  { href: siteConfig.links.github, icon: Github, label: 'GitHub' },
  { href: siteConfig.links.linkedin, icon: Linkedin, label: 'LinkedIn' },
  { href: siteConfig.links.email, icon: Mail, label: 'Email' },
];

const footerLink = 'underline decoration-border-hover underline-offset-4 transition-colors hover:text-text-primary';

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="container-page py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-sm text-text-muted sm:justify-start">
            <span>
              © {new Date().getFullYear()} {siteConfig.name}
            </span>
            <Link href="/projects/portfolio" scroll={false} className={footerLink}>
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
                className="p-2 text-text-muted transition-colors hover:text-text-primary"
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
