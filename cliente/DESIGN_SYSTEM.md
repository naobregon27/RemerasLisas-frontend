# Sistema de Diseño UI/UX - Panel de Administración

## 🎨 Paleta de Colores

### Colores Principales
El sistema utiliza una paleta moderna que va desde **azul oscuro** hasta **verde inglés** con degradados profesionales.

#### Primary (Verde Inglés)
- `primary-50`: #e6f4f1 (Verde muy claro)
- `primary-400`: #1aa485 (Verde inglés)
- `primary-600`: #16836b (Verde inglés oscuro)
- `primary-800`: #0a201d (Verde casi negro)

#### Secondary (Azul Oscuro)
- `secondary-50`: #e8eef5 (Azul muy claro)
- `secondary-600`: #183d62 (Azul muy oscuro)
- `secondary-800`: #0c1e30 (Azul casi negro)
- `secondary-900`: #060f18 (Azul negro)

#### Accent (Azul Acento)
- `accent-400`: #38bdf8
- `accent-500`: #0ea5e9
- `accent-600`: #0284c7

#### Success (Verde)
- `success-300`: #6ee7b7
- `success-400`: #34d399
- `success-500`: #10b981

#### Warning (Amarillo/Naranja)
- `warning-300`: #fcd34d
- `warning-400`: #fbbf24
- `warning-500`: #f59e0b

#### Error (Rojo)
- `error-300`: #fca5a5
- `error-400`: #f87171
- `error-500`: #ef4444

## 🧩 Componentes Reutilizables

### LoadingSpinner
Spinner de carga con múltiples tamaños y opción de pantalla completa.

```jsx
import LoadingSpinner from '@/components/common/LoadingSpinner';

// Uso básico
<LoadingSpinner size="md" />

// Con texto
<LoadingSpinner size="lg" text="Cargando datos..." />

// Pantalla completa
<LoadingSpinner fullScreen text="Procesando..." />
```

**Tamaños disponibles:** `sm`, `md`, `lg`, `xl`

### StatusBadge
Badge para mostrar estados con colores semánticos.

```jsx
import StatusBadge from '@/components/common/StatusBadge';

// Estados predefinidos
<StatusBadge status="pending" />
<StatusBadge status="completed" />
<StatusBadge status="active" />
<StatusBadge status="error" />

// Estado personalizado
<StatusBadge status="custom" type="info" />
```

**Estados disponibles:** `pending`, `processing`, `completed`, `cancelled`, `shipped`, `delivered`, `active`, `inactive`, `enabled`, `disabled`

### EmptyState
Componente para mostrar estados vacíos con estilo profesional.

```jsx
import EmptyState from '@/components/common/EmptyState';

<EmptyState
  icon="📦"
  title="No hay productos"
  description="Aún no has agregado productos a tu tienda"
  action={<button className="btn-primary">Agregar Producto</button>}
/>
```

### ErrorState
Componente para mostrar errores con opción de reintentar.

```jsx
import ErrorState from '@/components/common/ErrorState';

<ErrorState
  title="Error al cargar"
  message="No se pudieron cargar los datos"
  onRetry={() => fetchData()}
/>
```

### ConfirmDialog
Diálogo de confirmación para acciones importantes.

```jsx
import ConfirmDialog from '@/components/common/ConfirmDialog';

<ConfirmDialog
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onConfirm={handleDelete}
  title="¿Eliminar producto?"
  message="Esta acción no se puede deshacer"
  confirmText="Eliminar"
  cancelText="Cancelar"
  type="danger"
/>
```

## 🎭 Clases CSS Personalizadas

### Cards
```jsx
// Card con efecto glassmorphism
<div className="glass-card p-6">
  Contenido
</div>

// Card premium con gradiente
<div className="premium-card p-6">
  Contenido premium
</div>
```

### Botones
```jsx
// Botón primario con gradiente
<button className="btn-primary">Acción Principal</button>

// Botón secundario
<button className="btn-secondary">Acción Secundaria</button>

// Botón de éxito
<button className="btn-success">Guardar</button>

// Botón de peligro
<button className="btn-danger">Eliminar</button>
```

### Inputs
```jsx
// Input moderno
<input className="input-modern" placeholder="Ingresa texto..." />

// Select moderno
<select className="select-modern">
  <option>Opción 1</option>
</select>

// Textarea moderno
<textarea className="textarea-modern" placeholder="Descripción..." />
```

### Badges
```jsx
<span className="badge badge-primary">Primario</span>
<span className="badge badge-success">Éxito</span>
<span className="badge badge-warning">Advertencia</span>
<span className="badge badge-error">Error</span>
<span className="badge badge-info">Información</span>
```

### Títulos con Gradiente
```jsx
<h1 className="gradient-title">Título Impactante</h1>
```

### Tablas Modernas
```jsx
<table className="table-modern">
  <thead>
    <tr>
      <th>Columna 1</th>
      <th>Columna 2</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Dato 1</td>
      <td>Dato 2</td>
    </tr>
  </tbody>
</table>
```

### Modales
```jsx
// Overlay del modal
<div className="modal-overlay">
  {/* Contenido del modal */}
  <div className="modal-content">
    <h2>Título del Modal</h2>
    <p>Contenido...</p>
  </div>
</div>
```

### Sidebar
```jsx
// Item del sidebar
<button className="sidebar-item">
  <Icon />
  <span>Nombre</span>
</button>

// Item activo del sidebar
<button className="sidebar-item-active">
  <Icon />
  <span>Nombre</span>
</button>
```

## 🎬 Animaciones

### Animaciones Predefinidas
- `animate-fadeIn`: Aparición gradual
- `animate-slideUp`: Deslizamiento hacia arriba
- `animate-slideDown`: Deslizamiento hacia abajo
- `animate-pulse-soft`: Pulso suave
- `animate-gradient`: Animación de gradiente

### Uso
```jsx
<div className="animate-fadeIn">
  Contenido con animación
</div>

<div className="animate-slideUp" style={{ animationDelay: '100ms' }}>
  Contenido con retraso
</div>
```

## 📊 Redux Slices

### Slices Disponibles
El sistema incluye slices completos para:

1. **authSlice** - Autenticación de usuarios
2. **productSlice** - Gestión de productos
3. **categorySlice** - Gestión de categorías
4. **orderSlice** - Gestión de órdenes
5. **userSlice** - Gestión de usuarios

### Ejemplo de Uso
```jsx
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '@/redux/slices/productSlice';

function MyComponent() {
  const dispatch = useDispatch();
  const { items, status, error } = useSelector(state => state.products);

  useEffect(() => {
    dispatch(fetchProducts(storeSlug));
  }, [dispatch, storeSlug]);

  if (status === 'loading') {
    return <LoadingSpinner />;
  }

  if (status === 'failed') {
    return <ErrorState message={error} />;
  }

  return <div>{/* Renderizar productos */}</div>;
}
```

## 🎯 Feedback al Usuario

### Toasts
Los toasts están configurados con el nuevo diseño:

```jsx
import { toast } from 'react-toastify';

// Toast de éxito
toast.success('¡Operación exitosa!', { icon: '✅' });

// Toast de error
toast.error('Error al procesar', { icon: '❌' });

// Toast de advertencia
toast.warning('Ten cuidado', { icon: '⚠️' });

// Toast de información
toast.info('Información importante', { icon: 'ℹ️' });

// Toast personalizado
toast('Mensaje personalizado', {
  icon: '🎉',
  style: {
    background: 'linear-gradient(to right, #1aa485, #16836b)',
  }
});
```

### Estados de Carga
Todos los componentes principales manejan 3 estados:

1. **loading** - Mostrar LoadingSpinner
2. **error** - Mostrar ErrorState
3. **success** - Mostrar contenido

```jsx
if (loading) return <LoadingSpinner />;
if (error) return <ErrorState message={error} onRetry={retry} />;
return <Content />;
```

## 🎨 Mejores Prácticas

### 1. Consistencia
- Siempre usa las clases predefinidas antes de crear nuevas
- Mantén la paleta de colores establecida
- Usa los componentes reutilizables

### 2. Accesibilidad
- Todos los botones tienen estados hover y focus
- Los colores tienen suficiente contraste
- Los íconos tienen textos alternativos

### 3. Responsive
- El sistema es mobile-first
- Usa las clases responsive de Tailwind (sm:, md:, lg:, xl:)
- El sidebar es colapsable en móviles

### 4. Performance
- Los componentes usan lazy loading cuando es posible
- Las animaciones son optimizadas
- Las imágenes tienen lazy loading

## 📱 Responsive Design

### Breakpoints
- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

### Ejemplo
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {/* Contenido responsive */}
</div>
```

## 🚀 Próximos Pasos

1. Implementar dark mode toggle
2. Añadir más animaciones personalizadas
3. Crear biblioteca de íconos personalizada
4. Implementar theming dinámico
5. Añadir más componentes reutilizables

## 📄 Notas

- El sistema está construido con **Tailwind CSS**
- Usa **React** y **Redux Toolkit** para el estado
- Las notificaciones usan **React Toastify**
- Las fuentes son **Inter** y **Poppins** de Google Fonts

---

**Versión**: 1.0.0  
**Última actualización**: Diciembre 2025  
**Desarrollado por**: Tu equipo de desarrollo

