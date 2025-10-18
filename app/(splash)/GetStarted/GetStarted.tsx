"use client";

import {
  SiApple,
  SiFacebook,
  SiGithub,
  SiGoogle,
  SiInstagram,
  SiX,
  SiYoutube,
} from "@icons-pack/react-simple-icons";
import {
  Announcement,
  AnnouncementTag,
  AnnouncementTitle,
} from "@/components/kibo-ui/announcement";
import {
  Marquee,
  MarqueeContent,
  MarqueeFade,
  MarqueeItem,
} from "@/components/kibo-ui/marquee";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";

const logos = [
  { name: "GitHub", icon: SiGithub, url: "https://github.com" },
  { name: "Facebook", icon: SiFacebook, url: "https://facebook.com" },
  { name: "Google", icon: SiGoogle, url: "https://google.com" },
  { name: "X", icon: SiX, url: "https://x.com" },
  { name: "Apple", icon: SiApple, url: "https://apple.com" },
  { name: "Instagram", icon: SiInstagram, url: "https://instagram.com" },
  { name: "YouTube", icon: SiYoutube, url: "https://youtube.com" },
];

export const GetStarted = () => {
  const [ , setShowVideo] = useState(false);

  useEffect(() => {
    const timerId = setTimeout(() => setShowVideo(true), 1000);
    return () => clearTimeout(timerId);
  }, []);

  return (
    <div className="flex grow flex-col">
      <div className="container mb-20 flex grow flex-col items-center justify-center">
        <div className="flex w-full max-w-5xl flex-col gap-16 px-4 py-16 text-center md:px-8">
          <div className="flex flex-col items-center justify-center gap-6">
            <Link href="#">
              <Announcement>
                <AnnouncementTag>Latest</AnnouncementTag>
                <AnnouncementTitle>A/B test hundreds of ad variants with one click.
                </AnnouncementTitle>
              </Announcement>
            </Link>
            <h1 className="mb-0 text-balance text-5xl font-semibold md:text-6xl xl:text-[5.25rem]">
              Stop Guessing. Start Converting.
            </h1>
            <p className="mt-0 mb-0 text-balance text-lg text-muted-foreground">
              sellma.ai — the platform that de-risks advertising for small and medium businesses (SMBs) through explainable simulations.
            </p>
            <div className="flex items-center gap-2">
              <Button asChild>
                <Link href="/product">Get started</Link>
              </Button>
              <Button asChild variant="outline">
                <Link className="no-underline" href="#">
                  Learn more
                </Link>
              </Button>
            </div>
          </div>

          <section className="flex flex-col items-center justify-center gap-8 rounded-xl bg-secondary py-8 pb-18">
            <p className="mb-0 text-balance font-medium text-muted-foreground">
              Trusted by experts from leading companies
            </p>
            <div className="flex size-full items-center justify-center">
              <Marquee>
                <MarqueeFade className="from-secondary" side="left" />
                <MarqueeFade className="from-secondary" side="right" />
                <MarqueeContent pauseOnHover={false}>
                  {logos.map((logo) => (
                    <MarqueeItem className="mx-16 size-12" key={logo.name}>
                      <Link href={logo.url}>
                        <logo.icon className="size-full" />
                      </Link>
                    </MarqueeItem>
                  ))}
                </MarqueeContent>
              </Marquee>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};