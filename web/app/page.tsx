import { Hero } from '@/components/landing/hero'
import { HowItWorks } from '@/components/landing/how-it-works'
import { Disclaimer } from '@/components/landing/disclaimer'
import { Footer } from '@/components/landing/footer'

export default function Home() {
  return (
    <main>
      <Hero />
      <HowItWorks />
      <Disclaimer />
      <Footer />
    </main>
  )
}
