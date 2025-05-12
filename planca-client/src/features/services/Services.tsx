import React, { useState } from 'react';
import ServicesList from './ServicesList';
import ServiceForm from './ServiceForm';
import AppLayout from '@/components/layouts/AppLayout';

const Services: React.FC = () => {
  const [editModalOpen, setEditModalOpen] = useState(false);

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 dark:text-white">
            Hizmet Yönetimi
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            İşletmenizin sunduğu hizmetleri buradan ekleyebilir, düzenleyebilir ve yönetebilirsiniz.
          </p>
          
          <ServicesList />
          
          {editModalOpen && (
            <ServiceForm 
              onClose={() => setEditModalOpen(false)} 
              onSuccess={() => setEditModalOpen(false)}
            />
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Services; 