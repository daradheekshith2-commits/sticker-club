import { CartProvider } from './context/CartContext';
import { Layout } from './components/layout/Layout';
import { RouterProvider, Routes, type RouteDef } from './router/router';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductPage } from './pages/ProductPage';
import { VibesPage } from './pages/VibesPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { BuildWallPage } from './pages/BuildWallPage';
import { CreateStickersPage } from './pages/CreateStickersPage';
import { BuildPackPage } from './pages/BuildPackPage';
import { CollectiblesPage } from './pages/CollectiblesPage';
import { DuosPage, SecretMessagesPage } from './pages/CollectionLandingPages';
import { PassportPage } from './pages/PassportPage';
import { RarityPage } from './pages/RarityPage';
import { VotePage } from './pages/VotePage';
import { AboutPage, ContactPage, FaqPage, NotFoundPage, PolicyPage } from './pages/InfoPages';

// Every page of the site. The first matching path wins; '*' catches the rest.
const routes: RouteDef[] = [
  { path: '/', element: <HomePage /> },
  { path: '/shop', element: <ShopPage /> },
  { path: '/vibes', element: <VibesPage /> },
  { path: '/product/:slug', element: <ProductPage /> },
  { path: '/create-your-stickers', element: <CreateStickersPage /> },
  { path: '/build-your-wall', element: <BuildWallPage /> },
  { path: '/collectibles', element: <CollectiblesPage /> },
  { path: '/build-your-pack', element: <BuildPackPage /> },
  { path: '/matching-duos', element: <DuosPage /> },
  { path: '/secret-messages', element: <SecretMessagesPage /> },
  { path: '/rare-collections', element: <RarityPage /> },
  { path: '/collector-passport', element: <PassportPage /> },
  { path: '/vote-next-drop', element: <VotePage /> },
  { path: '/checkout', element: <CheckoutPage /> },
  { path: '/about', element: <AboutPage /> },
  { path: '/faq', element: <FaqPage /> },
  { path: '/contact', element: <ContactPage /> },
  { path: '/policies/:slug', element: <PolicyPage /> },
  { path: '*', element: <NotFoundPage /> },
];

export default function App() {
  return (
    <RouterProvider>
      <CartProvider>
        <Layout>
          <Routes routes={routes} />
        </Layout>
      </CartProvider>
    </RouterProvider>
  );
}
