import React from 'react';

interface BrandLogoProps {
  className?: string;
}

const BrandLogo: React.FC<BrandLogoProps> = ({ className = '' }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <span className="text-red-600 font-bold text-xl">Planca</span>
    </div>
  );
};

export default BrandLogo; 