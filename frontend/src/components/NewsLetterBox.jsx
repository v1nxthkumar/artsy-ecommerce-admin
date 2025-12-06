import React from 'react';
import Title from './Title';


const NewsLetterBox = () => {
  const onSubmitHandler = (event) => {
    event.preventDefault();
    const email = event.target.email.value;
    alert(`Thank you for joining our list. Exclusive offers will be sent to ${email}`);
    event.target.reset();
  };

  return (
    <div className="max-w-md mx-auto px-6">
      <Title
        lead="Handpicked Drops"
        headline="Trend Alerts"
        subline="Curated. Timely. Yours."
      />
      <form onSubmit={onSubmitHandler} className="mb-2">
        <div className="border-b border-black pb-1 mb-8">
          <input
            type="email"
            name="email"
            placeholder="Enter your email address"
            className="w-full px-2 py-3 focus:outline-none bg-transparent placeholder-black placeholder-opacity-60 text-sm tracking-wider"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-4 border border-black hover:bg-black hover:text-white transition-all duration-300 text-sm tracking-widest uppercase"
        >
          Subscribe
        </button>
      </form>

      <div className="text-center text-xs text-gray-500">
        <p>We respect your privacy. Unsubscribe at any time.</p>
      </div>
    </div>
  );
};

export default NewsLetterBox;
