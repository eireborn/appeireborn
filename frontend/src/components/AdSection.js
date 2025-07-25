 import React from 'react';

const AdBanner = ({ 
  company, 
  logo, 
  tagline, 
  website, 
  backgroundColor = '#f97316',
  textColor = 'white',
  size = 'medium' 
}) => {
  const handleAdClick = () => {
    if (website) {
      window.open(website, '_blank');
    }
  };

  const sizeClasses = {
    small: 'p-4 text-sm',
    medium: 'p-6 text-base',
    large: 'p-8 text-lg'
  };

  return (
    <div 
      onClick={handleAdClick}
      className={`
        ${sizeClasses[size]} 
        rounded-2xl cursor-pointer transition-all duration-300 
        hover:transform hover:scale-105 hover:shadow-lg
        flex items-center justify-between
      `}
      style={{ backgroundColor, color: textColor }}
    >
      <div className="flex items-center gap-4">
        {logo && (
          <img 
            src={logo} 
            alt={`${company} logo`}
            className="h-12 w-12 object-contain bg-white rounded-lg p-2"
          />
        )}
        <div>
          <h3 className="font-bold text-lg">{company}</h3>
          {tagline && (
            <p className="opacity-90 text-sm">{tagline}</p>
          )}
        </div>
      </div>
      <div className="text-right">
        <span className="text-xs opacity-75">SPONSORED</span>
        <div className="text-sm font-semibold">Visit Store →</div>
      </div>
    </div>
  );
};

const AdSection = ({ title, ads }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <span className="text-xs text-gray-500">ADVERTISEMENT</span>
      </div>
      <div className="space-y-3">
        {ads.map((ad, index) => (
          <AdBanner key={index} {...ad} />
        ))}
      </div>
    </div>
  );
};

// Sample advertising data for shooting-related companies
export const sampleAds = {
  equipment: [
    {
      company: "Eireborn Australia",
      tagline: "Premium Shooting Vest & Accessories",
      website: "https://eireborn.au",
      backgroundColor: '#ea580c'
    },
    {
      company: "Clay Target Supplies",
      tagline: "Quality Ammunition & Accessories",
      website: "https://example.com",
      backgroundColor: '#f97316'
    },
    // NEW ADVERTISEMENT - Add your new ad here!
    {
      company: "Aussie Gun Works",
      tagline: "Custom Gunsmithing & Repairs",
      website: "https://aussiegunworks.com.au",
      backgroundColor: '#fb923c'
    }
  ],
  training: [
    {
      company: "Perth Metro Sporting Clays",
      tagline: "Professional Clay Shooting Training",
      website: "https://pmsc.club",
      backgroundColor: '#fb923c'
    },
    // NEW TRAINING AD - Example
    {
      company: "Elite Shooting School",
      tagline: "Learn from Olympic Champions",
      website: "https://eliteshooting.com.au",
      backgroundColor: '#f97316'
    }
  ],
  ranges: [
    {
      company: "Melbourne Gun Club",
      tagline: "Premier Shooting Facility",
      website: "https://example.com",
      backgroundColor: '#fdba74'
    }
  ],
  // NEW CATEGORY - You can add new categories!
  services: [
    {
      company: "Clay Insurance Co",
      tagline: "Specialized Shooting Sports Insurance",
      website: "https://clayinsurance.com.au",
      backgroundColor: '#ea580c'
    }
  ]
};

export default AdSection;
