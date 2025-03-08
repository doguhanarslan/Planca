import React from 'react';
import { Link } from 'react-router-dom';

interface BusinessTypeCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
}

/**
 * Modern BusinessTypeCard component with enhanced visual effects
 */
const BusinessTypeCard: React.FC<BusinessTypeCardProps> = ({ title, description, icon, link }) => {
  return (
    <div className="flex flex-col items-center rounded-xl shadow-md 
                    bg-white border border-gray-100 dark:bg-secondary-800 dark:border-gray-700
                    transition-all duration-300 ease-in-out transform
                    hover:shadow-xl hover:-translate-y-1 hover:border-primary-100 dark:hover:border-primary-900
                    p-6">
      <div className="bg-primary-50 dark:bg-primary-900/30 p-4 rounded-full mb-5 
                     transition-all duration-300 group-hover:scale-110 group-hover:bg-primary-100 
                     dark:group-hover:bg-primary-900/50">
        <div className="text-primary-600 dark:text-primary-400 h-12 w-12">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-semibold mb-3 text-secondary-900 dark:text-white 
                     transition-colors duration-200 group-hover:text-primary-600 
                     dark:group-hover:text-primary-400">
        {title}
      </h3>
      <p className="text-center text-secondary-500 dark:text-gray-300 mb-6 text-base">
        {description}
      </p>
      <Link 
        to={link}
        className="mt-auto font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400
                 dark:hover:text-primary-300 transition-colors flex items-center group"
      >
        <span>Daha Fazla Bilgi</span>
        <svg className="ml-1 h-5 w-5 transform transition-transform duration-200 group-hover:translate-x-0.5" 
             xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" 
                d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" 
                clipRule="evenodd" />
        </svg>
      </Link>
    </div>
  );
};

export default BusinessTypeCard;