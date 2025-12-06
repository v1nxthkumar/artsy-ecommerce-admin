import React, { useEffect, useRef } from 'react';
import { FiMapPin, FiPhone, FiMail, FiSend, FiChevronDown } from 'react-icons/fi';

const Contact = () => {
  const formRef = useRef(null);

  // Add floating label effect
  useEffect(() => {
    const inputs = formRef.current.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      input.addEventListener('focus', () => {
        input.previousElementSibling.classList.add('text-gray-900', 'scale-90', '-translate-y-6');
      });
      input.addEventListener('blur', () => {
        if (!input.value) {
          input.previousElementSibling.classList.remove('text-gray-900', 'scale-90', '-translate-y-6');
        }
      });
    });
  }, []);

  return (
    <div className="px-4 sm:px-6 lg:px-8 from-gray-50 min-h-screen">
      {/* Main White Luxury Card */}
      <div 
        className="w-full overflow-hidden"
      >
        <div className="grid lg:grid-cols-2">
          {/* Left Side - Visual */}
          <div className="relative p-12 flex flex-col justify-between">
            {/* Luxury Branding */}
            <div>
              <div className="flex items-center mb-8">
                <div className="w-3 h-8 bg-black mr-3"></div>
                <h1 className="text-2xl font-light tracking-widest">HAUTE COUTURE</h1>
              </div>
              <h2 className="text-4xl font-light leading-tight mb-4">
                Personal Styling <br />Consultation
              </h2>
              <p className="text-gray-500 font-light max-w-md">
                Our stylists are available for private appointments at our flagship boutiques worldwide or via virtual consultation.
              </p>
            </div>

            {/* Contact Blocks */}
            <div className="space-y-6 mt-16">
              <div className="flex items-start">
                <div className="bg-white p-3 rounded-lg shadow-sm mr-4">
                  <FiMapPin className="text-gray-700" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Flagship Boutiques</h3>
                  <p className="text-gray-500 text-sm font-light">
                    Paris • Milan • New York • Tokyo • Dubai
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-white p-3 rounded-lg shadow-sm mr-4">
                  <FiPhone className="text-gray-700" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Concierge</h3>
                  <p className="text-gray-500 text-sm font-light">
                    +1 (555) 123-4567 <br />
                    Available 9AM-9PM EST
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-white p-3 rounded-lg shadow-sm mr-4">
                  <FiMail className="text-gray-700" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Email</h3>
                  <p className="text-gray-500 text-sm font-light">
                    concierge@couture.com <br />
                    Response within 12 hours
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="p-12" ref={formRef}>
            <h3 className="text-2xl font-light text-gray-900 mb-8">Request Appointment</h3>
            
            <form className="space-y-6">
              <div className="relative">
                <label className="absolute left-0 top-3 text-gray-500 font-light transition-all duration-300 pointer-events-none">
                  Full Name
                </label>
                <input 
                  type="text" 
                  className="w-full border-b border-gray-200 py-3 focus:border-gray-900 outline-none bg-transparent"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="relative">
                  <label className="absolute left-0 top-3 text-gray-500 font-light transition-all duration-300 pointer-events-none">
                    Email Address
                  </label>
                  <input 
                    type="email" 
                    className="w-full border-b border-gray-200 py-3 focus:border-gray-900 outline-none bg-transparent"
                  />
                </div>

                <div className="relative">
                  <label className="absolute left-0 top-3 text-gray-500 font-light transition-all duration-300 pointer-events-none">
                    Phone Number
                  </label>
                  <input 
                    type="tel" 
                    className="w-full border-b border-gray-200 py-3 focus:border-gray-900 outline-none bg-transparent"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="absolute left-0 top-3 text-gray-500 font-light transition-all duration-300 pointer-events-none">
                  Location Preference
                </label>
                <div className="relative">
                  <select className="w-full border-b border-gray-200 py-3 pr-8 focus:border-gray-900 outline-none bg-transparent appearance-none">
                    <option></option>
                    <option>In-Person (Paris)</option>
                    <option>In-Person (New York)</option>
                    <option>Virtual Consultation</option>
                  </select>
                  <FiChevronDown className="absolute right-0 top-3 text-gray-400" />
                </div>
              </div>

              <div className="relative">
                <label className="absolute left-0 top-3 text-gray-500 font-light transition-all duration-300 pointer-events-none">
                  Service Needed
                </label>
                <div className="relative">
                  <select className="w-full border-b border-gray-200 py-3 pr-8 focus:border-gray-900 outline-none bg-transparent appearance-none">
                    <option></option>
                    <option>Bridal Couture</option>
                    <option>Red Carpet Styling</option>
                    <option>Wardrobe Refresh</option>
                    <option>Special Event</option>
                    <option>Personal Shopping</option>
                  </select>
                  <FiChevronDown className="absolute right-0 top-3 text-gray-400" />
                </div>
              </div>

              <div className="relative">
                <label className="absolute left-0 top-3 text-gray-500 font-light transition-all duration-300 pointer-events-none">
                  Additional Notes
                </label>
                <textarea 
                  rows="3" 
                  className="w-full border-b border-gray-200 py-3 focus:border-gray-900 outline-none bg-transparent resize-none"
                ></textarea>
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-gray-900 text-white font-medium tracking-wider hover:bg-gray-800 transition-colors duration-300 flex items-center justify-center space-x-2"
              >
                <span>SUBMIT REQUEST</span>
                <FiSend className="text-sm" />
              </button>

              <p className="text-gray-400 text-xs font-light text-center mt-4">
                A dedicated stylist will contact you within 24 hours to confirm your appointment details.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
