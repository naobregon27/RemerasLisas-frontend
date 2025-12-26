import EmptyState from '../common/EmptyState';
import StatusBadge from '../common/StatusBadge';

const RecentUsersModal = ({ isOpen, onClose, users }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-success-500/20">
              <svg className="w-6 h-6 text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Usuarios Recientes</h2>
              <p className="text-sm text-gray-400">Últimos 7 días • {users?.length || 0} usuarios</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="space-y-3">
          {!users || users.length === 0 ? (
            <EmptyState
              icon="👥"
              title="No hay usuarios recientes"
              description="No se han registrado nuevos usuarios en los últimos 7 días"
            />
          ) : (
            users.map((user, index) => (
              <div 
                key={user._id} 
                className="glass-card p-4 hover:border-primary-400/50 transition-all"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-glow-primary">
                      <span className="text-xl font-bold text-white">
                        {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || '?'}
                      </span>
                    </div>
                    {/* Indicador de nuevo usuario (últimas 24 horas) */}
                    {new Date(user.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000) && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-success-500 rounded-full border-2 border-secondary-800 animate-pulse"></div>
                    )}
                  </div>
                  
                  {/* Información del usuario */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white truncate">
                        {user.name || 'Usuario sin nombre'}
                      </h3>
                      {user.role && (
                        <span className={`badge ${
                          user.role === 'admin' ? 'badge-error' :
                          user.role === 'superAdmin' ? 'badge-warning' :
                          user.role === 'vendedor' ? 'badge-info' :
                          'badge-primary'
                        }`}>
                          {user.role}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 truncate flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                      {user.email || 'Sin email'}
                    </p>
                  </div>
                  
                  {/* Fecha de registro */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-400 mb-1">Registrado</p>
                    <p className="text-sm font-medium text-white">
                      {new Date(user.createdAt).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(user.createdAt).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                {/* Información adicional */}
                {(user.phone || user.telefono || user.address || user.direccion) && (
                  <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-2 gap-3 text-sm">
                    {(user.phone || user.telefono) && (
                      <div className="flex items-center gap-2 text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span>{user.phone || user.telefono}</span>
                      </div>
                    )}
                    {(user.address || user.direccion) && (
                      <div className="flex items-center gap-2 text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="truncate">{user.address || user.direccion}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecentUsersModal;
