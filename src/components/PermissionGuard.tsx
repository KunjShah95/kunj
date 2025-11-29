import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AppRole } from '@/lib/roleUtils';

interface PermissionGuardProps {
  requiredRole: AppRole | AppRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showMessage?: boolean;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  requiredRole,
  children,
  fallback,
  showMessage = true
}) => {
  const { user } = useAuth();

  const hasPermission = () => {
    if (!user || !user.role) return false;
    
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role);
    }
    
    return user.role === requiredRole;
  };

  if (!hasPermission()) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showMessage) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-yellow-900">Permission Required</h3>
            <p className="text-sm text-yellow-700">
              You need {Array.isArray(requiredRole) ? requiredRole.join(' or ') : requiredRole} role to access this feature.
            </p>
          </div>
        </div>
      );
    }

    return null;
  }

  return <>{children}</>;
};

interface RoleBasedProps {
  allowedRoles: AppRole | AppRole[];
  children: React.ReactNode;
}

export const RoleBased: React.FC<RoleBasedProps> = ({ allowedRoles, children }) => {
  const { user } = useAuth();

  const hasRole = () => {
    if (!user || !user.role) return false;
    
    if (Array.isArray(allowedRoles)) {
      return allowedRoles.includes(user.role);
    }
    
    return user.role === allowedRoles;
  };

  if (!hasRole()) {
    return null;
  }

  return <>{children}</>;
};
