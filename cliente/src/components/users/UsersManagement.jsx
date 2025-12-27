import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import userService from '../../services/userService';
import Pagination from '../shared/Pagination';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorState from '../common/ErrorState';
import EmptyState from '../common/EmptyState';
import StatusBadge from '../common/StatusBadge';
import ConfirmDialog from '../common/ConfirmDialog';

const UsersManagement = () => {
  const { user } = useSelector(state => state.auth);
  const [users, setUsers] = useState([]);
  const [inactiveUsers, setInactiveUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState('');
  const [lastVisitedAt, setLastVisitedAt] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, user: null, action: null });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedUsers, setPaginatedUsers] = useState([]);
  const itemsPerPage = 10;

  const hasPermission = user && (user.role === 'admin' || user.role === 'superAdmin');

  useEffect(() => {
    if (hasPermission) {
      setCurrentPage(1);
      fetchUsers();
      const lastVisit = localStorage.getItem('admin_last_visited');
      if (lastVisit) {
        setLastVisitedAt(lastVisit);
      }
    }
  }, [hasPermission, showInactive]);

  useEffect(() => {
    paginateUsers();
  }, [users, inactiveUsers, showInactive, currentPage, searchTerm]);
  
  const paginateUsers = () => {
    const displayedUsers = showInactive ? inactiveUsers : users;
    const filtered = displayedUsers.filter(u =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedUsers(filtered.slice(startIndex, endIndex));
  };
  
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const isNewUser = (userItem) => {
    if (!lastVisitedAt || !userItem.createdAt) return false;
    return new Date(userItem.createdAt) > new Date(lastVisitedAt);
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!user || !user.token) {
        console.error('No hay token disponible para autenticación');
        setError('Error de autenticación. Por favor, inicie sesión nuevamente.');
        return;
      }
      
      if (showInactive) {
        const data = await userService.getInactiveUsers();
        console.log('📋 Usuarios inactivos recibidos:', data);
        setInactiveUsers(Array.isArray(data) ? data : []);
        toast.success(`${Array.isArray(data) ? data.length : 0} usuarios inactivos cargados`, { icon: '👥' });
      } else {
        const data = await userService.getUsers();
        console.log('📋 Usuarios activos recibidos:', data);
        console.log('📋 Tipo de datos:', Array.isArray(data) ? 'Array' : typeof data);
        console.log('📋 Cantidad de usuarios:', Array.isArray(data) ? data.length : 'No es array');
        const usersArray = Array.isArray(data) ? data : [];
        setUsers(usersArray);
        toast.success(`${usersArray.length} usuarios activos cargados`, { icon: '👥' });
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      setError('Error al cargar usuarios. Por favor, intente nuevamente.');
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = (userToDeactivate) => {
    setConfirmDialog({
      isOpen: true,
      user: userToDeactivate,
      action: 'deactivate'
    });
  };

  const handleReactivate = (userToReactivate) => {
    setConfirmDialog({
      isOpen: true,
      user: userToReactivate,
      action: 'reactivate'
    });
  };

  const confirmAction = async () => {
    const { user: targetUser, action } = confirmDialog;
    
    try {
      if (action === 'deactivate') {
        await userService.deactivateUser(targetUser._id);
        toast.success(`Usuario "${targetUser.name}" desactivado`, { icon: '🚫' });
      } else if (action === 'reactivate') {
        await userService.reactivateUser(targetUser._id);
        toast.success(`Usuario "${targetUser.name}" reactivado`, { icon: '✅' });
      }
      fetchUsers();
    } catch (error) {
      console.error('Error en acción de usuario:', error);
      toast.error('Error al procesar la acción');
    } finally {
      setConfirmDialog({ isOpen: false, user: null, action: null });
    }
  };

  if (!hasPermission) {
    return (
      <ErrorState
        title="Sin permisos"
        message="No tienes permisos para ver esta sección"
      />
    );
  }

  if (loading) {
    return <LoadingSpinner fullScreen text="Cargando usuarios..." />;
  }

  if (error) {
    return <ErrorState title="Error" message={error} onRetry={fetchUsers} />;
  }

  const displayedUsers = showInactive ? inactiveUsers : users;
  const totalPages = Math.ceil(displayedUsers.filter(u =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ).length / itemsPerPage);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold gradient-title">Gestión de Usuarios</h1>
            <p className="text-gray-400 mt-1">
              {displayedUsers.length} usuario{displayedUsers.length !== 1 ? 's' : ''} {showInactive ? 'inactivos' : 'activos'}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowInactive(!showInactive)}
              className="btn-secondary flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              {showInactive ? 'Ver Activos' : 'Ver Inactivos'}
            </button>
            <button
              onClick={fetchUsers}
              className="btn-secondary flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualizar
            </button>
          </div>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="glass-card p-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, email o rol..."
            className="input-modern pl-10"
          />
        </div>
      </div>

      {/* Lista de usuarios */}
      {paginatedUsers.length === 0 ? (
        <EmptyState
          icon="👥"
          title={showInactive ? "No hay usuarios inactivos" : "No hay usuarios"}
          description={searchTerm ? 
            "No se encontraron usuarios con el término de búsqueda" : 
            showInactive ? "No hay usuarios inactivos" : "Aún no hay usuarios registrados"}
        />
      ) : (
        <>
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table-modern">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Última Conexión</th>
                    <th># Logins</th>
                    <th>Fecha Creación</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((userItem) => (
                    <tr key={userItem._id} className={isNewUser(userItem) ? 'bg-success-500/10' : ''}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold">
                            {userItem.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{userItem.name || 'Sin nombre'}</p>
                            {isNewUser(userItem) && (
                              <span className="badge badge-success text-xs">Nuevo</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>{userItem.email}</td>
                      <td>
                        <StatusBadge 
                          status={userItem.role} 
                          type={
                            userItem.role === 'admin' ? 'error' :
                            userItem.role === 'superAdmin' ? 'warning' :
                            userItem.role === 'vendedor' ? 'info' :
                            'default'
                          }
                        />
                      </td>
                      <td>
                        <StatusBadge status={userItem.isActive !== false ? 'active' : 'inactive'} />
                      </td>
                      <td className="text-gray-300">
                        {userItem.lastLogin ? 
                          new Date(userItem.lastLogin).toLocaleString('es-ES') : 
                          'Nunca'}
                      </td>
                      <td className="text-center">{userItem.loginCount || 0}</td>
                      <td className="text-gray-300">
                        {new Date(userItem.createdAt).toLocaleDateString('es-ES')}
                      </td>
                      <td>
                        <div className="flex gap-2">
                          {showInactive ? (
                            <button
                              onClick={() => handleReactivate(userItem)}
                              className="btn-success px-3 py-1 text-sm"
                              title="Reactivar usuario"
                            >
                              Reactivar
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDeactivate(userItem)}
                              className="btn-danger px-3 py-1 text-sm"
                              title="Desactivar usuario"
                            >
                              Desactivar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}

      {/* Diálogo de confirmación */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, user: null, action: null })}
        onConfirm={confirmAction}
        title={confirmDialog.action === 'deactivate' ? '¿Desactivar usuario?' : '¿Reactivar usuario?'}
        message={
          confirmDialog.action === 'deactivate'
            ? `El usuario "${confirmDialog.user?.name}" será desactivado.`
            : `El usuario "${confirmDialog.user?.name}" será reactivado.`
        }
        confirmText={confirmDialog.action === 'deactivate' ? 'Desactivar' : 'Reactivar'}
        type={confirmDialog.action === 'deactivate' ? 'danger' : 'info'}
      />
    </div>
  );
};

export default UsersManagement;
