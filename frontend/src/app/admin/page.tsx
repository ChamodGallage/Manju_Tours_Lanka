"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Camera,
  MapPin,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Compass,
  Star,
  Plus,
  Inbox,
  FileText,
  Sliders,
  Images,
  Menu as MenuIcon,
  Globe,
} from "lucide-react";
import type { SiteImage, TourPackage, TourEnquiryRow, DestinationItem } from "@/types/database.types";

export default function AdminDashboardPage() {
  const [photos, setPhotos] = useState<SiteImage[]>([]);
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [enquiries, setEnquiries] = useState<TourEnquiryRow[]>([]);
  const [destinations, setDestinations] = useState<DestinationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [photoRes, pkgRes, enqRes, destRes] = await Promise.all([
        fetch("/api/admin/photos"),
        fetch("/api/admin/packages"),
        fetch("/api/admin/enquiries"),
        fetch("/api/admin/destinations"),
      ]);
      const photoData = await photoRes.json();
      const pkgData = await pkgRes.json();
      const enqData = await enqRes.json();
      const destData = await destRes.json();

      if (photoData.photos) setPhotos(photoData.photos);
      if (pkgData.packages) setPackages(pkgData.packages);
      if (enqData.enquiries) setEnquiries(enqData.enquiries);
      if (destData.destinations) setDestinations(destData.destinations);
    } catch (err) {
      console.error("Failed fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      fetch("/api/admin/photos"),
      fetch("/api/admin/packages"),
      fetch("/api/admin/enquiries"),
      fetch("/api/admin/destinations"),
    ])
      .then(async ([photoRes, pkgRes, enqRes, destRes]) => {
        const photoData = await photoRes.json();
        const pkgData = await pkgRes.json();
        const enqData = await enqRes.json();
        const destData = await destRes.json();
        if (isMounted) {
          if (photoData.photos) setPhotos(photoData.photos);
          if (pkgData.packages) setPackages(pkgData.packages);
          if (enqData.enquiries) setEnquiries(enqData.enquiries);
          if (destData.destinations) setDestinations(destData.destinations);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed fetching dashboard data:", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const totalPhotos = photos.length;
  const totalPackages = packages.length;
  const publishedPackages = packages.filter((p) => p.is_published).length;
  const totalEnquiries = enquiries.length;
  const newEnquiries = enquiries.filter((e) => e.status === "NEW").length;
  const totalDestinations = destinations.length;

  const quickLinks = [
    { label: "Tour Packages", href: "/admin/packages", count: `${totalPackages} Packages`, icon: Compass, color: "text-[#0C5A70] bg-[#0C5A70]/10" },
    { label: "Destinations", href: "/admin/destinations", count: `${totalDestinations} Places`, icon: MapPin, color: "text-emerald-400 bg-emerald-500/10" },
    { label: "Bookings & Enquiries", href: "/admin/enquiries", count: `${newEnquiries} New Inquiries`, icon: Inbox, color: "text-amber-400 bg-amber-500/10" },
    { label: "Media Library", href: "/admin/photos", count: `${totalPhotos} Photos`, icon: Camera, color: "text-[#E06D53] bg-[#E06D53]/10" },
    { label: "Website Pages & Sections", href: "/admin/pages", count: "4 Pages", icon: FileText, color: "text-purple-400 bg-purple-500/10" },
    { label: "Guest Reviews", href: "/admin/reviews", count: "Testimonials", icon: Star, color: "text-yellow-400 bg-yellow-500/10" },
    { label: "Galleries", href: "/admin/galleries", count: "Photo Stories", icon: Images, color: "text-cyan-400 bg-cyan-500/10" },
    { label: "Navigation Menus", href: "/admin/navigation", count: "Header & Footer", icon: MenuIcon, color: "text-blue-400 bg-blue-500/10" },
    { label: "Site Settings", href: "/admin/settings", count: "Business Contact", icon: Sliders, color: "text-rose-400 bg-rose-500/10" },
    { label: "Global SEO", href: "/admin/seo", count: "Metadata & Social", icon: Globe, color: "text-teal-400 bg-teal-500/10" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#0C5A70] via-[#083B4A] to-[#141C24] rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-[#232F3E]">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-bold text-white mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#E06D53]" />
            <span>Manju Tours Lanka • Complete Management Admin Panel</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-serif">
            Central Management Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[#FBF9F4]/80 mt-1 max-w-xl">
            Manage tour data, destinations, customer enquiries, photography, reviews, and supported page content from one place.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={fetchDashboardData}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Refresh All Dashboard Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Link
            href="/admin/enquiries"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#E06D53] hover:bg-[#C8573D] text-white text-xs font-bold shadow-md transition-all active:scale-[0.98]"
          >
            <Inbox className="w-4 h-4" />
            <span>View Inquiries ({newEnquiries} New)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Top Level Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          href="/admin/packages"
          className="bg-[#141C24] p-5 rounded-2xl border border-[#232F3E] hover:border-[#0C5A70] transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#8E9CA6]">Tour Packages</span>
            <Compass className="w-4 h-4 text-[#4EB5D1] group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-white">{loading ? "..." : totalPackages}</div>
          <div className="text-[11px] text-[#2B5829] mt-1 font-semibold">
            {publishedPackages} Published Live
          </div>
        </Link>

        <Link
          href="/admin/enquiries"
          className="bg-[#141C24] p-5 rounded-2xl border border-[#232F3E] hover:border-amber-500/50 transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#8E9CA6]">Customer Leads</span>
            <Inbox className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-amber-400">{loading ? "..." : totalEnquiries}</div>
          <div className="text-[11px] text-amber-300 mt-1 font-semibold">
            {newEnquiries} Require Contact
          </div>
        </Link>

        <Link
          href="/admin/destinations"
          className="bg-[#141C24] p-5 rounded-2xl border border-[#232F3E] hover:border-emerald-500/50 transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#8E9CA6]">Destinations</span>
            <MapPin className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-white">{loading ? "..." : totalDestinations}</div>
          <div className="text-[11px] text-[#8E9CA6] mt-1">Hikkaduwa, Ella, Sigiriya...</div>
        </Link>

        <Link
          href="/admin/photos"
          className="bg-[#141C24] p-5 rounded-2xl border border-[#232F3E] hover:border-[#E06D53]/50 transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#8E9CA6]">Photos Managed</span>
            <Camera className="w-4 h-4 text-[#E06D53] group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-white">{loading ? "..." : totalPhotos}</div>
          <div className="text-[11px] text-[#8E9CA6] mt-1">Supabase Storage & Site Hub</div>
        </Link>
      </div>

      {/* Complete CMS Management Hub Grid */}
      <div className="bg-[#141C24] rounded-3xl p-6 sm:p-8 border border-[#232F3E]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white font-serif">
              Management Modules
            </h2>
            <p className="text-xs text-[#8E9CA6]">
              Instant access to all editable sections of the website
            </p>
          </div>
          <span className="text-xs text-[#4EB5D1] font-semibold">10 Active Modules</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {quickLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="bg-[#0C1015] p-4 rounded-xl border border-[#232F3E] hover:border-[#4EB5D1]/50 hover:bg-[#1A232E]/40 transition-all flex flex-col justify-between group"
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${item.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-[#4EB5D1] transition-colors">
                    {item.label}
                  </h4>
                  <span className="text-[10px] text-[#8E9CA6] block mt-0.5">{item.count}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Live Tour Packages Quick Preview */}
      <div className="bg-[#141C24] rounded-3xl p-6 sm:p-8 border border-[#232F3E]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white font-serif">
              Featured Tour Packages
            </h2>
            <p className="text-xs text-[#8E9CA6]">
              Tour packages currently live on your website and available for enquiry
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/packages"
              className="text-xs font-semibold text-[#4EB5D1] hover:underline flex items-center gap-1"
            >
              <span>Manage All ({packages.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/admin/packages"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0C5A70] hover:bg-[#0E6C86] text-white text-xs font-semibold transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>Add Package</span>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-44 rounded-2xl bg-[#0C1015] animate-pulse border border-[#232F3E]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.slice(0, 3).map((pkg) => (
              <div
                key={pkg.id}
                className="group relative rounded-xl overflow-hidden border border-[#232F3E] bg-[#0C1015] flex flex-col justify-between hover:border-[#2F3E50] transition-all"
              >
                <div className="relative aspect-16/9 bg-[#0C1015]">
                  <Image
                    src={pkg.hero_image || "/images/destinations/sigiriya/hero.webp"}
                    alt={pkg.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    unoptimized={typeof pkg.hero_image === "string" && pkg.hero_image.startsWith("http")}
                  />
                  <div className="absolute top-2 left-2 z-10 flex items-center gap-1">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        pkg.is_published ? "bg-emerald-600 text-white" : "bg-gray-700 text-white"
                      }`}
                    >
                      {pkg.is_published ? "Published" : "Draft"}
                    </span>
                    {pkg.is_featured && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#E06D53] text-white flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 fill-white" />
                        <span>Featured</span>
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-2 right-2 z-10 text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/75 text-white backdrop-blur-sm">
                    {pkg.duration_days} Days / {pkg.duration_nights} Nights
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#4EB5D1] uppercase">
                      {pkg.travel_style}
                    </span>
                    <h4 className="text-sm font-bold text-white line-clamp-1 mt-0.5">
                      {pkg.title}
                    </h4>
                    <p className="text-xs text-[#8E9CA6] line-clamp-2 mt-1 leading-relaxed">
                      {pkg.tagline || pkg.overview}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#232F3E] text-xs font-bold text-white">
                    <span>{pkg.starting_price || "Request a Quote"}</span>
                    <Link
                      href={`/tours/${pkg.slug}`}
                      target="_blank"
                      className="text-[11px] text-[#4EB5D1] hover:underline flex items-center gap-1"
                    >
                      <span>View Live</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
