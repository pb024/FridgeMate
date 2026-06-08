import Navbar from './components/Navbar'
import { Route, Routes } from 'react-router'
import Homepage from './pages/Homepage'
import InventoryPage from './pages/InventoryPage'
import MealsPage from './pages/MealsPage'

function App() {
  return (
    <div className="min-h-screen bg-base-100">
      <Navbar />
      <main className="max-x-5xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/inventory/:id" element={<InventoryPage />} />
          <Route path="/Meals" element={<MealsPage />} />
        </Routes>
      </main>
    </div>
  )
};

export default App
