import React, { useState } from 'react';
import AppLayout from '@/shared/ui/layouts/AppLayout';
import ServicesList from '@/features/services/ServicesList';
import ServiceForm from '@/features/services/ServiceForm';

const Services: React.FC = () => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  
  return (
    <AppLayout>
      <h1 className="text-2xl font-bold text-black mb-6">
        Hizmet Yönetimi
      </h1>
      <p className="text-gray-600 mb-8">
        Burada işletmenize ait hizmetleri ekleyebilir, düzenleyebilir ve yönetebilirsiniz. Her hizmet için süre, fiyat ve diğer detayları belirleyebilirsiniz.
      </p>
      
      <ServicesList />
      
      {editModalOpen && (
        <ServiceForm
          onClose={() => setEditModalOpen(false)} 
          onSuccess={() => setEditModalOpen(false)}
        />
      )}
    </AppLayout>
  );
};

export default Services; 