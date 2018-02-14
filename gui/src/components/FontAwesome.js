import React from 'react';

export default function FontAwesome({ name, className, ...props }) {
  className = `fas fa-${name} ${className || ''}`;

  return (
    <span suppressHydrationWarning>
      <i className={className} title={name} {...props} />
    </span>
  );
}
