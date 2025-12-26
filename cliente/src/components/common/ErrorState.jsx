import PropTypes from 'prop-types';

const ErrorState = ({ 
  title = 'Algo salió mal', 
  message = 'Ha ocurrido un error inesperado. Por favor, intenta de nuevo.', 
  onRetry = null 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="glass-card p-8 max-w-md w-full text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
        <p className="text-gray-300 mb-6">{message}</p>
        {onRetry && (
          <button 
            onClick={onRetry}
            className="btn-primary"
          >
            Intentar de nuevo
          </button>
        )}
      </div>
    </div>
  );
};

ErrorState.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string,
  onRetry: PropTypes.func,
};

export default ErrorState;


