import PropTypes from 'prop-types';

const LoadingSpinner = ({ size = 'md', fullScreen = false, text = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-4',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4',
  };

  const Spinner = () => (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizeClasses[size]} border-primary-400/30 border-t-primary-400 rounded-full animate-spin`} />
      {text && (
        <p className="text-gray-300 text-sm font-medium animate-pulse">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-secondary-900/90 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="glass-card p-8">
          <Spinner />
        </div>
      </div>
    );
  }

  return <Spinner />;
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  fullScreen: PropTypes.bool,
  text: PropTypes.string,
};

export default LoadingSpinner;


