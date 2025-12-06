import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/home.jsx'
import Collection from './pages/Collection.jsx'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'
import Product from './pages/Product.jsx'
import Cart from './pages/Cart.jsx'
import Login from './pages/Login.jsx'
import PlaceOrder from './pages/PlaceOrder.jsx'
import Orders from './pages/Orders.jsx'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Verify from './pages/Verify.jsx'
import Wishlist from './pages/Wishlist.jsx'
import MyProfile from './pages/MyProfile.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import SuccessPage from './pages/SuccessPage.jsx'
import LatestCollection from './components/LatestCollection.jsx'
import BestSeller from './components/BestSeller.jsx'

const App = () => {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <ToastContainer />
      <Navbar />
      <ScrollToTop />
      
      <main className="flex-1 w-full overflow-hidden">
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/collection' element={<Collection />} />
          <Route path='/about' element={<About />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/product/:productId' element={<Product />} />
          <Route path='/cart' element={<Cart />} />
          <Route path='/login' element={<Login />} />
          <Route path='/place-order' element={<PlaceOrder />} />
          <Route path='/orders' element={<Orders />} />
          <Route path='/verify' element={<Verify />} />
          <Route path='/wishlist' element={<Wishlist />} />
          <Route path='/profile/:userId?' element={<MyProfile />} />
          <Route path='/success' element={<SuccessPage />} />
          <Route path='/latestcollection' element={<LatestCollection/>}/>
          <Route path='/bestseller' element={<BestSeller/>}/>
        </Routes>
      </main>

      <Footer />
    </div>
  )
}

export default App
