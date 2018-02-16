import React from 'react';

export default function FontAwesome({ name, spinner, className, ...props }) {
  className = `fas fa-${name} ${className || ''}`;

  return (
    <span>
      <i className={className} {...props} />
    </span>
  );
}
