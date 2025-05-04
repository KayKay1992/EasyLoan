// CustomLegend.js
import React from 'react';

const COLORS = {
  personal: '#FF1F57',
  business: '#FE9900',
  student: '#00BC7D',
  mortgage: '#7e22ce',
  'car loan': '#9eb333',
  'quickie loan': '#0056aa',
};

const BarCustomLegend = ({ payload }) => {
  return (
    <ul className="flex flex-wrap gap-4 mt-2 text-xs items-center justify-center">
      {payload.map((entry, index) => (
        <li key={index} className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full inline-block"
            style={{ backgroundColor: COLORS[entry.value] || '#ccc' }}
          />
          {entry.value}
        </li>
      ))}
    </ul>
  );
};

export default BarCustomLegend;
