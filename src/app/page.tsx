import Image from 'next/image';
import { RouteMap } from '@/components/route-map';
import { Journey } from '@/components/journey';
import { Places } from '@/components/places';
import { EmailLink } from '@/components/email-link';
import { getJourney } from '@/lib/journey';
import { siteConfig } from '@/lib/constants';

const container = 'mx-auto max-w-[1200px] px-4 sm:px-6 md:px-10';

export default async function HomePage() {
  const { chapters, groups } = await getJourney();

  return (
    <>
      <section id="top" aria-label="Introduction" className={`${container} pt-28 md:pt-36`}>
        <h1 className="display">
          Oscar
          <br />
          de Francesca
        </h1>
        <div className="mt-8 grid gap-5 md:mt-12 md:grid-cols-2 md:gap-10">
          <p className="max-w-[30ch] text-[1.375rem] leading-snug md:text-[1.625rem]">
            Software engineer, Swedish and American, born in Bangkok and raised across Asia, the
            Middle East and Europe.
          </p>
          <p className="max-w-[50ch] text-ink-2 md:pt-1.5">
            I’ve built low-latency C++ at Bloomberg, firmware for RFID wristbands and language models
            from scratch, and taught hundreds of students as a teaching assistant and maths tutor.
            Right now I’m in Basel, writing my master’s thesis at ETH Zurich.
          </p>
        </div>
        <div className="mt-14 md:mt-20">
          <RouteMap />
        </div>
      </section>

      <Journey chapters={chapters} groups={groups} />

      <section id="places" aria-labelledby="places-title" className={`${container} py-24 md:py-32`}>
        <h2 id="places-title" className="section-title">
          Places I’ve been
        </h2>
        <Places />
      </section>

      <section id="about" aria-labelledby="about-title" className={`${container} py-24 md:py-32`}>
        <div className="grid gap-12 md:grid-cols-[1fr_18rem] md:gap-20">
          <div>
            <h2 id="about-title" className="section-title">
              Beyond the work
            </h2>
            <div className="mt-8 max-w-[60ch] space-y-5 text-[1.125rem] leading-relaxed text-ink-2">
              <p>
                Growing up across six countries taught me to arrive somewhere unfamiliar and work out
                quickly how it fits together. I do the same with every new codebase, team and field,
                which is how I’ve ended up working on everything from message routing to antibody
                design.
              </p>
              <p>
                I tutor maths on the side. Between that and seven courses as a teaching assistant,
                I’ve taught hundreds of students, and building Mathium is my way of making the
                tutoring better.
              </p>
              <p>
                I like building quickly with a good team. At LauzHack 2025 we took third place
                overall, and second in the Huawei challenge, with an AI presentation coach built in
                under 48 hours.
              </p>
              <p>
                I speak English and Swedish natively, and I travel whenever I get the chance. The map
                above keeps growing.
              </p>
            </div>
          </div>
          <Image
            src="/images/portrait.jpg"
            alt="Oscar de Francesca"
            width={576}
            height={768}
            sizes="(max-width: 768px) 60vw, 288px"
            className="aspect-[3/4] w-3/5 rounded-[3px] border border-rule object-cover md:mt-3 md:w-full"
          />
        </div>
      </section>

      <section id="contact" aria-labelledby="contact-title" className="border-t border-rule">
        <div className={`${container} py-24 md:py-32`}>
          <h2 id="contact-title" className="section-title">
            Get in touch
          </h2>
          <p className="mt-5 max-w-[52ch] text-[1.125rem] text-ink-2">
            I’m always happy to hear from people, whether it’s about something on this page, an idea,
            or an opportunity worth talking about. Email is the best way to reach me.
          </p>
          <div className="mt-10">
            <EmailLink address={siteConfig.email} />
          </div>
          <ul className="mt-10 flex gap-6 text-[0.9375rem]">
            <li>
              <a
                href={siteConfig.links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-ink-3 underline-offset-4 hover:decoration-ink"
              >
                LinkedIn
              </a>
            </li>
            <li>
              <a
                href={siteConfig.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-ink-3 underline-offset-4 hover:decoration-ink"
              >
                GitHub
              </a>
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}
