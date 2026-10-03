import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import Booking from './pages/Booking'
import Admin from './pages/Admin'
import Profile from './pages/Profile'
import Members from './pages/Members'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/booking" element={<Booking />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/members" element={<Members />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
