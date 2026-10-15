"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Compass,
  MapPin,
  Camera,
  FileText,
  Images,
  Star,
  Menu as MenuIcon,
  Sliders,
  Globe,
  ExternalLink,
  LogOut,
  X,
  Sparkles,
  ChevronRight,
  Shield,
  CalendarCheck,
} from "lucide-react";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase/client";
import { signOut, onAuthStateChanged } from "firebase/auth";

interface NavGroup {
  group: string;
  items: Array<{
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
  }>;
}

const NAV_GROUPS: NavGroup[] = [
  {
    group: "Overview",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    ],
  },
  {
    group: "Tours & Places",
    items: [
      { label: "Tour Packages", href: "/admin/packages", icon: Compass },
      { label: "Destinations", href: "/admin/destinations", icon: MapPin },
    ],
  },
  {
    group: "Media & Pages",
    items: [
      { label: "Media Library", href: "/admin/photos", icon: Camera },
      { label: "Website Pages & Sections", href: "/admin/pages", icon: FileText },
      { label: "Galleries", href: "/admin/galleries", icon: Images },
    ],
  },
  {
    group: "Guest Relations",
    items: [
      { label: "Bookings & Customer Enquiries", href: "/admin/enquiries", icon: CalendarCheck },
      { label: "Reviews & Testimonials", href: "/admin/reviews", icon: Star },
    ],
  },
  {
    group: "Configuration",
    items: [
      { label: "Navigation Menus", href: "/admin/navigation", icon: MenuIcon },
      { label: "Site Settings", href: "/admin/settings", icon: Sliders },
      { label: "Global SEO", href: "/admin/seo", icon: Globe },
      { label: "Admin Account & Security", href: "/admin/security", icon: Shield },
    ],
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If on login page, render without admin navigation frame
  const isAuthPage = ["/admin/login", "/admin/forgot-password", "/admin/reset-password"].includes(pathname);
  const [checkingAuth, setCheckingAuth] = useState(() => !isAuthPage && isFirebaseConfigured());

  useEffect(() => {
    if (isAuthPage) return;

    const auth = getFirebaseAuth();
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/admin/login");
      }
      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, [isAuthPage, router]);

  if (isAuthPage) {
    return <>{children}</>;
  }

  const handleSignOut = async () => {
    try {
      const auth = getFirebaseAuth();
      if (auth) {
        await signOut(auth);
      }
      router.push("/admin/login");
      router.refresh();
    } catch (err) {
      console.error("Sign out error:", err);
      router.push("/admin/login");
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#F4EFE6] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-[#0C5A70] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-[#5B6770] font-semibold">Verifying Administrator Session...</p>
        </div>
      </div>
    );
  }

  const renderNavLinks = () => (
    <div className="space-y-6">
      {NAV_GROUPS.map((group) => (
        <div key={group.group}>
          <span className="block px-3 text-[10px] font-extrabold uppercase tracking-wider text-[#5B6770] mb-1.5">
            {group.group}
          </span>
          <nav className="space-y-1">
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-[#0C5A70] text-white shadow-xs"
                      : "text-[#5B6770] hover:text-[#17202A] hover:bg-[#F4EFE6]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? "text-[#E06D53]" : "text-[#5B6770]"}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
                </Link>
              );
            })}
          </nav>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F7F5EF] flex font-sans text-[#17202A]">
      {/* Desktop Fixed Left Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-[#E8E2D2] fixed inset-y-0 left-0 z-40">
        {/* Brand Header */}
        <div className="p-5 border-b border-[#E8E2D2] flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 rounded-xl overflow-hidden border border-[#E8E2D2] bg-[#FBF9F4] shrink-0">
              <Image
                src="/images/logo.png"
                alt="Manju Tours Logo"
                width={32}
                height={32}
                className="object-contain p-0.5"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xs text-[#0C5A70] tracking-wider uppercase leading-none">
                MANJU TOURS
              </span>
              <span className="text-[10px] text-[#5B6770] font-semibold mt-0.5">
                Admin CMS
              </span>
            </div>
          </Link>

          <span className="flex items-center gap-1 text-[9px] font-bold text-[#0C5A70] bg-[#0C5A70]/10 px-2 py-0.5 rounded-full">
            <Sparkles className="w-2.5 h-2.5 text-[#E06D53]" />
            <span>v2.0</span>
          </span>
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {renderNavLinks()}
        </div>

        {/* Sidebar Footer Controls */}
        <div className="p-4 border-t border-[#E8E2D2] bg-[#FBF9F4] space-y-2 shrink-0">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-bold text-[#0C5A70] hover:bg-[#0C5A70]/10 transition-colors"
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Live Website</span>
            </div>
            <span className="text-[10px] text-[#5B6770] bg-white px-2 py-0.5 rounded-full border border-[#E8E2D2]">
              Visit
            </span>
          </Link>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Navigation Bar */}
      <div className="md:hidden fixed top-0 inset-x-0 h-16 bg-white border-b border-[#E8E2D2] z-40 flex items-center justify-between px-4">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-[#E8E2D2] bg-[#FBF9F4]">
            <Image
              src="/images/logo.png"
              alt="Manju Tours Logo"
              width={28}
              height={28}
              className="object-contain p-0.5"
            />
          </div>
          <span className="font-extrabold text-xs text-[#0C5A70] tracking-wider uppercase">
            MANJU TOURS ADMIN
          </span>
        </Link>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl border border-[#E8E2D2] text-[#5B6770] hover:bg-[#F4EFE6]"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Slide-Over Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col z-10">
            <div className="p-4 border-b border-[#E8E2D2] flex items-center justify-between">
              <span className="font-extrabold text-xs text-[#0C5A70] uppercase">
                Admin Navigation
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg text-gray-500 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">{renderNavLinks()}</div>

            <div className="p-4 border-t border-[#E8E2D2] bg-[#FBF9F4] space-y-2">
              <Link
                href="/"
                target="_blank"
                className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs font-bold text-[#0C5A70]"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View Live Site</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs font-bold text-red-600"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-64 min-w-0">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-20 md:pt-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
