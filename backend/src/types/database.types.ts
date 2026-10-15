export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface TourEnquiryRow {
  id: string;
  tour_id: string | null;
  tour_title: string | null;
  name: string;
  email: string;
  phone: string;
  country: string;
  travel_start_date: string | null;
  travel_end_date: string | null;
  flexible_month: string | null;
  number_of_adults: number;
  number_of_children: number;
  travel_style: string | null;
  message: string;
  status: string;
  source: string | null;
  admin_notes?: string | null;
  ip_hash: string | null;
  created_at: string;
  updated_at?: string;
}

export interface TourEnquiryInsert {
  id?: string;
  tour_id?: string | null;
  tour_title?: string | null;
  name: string;
  email: string;
  phone: string;
  country: string;
  travel_start_date?: string | null;
  travel_end_date?: string | null;
  flexible_month?: string | null;
  number_of_adults?: number;
  number_of_children?: number;
  travel_style?: string | null;
  message: string;
  status?: string;
  source?: string | null;
  admin_notes?: string | null;
  ip_hash?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface SiteImage {
  id: string;
  title: string;
  description: string;
  storage_path: string;
  image_url: string;
  page_key: string;
  section_key: string;
  category: string;
  destination: string;
  alt_text: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  original_filename?: string;
  mime_type?: string;
  width?: number | null;
  height?: number | null;
  size_bytes?: number | null;
  focal_point?: string;
  reference_count?: number;
  referenced_sections?: string[];
}

export type SiteImageInsert = Omit<SiteImage, "id" | "created_at" | "updated_at"> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type SiteImageUpdate = Partial<SiteImageInsert>;

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  accommodation?: string;
  meals?: string;
  activities?: string;
}

export interface PackageFaq {
  question: string;
  answer: string;
}

export interface PackageGalleryImage {
  src: string;
  alt?: string;
  caption?: string;
}

export interface TourPackage {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  overview: string;
  hero_image: string;
  hero_image_metadata?: {
    src?: string;
    alt?: string;
    caption?: string;
    focalPoint?: string;
    isStock?: boolean;
  } | null;
  gallery_images: PackageGalleryImage[];
  travel_style: string;
  destinations: string[];
  duration_days: number;
  duration_nights: number;
  starting_price: string;
  starting_price_numeric?: number;
  currency: string;
  price_type: "per_person" | "per_group" | "custom_quote";
  min_travelers: number;
  max_travelers: number;
  inclusions: string[];
  exclusions: string[];
  itinerary: ItineraryDay[];
  accommodation_details?: string;
  transport_details?: string;
  meals_included?: string;
  activities: string[];
  optional_activities?: string[];
  suitable_for: string[];
  booking_conditions?: string;
  cancellation_policy?: string;
  faqs: PackageFaq[];
  seo_title?: string;
  seo_description?: string;
  display_order: number;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
}

export type TourPackageInsert = Omit<TourPackage, "id" | "created_at" | "updated_at"> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type TourPackageUpdate = Partial<TourPackageInsert>;

export interface SiteSettings {
  id: string;
  company_name: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  opening_hours: string;
  currency: string;
  supported_currencies: string[];
  social_facebook: string;
  social_instagram: string;
  social_tripadvisor: string;
  social_youtube: string;
  whatsapp_welcome_message: string;
  logo_url: string;
  favicon_url: string;
  seo_title_default: string;
  seo_description_default: string;
  seo_keywords_default: string;
  seo_og_image: string;
  canonical_url: string;
  google_analytics_id?: string;
  updated_at: string;
}

export interface DestinationItem {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  region: string;
  summary: string;
  content: string;
  hero_image: string;
  hero_image_metadata?: {
    src?: string;
    alt?: string;
    caption?: string;
    focalPoint?: string;
  } | null;
  gallery_images: Array<{ src: string; alt?: string; caption?: string }>;
  highlights: string[];
  best_time_to_visit: string;
  ideal_duration: string;
  travel_tips?: string;
  latitude?: number;
  longitude?: number;
  display_order: number;
  is_featured: boolean;
  is_published: boolean;
  seo_title?: string;
  seo_description?: string;
  created_at: string;
  updated_at: string;
}

export interface ReviewItem {
  id: string;
  author_name: string;
  author_country: string;
  rating: number;
  review_date: string;
  travel_month?: string;
  title: string;
  comment: string;
  source: string;
  tour_title?: string;
  is_verified: boolean;
  is_featured: boolean;
  is_published?: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export type PageStatus = "published" | "draft";

export interface PageRecord {
  id: string;
  slug: string;
  page_key: string;
  title: string;
  navigation_label?: string;
  nav_location?: "header" | "footer_quick_links" | "footer_legal" | "none";
  is_published: boolean;
  status: PageStatus;
  seo_title?: string;
  seo_description?: string;
  seo_og_image?: string;
  seo_keywords?: string;
  is_template?: boolean;
  layout_type?: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export type SectionType =
  | "hero"
  | "text-image"
  | "gallery"
  | "destination-cards"
  | "tour-cards"
  | "itinerary"
  | "testimonials"
  | "faqs"
  | "contact-info"
  | "cta"
  | "video-animation"
  | "pillars"
  | "quick-links"
  | "why-us"
  | "custom";

export interface PageSectionItem {
  id: string;
  page_key: string;
  section_key: string;
  section_type?: SectionType;
  title: string;
  subtitle?: string;
  badge?: string;
  content?: string;
  button_text?: string;
  button_url?: string;
  secondary_button_text?: string;
  secondary_button_url?: string;
  image_url?: string;
  secondary_image_url?: string;
  image_alt?: string;
  background_style?: "default" | "sand" | "ocean" | "white" | "dark" | "image";
  background_color?: string;
  background_image?: string;
  text_align?: "left" | "center" | "right";
  layout_options?: Record<string, unknown>;
  items?: Array<Record<string, unknown>>;
  is_visible: boolean;
  status?: PageStatus;
  is_draft?: boolean;
  display_order: number;
  updated_at: string;
}

export interface NavigationItem {
  id: string;
  menu_location: "header" | "footer_quick_links" | "footer_legal";
  label: string;
  url: string;
  display_order: number;
  is_external: boolean;
  is_active: boolean;
  created_at: string;
}

export interface GalleryCollectionItem {
  id: string;
  title: string;
  slug: string;
  description?: string;
  category: string;
  cover_image: string;
  images: Array<{ src: string; alt?: string; caption?: string }>;
  display_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      admins: {
        Row: { id: string; email: string; role: string; created_at: string };
        Insert: { id: string; email: string; role?: string; created_at?: string };
        Update: Partial<{ email: string; role: string }>;
        Relationships: [];
      };
      tour_enquiries: {
        Row: TourEnquiryRow;
        Insert: TourEnquiryInsert;
        Update: Partial<TourEnquiryInsert>;
        Relationships: [];
      };
      site_images: {
        Row: SiteImage;
        Insert: SiteImageInsert;
        Update: SiteImageUpdate;
        Relationships: [];
      };
      tour_packages: {
        Row: TourPackage;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      site_settings: {
        Row: SiteSettings;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      destinations: {
        Row: DestinationItem;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      reviews: {
        Row: ReviewItem;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      pages: {
        Row: PageRecord;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      page_sections: {
        Row: PageSectionItem;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      navigation_items: {
        Row: NavigationItem;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      gallery_collections: {
        Row: GalleryCollectionItem;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
