// src/components/ui/PerformanceBadge.jsx
const PerformanceBadge = ({ score }) => {
  let color = 'bg-gray-200';
  if (score >= 90) color = 'bg-green-500';
  else if (score >= 80) color = 'bg-blue-500';
  else if (score >= 70) color = 'bg-amber-500';
  else if (score >= 60) color = 'bg-orange-500';
  else color = 'bg-red-500';

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${color}`}>
      {score || 'N/A'}
    </span>
  );
};

export default PerformanceBadge;