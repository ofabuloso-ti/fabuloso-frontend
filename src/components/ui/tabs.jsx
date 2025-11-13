import React from 'react';

export const Tabs = ({ children, value, onValueChange }) => {
  const tabChildren = React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return child;
    return React.cloneElement(child, {
      activeValue: value,
      onChange: onValueChange,
    });
  });
  return <div>{tabChildren}</div>;
};

export const TabsList = ({ children }) => (
  <div className="flex space-x-2 border-b mb-4">{children}</div>
);

export const TabsTrigger = ({ value, children, activeValue, onChange }) => {
  const isActive = value === activeValue;
  return (
    <button
      onClick={() => onChange(value)}
      className={`px-4 py-2 border-b-2 ${
        isActive
          ? 'border-blue-600 text-blue-600'
          : 'border-transparent text-gray-500'
      }`}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({ value, activeValue, children }) => {
  return value === activeValue ? <div>{children}</div> : null;
};
