import Header from '../components/Header.jsx';
import Hero from '../components/Hero.jsx';
import Catalog from '../components/Catalog.jsx';
import Features from '../components/Features.jsx';
import CtaBanner from '../components/CtaBanner.jsx';
import Footer from '../components/Footer.jsx';

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Catalog />
        <Features />
        <CtaBanner />
      </main>
      <Footer />
    </>
  );
}
