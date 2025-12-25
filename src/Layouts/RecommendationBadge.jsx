// src/components/ui/RecommendationBadge.jsx
const RecommendationBadge = ({ isRecommended }) => {
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
      isRecommended ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
    }`}>
      {isRecommended ? 'Recommended' : 'Not Recommended'}
    </span>
  );
};

export default RecommendationBadge;