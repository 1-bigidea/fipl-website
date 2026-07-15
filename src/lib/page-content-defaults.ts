import type { HomeHeroContent } from '@/lib/database.types'

export const defaultHomeHero: HomeHeroContent = {
  slides: [
    {
      type: 'image',
      src: '/images/hero/FIPL6318.jpg',
      poster: '',
      line1: 'Our People',
      line2: 'Power the Nation',
    },
    {
      type: 'image',
      src: '/images/hero/FIPL6305.jpg',
      poster: '',
      line1: 'Engineering',
      line2: "Nigeria's Energy Future",
    },
    {
      type: 'video',
      src: '/videos/hero.mp4',
      poster: '/images/home/backgroundimage.png',
      line1: 'Committed to',
      line2: 'Efficient and Sustainable Power Generation',
    },
  ],
  overlay: {
    title: 'Our Power Plants,\nOur Impact',
    body: "FIPL operates four world-class thermal power plants – Omoku, Afam, Trans-Amadi, and Eleme – generating electricity that supports Nigeria's industrial and economic growth.",
    imageLeft: '/images/home/leftheroimage.png',
    imageRight: '/images/home/rightsideimage.png',
  },
}
