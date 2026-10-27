import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import ComprarCafe from '../../components/checkout/ComprarCafe.jsx';

export const metadata = { title: 'Comprar — Café La Sierra' };

export default function ComprarPage() {
  return (
    <>
      <Header />
      <main className="py-10 sm:py-14">
        <ComprarCafe />
      </main>
      <Footer />
    </>
  );
}
