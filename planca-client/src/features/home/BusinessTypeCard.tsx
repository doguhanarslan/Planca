import React from 'react';
import { Link } from 'react-router-dom';

interface BusinessTypeCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
}

const BusinessTypeCard: React.FC<BusinessTypeCardProps> = ({ title, description, icon, link }) => {
  return (
    <div className="flex flex-col items-center rounded-xl shadow-lg p-6 bg-white border border-gray-100 hover:shadow-xl transition-shadow duration-300 card-hover">
      <div className="bg-primary-50 p-4 rounded-full mb-4">
        <div className="text-primary-600 h-10 w-10">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-semibold mb-2 text-secondary-900">{title}</h3>
      <p className="text-center text-secondary-500 mb-6">{description}</p>
      <Link 
        to={link}
        className="mt-auto font-medium text-primary-600 hover:text-primary-700 transition-colors flex items-center"
      >
        Daha Fazla Bilgi
        <svg className="ml-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </Link>
    </div>
  );
};

export default BusinessTypeCard;