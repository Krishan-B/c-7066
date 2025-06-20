
import React from 'react';
import LeverageManager from '@/components/leverage/LeverageManager';

const Leverage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Leverage Management</h1>
        <p className="text-muted-foreground mt-2">
          Calculate margin requirements and manage leverage across your positions
        </p>
      </div>
      
      <LeverageManager />
    </div>
  );
};

export default Leverage;
