import React from 'react';
import clsx from 'clsx';

const Title = ({ lead, headline, subline }) => {
  return (
    <div className="max-w-screen-xl mx-auto text-center px-4 py-8 text-[#111]">
      {/* Headline */}
      <div className="relative inline-block px-2 group">
        <h2
          className={clsx(
            'kaushan-script-regular font-normal leading-none m-0 text-black relative z-10 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]',
            'text-[2rem] sm:text-[3rem] md:text-[3rem] lg:text-[3rem]',
            "after:content-[''] after:absolute after:bottom-[5px] after:left-0 after:w-full after:h-[2px] after:bg-black after:transform after:scale-x-0 after:origin-right"
          )}
          data-text={headline}
        >
          {headline}
        </h2>
      </div>

      {/* Subline */}
      {subline && (
        <div className="flex items-center justify-center gap-6">
          <div className="h-px w-[60px] bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
          <p className={clsx(
            'kaushan-script-regular tracking-[0.2em] font-medium whitespace-nowrap text-[#555]',
            'text-[0.7rem] sm:text-[0.75rem] md:text-[0.85rem] lg:text-[0.9rem]'
          )}>
            {subline}
          </p>
          <div className="h-px w-[60px] bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
        </div>
      )}
    </div>
  );
};

export default Title;
