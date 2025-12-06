import React, { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar.jsx'
import Add from './pages/Add.jsx'
import List from './pages/List.jsx'
import Orders from './pages/Orders.jsx'
import Login from './components/Login.jsx'
import { ToastContainer } from 'react-toastify';
import Dashboard from './pages/Dashboard.jsx'
import Analytics from './pages/Analytics.jsx'
import UserManagement from './pages/UserManagement.jsx'

export const backendUrl = import.meta.env.VITE_BACKEND_URL

export const currency = '₹'

const App = () => {

  const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : '');

  useEffect(()=>{
    localStorage.setItem('token', token)
  },[token])

  return (
    <div className='bg-gray-50 min-h-screen'>
      <ToastContainer />
      {
        token === "" ? <Login setToken={ setToken } /> :
          <>
            <hr className='border-gray-200' />
            <div className='flex w-full'>
              <Sidebar setToken={setToken} />
              <div className='w-[100%] my-8 text-gray-600 text-base'>

                <Routes>
                  <Route path='/' element={<Dashboard token={ token } />} />
                  <Route path='/add' element={<Add token={ token } />} />
                  <Route path='/list' element={<List token={ token } />} />
                  <Route path='/orders' element={<Orders token={ token } />} />
                  <Route path='/analytics' element={<Analytics token={ token } />} />
                  <Route path='/customers' element={<UserManagement token={ token } />} />
                </Routes>

              </div>
            </div>
          </>
      }

    </div>
  )
}

export default App