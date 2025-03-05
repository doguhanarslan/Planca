// src/components/auth/TenantSelector.tsx
import React, { useState, useEffect } from 'react';
import { useAppDispatch } from '@/store';
import { fetchTenant } from '../../store/slices/authSlice';
import api from '../../services/api';

interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  logoUrl?: string;
}

const TenantSelector: React.FC = () => {
  const dispatch = useAppDispatch();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Gerçek bir uygulamada API'den tenant'ları çekebilirsiniz
    const fetchTenants = async () => {
      try {
        // const response = await api.get<Tenant[]>('/tenants');
        // setTenants(response.data);
        
        // Örnek veri
        setTenants([
          { id: '123', name: 'Default Salon', subdomain: 'default' },
          { id: '456', name: 'Hair Studio', subdomain: 'hairstudio' },
          { id: '789', name: 'Spa & Wellness', subdomain: 'spa' },
        ]);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching tenants:', error);
        setIsLoading(false);
      }
    };
    
    fetchTenants();
  }, []);

  const handleTenantSelect = async (tenant: Tenant) => {
    try {
      // API'ye tenant seçimini bildirin
      await api.post('/auth/select-tenant', { tenantId: tenant.id });
      
      // Redux state'i güncelleyin
      dispatch(fetchTenant());
      
      // Çoklu tenant uygulamasında tenant'ın subdomain'ine yönlendirebilirsiniz
      // window.location.href = `https://${tenant.subdomain}.yourdomain.com`;
    } catch (error) {
      console.error('Error selecting tenant:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-center">Select a Business</h2>
      
      <div className="space-y-3">
        {tenants.map((tenant) => (
          <button
            key={tenant.id}
            onClick={() => handleTenantSelect(tenant)}
            className="w-full flex items-center p-3 border rounded-md hover:bg-gray-50 transition-colors"
          >
            {tenant.logoUrl && (
              <img 
                src={tenant.logoUrl} 
                alt={`${tenant.name} logo`} 
                className="w-10 h-10 object-contain mr-3"
              />
            )}
            <span className="font-medium">{tenant.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TenantSelector;