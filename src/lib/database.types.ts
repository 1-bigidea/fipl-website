export type NewsArticleRow = {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  date: string
  date_iso: string
  category: string
  read_time: string
  image_url: string
  created_at: string
}

export type JobRow = {
  id: string
  title: string
  department: string
  location: string
  type: string
  description: string | null
  requirements: string | null
  posted_date: string
  is_active: boolean
  created_at: string
}

export type MediaKitRow = {
  id: string
  title: string
  category: string
  file_url: string
  thumbnail_url: string | null
  created_at: string
}

export type ContactSubmissionRow = {
  id: string
  first_name: string
  last_name: string
  email: string
  subject: string | null
  message: string
  created_at: string
}

export type NewsletterSubscriberRow = {
  id: string
  email: string
  subscribed_at: string
}

export type JobApplicationRow = {
  id: string
  job_id: string | null
  job_title: string
  first_name: string
  last_name: string
  email: string
  phone: string
  cover_letter: string | null
  cv_url: string
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected'
  created_at: string
}

export type TestimonialRow = {
  id: string
  quote: string
  name: string
  role: string
  is_active: boolean
  created_at: string
}

export type HeroSlideContent = {
  type: 'image' | 'video'
  src: string
  poster: string
  line1: string
  line2: string
}

export type HomeHeroContent = {
  slides: HeroSlideContent[]
  overlay: {
    title: string
    body: string
    imageLeft: string
    imageRight: string
  }
}

export type PageContentRow = {
  page: string
  content: { hero: HomeHeroContent }
  updated_at: string
}
