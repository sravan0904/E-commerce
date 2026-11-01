import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmptyState = ({
  icon: Icon = PackageOpen,
  title = 'Nothing here yet',
  description = '',
  actionLabel = '',
  actionTo = '',
  onAction = null,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      {description && <p className="text-gray-500 max-w-sm mb-6">{description}</p>}
      {actionLabel && actionTo && (
        <Link
          to={actionTo}
          className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
        >
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionTo && (
        <button
          onClick={onAction}
          className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
