import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { getPublishedPageSections, getSection } from "@/lib/queries/page-sections";
import { getPageByKey } from "@/lib/queries/pages";

const credits = [
  ["Sigiriya Lion Rock", "Shashi Shekhar", "CC BY-SA 3.0", "https://commons.wikimedia.org/wiki/File:The_Lion_Rock,_Sigiriya,_Sri_Lanka.jpg"],
  ["Pidurangala sunrise view of Sigiriya", "Wikimedia Commons contributor", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Sigiriya_view_from_Pidurangala.jpg"],
  ["Nine Arch Bridge, Ella", "Fuardhazra", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Nine_arch_bridge_in_srilanka.jpg"],
  ["Tea estate near Nuwara Eliya", "Keshani Kaveesha", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Tea_Estate_Nuwara_Eliya.jpg"],
  ["Leopard in Yala National Park", "Manelka Jayasundara", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Leopard_in_the_Yala_National_Park.jpg"],
  ["Galle Fort Lighthouse", "Rovin Shanila", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Galle_Fort_Lighthouse.jpg"],
  ["Temple of the Tooth, Kandy", "Koshy Koshy", "CC BY 2.0", "https://commons.wikimedia.org/wiki/File:Temple_of_the_Tooth,_Kandy.jpg"],
  ["Hikkaduwa beach", "Dinusha Chathuranga", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Hikkaduwa_beach_beauty.jpg"],
  ["Blue whale off Mirissa", "Arian Zwegers", "CC BY 2.0", "https://commons.wikimedia.org/wiki/File:Mirissa,_whale_watching,_blue_whale_(6917912897).jpg"],
  ["Mirissa surf beach", "Wikimedia Commons contributor", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Mirissa_Sri_lanka.jpg"],
  ["Peradeniya Botanical Gardens", "Vyacheslav Argenberg", "CC BY 4.0", "https://commons.wikimedia.org/wiki/File:Sri_Lanka,_Peradeniya_Botanical_Gardens.jpg"],
  ["Trincomalee coast", "Vishnu", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Trincomalee_Sea.jpg"],
  ["Minneriya elephant gathering", "Al Jazeera English", "CC BY-SA 2.0", "https://commons.wikimedia.org/wiki/File:Elephants_gather_for_water_in_the_plains_at_Minneriya_National_Park_in_Sri_Lanka._It_is_one_of_the_largest_gathering_of_-_Flickr_-_Al_Jazeera_English.jpg"],
  ["Polonnaruwa ruins", "shankar s.", "CC BY 2.0", "https://commons.wikimedia.org/wiki/File:Polonnaruwa_ruins_(7567976502).jpg"],
  ["Bentota beach", "Wikimedia Commons contributor", "CC BY-SA 3.0", "https://commons.wikimedia.org/wiki/File:Sri_Lanka,_Bentota,_beach_(1).JPG"],
];

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageByKey("credits");
  return {
    title: page?.seo_title || "Photo Credits & Licenses | Manju Tours Lanka",
    description: page?.seo_description || "Attributions and licenses for photographs used on Manju Tours Lanka.",
  };
}

export default async function CreditsPage() {
  const sections = await getPublishedPageSections("credits");
  const hero = getSection(sections, "hero");

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Link href="/" className="text-sm text-[#0C5A70] hover:underline">
        &larr; Back to Home
      </Link>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-[#17202A] mt-4">
        {hero?.title || "Photo Credits & Attributions"}
      </h1>
      <p className="text-[#5B6770] mt-3 mb-10 leading-relaxed">
        {hero?.subtitle || hero?.content || "Photographs below are shared under the licenses shown. Images may be resized, cropped, or converted for this website."}
      </p>
      <ul className="space-y-4">
        {credits.map(([title, author, license, url]) => (
          <li key={url} className="border-b border-[#E8E2D2] pb-4 text-sm text-[#17202A]">
            <strong>{title}</strong> — {author} —{" "}
            <a className="underline text-[#0C5A70]" href={url} target="_blank" rel="noreferrer">
              {license}
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
