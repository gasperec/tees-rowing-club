import Header from '@/sections/Header'
import Hero from '@/sections/Hero'
import Pathways from '@/sections/Pathways'
import Club from '@/sections/Club'
import Squads from '@/sections/Squads'
import LearnToRow from '@/sections/LearnToRow'
import Membership from '@/sections/Membership'
import MemberProfilesCta from '@/sections/MemberProfilesCta'
import Events from '@/sections/Events'
import Contact from '@/sections/Contact'
import Footer from '@/sections/Footer'

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Pathways />
        <Club />
        <Squads />
        <LearnToRow />
        <Membership />
        <MemberProfilesCta />
        <Events />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}
