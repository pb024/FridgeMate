import Navbar from './components/Navbar'
import { Route, Routes } from 'react-router'
import Homepage from './pages/Homepage'
import InventoryPage from './pages/InventoryPage'
import MealsPage from './pages/MealsPage'
import useAuthReq from "./hooks/useAuthReq";
import useUserSync from "./hooks/useUserSync";

function App() {
  const { isClerkLoaded, isSignedIn } = useAuthReq();
  useUserSync();

  if (!isClerkLoaded) return null;

  return (
    <div className="min-h-screen bg-base-100">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/inventory/:id" element={<InventoryPage />} />
          <Route path="/meals" element={<MealsPage />} />
        </Routes>
      </main>
    </div>
  )
};

export default App
