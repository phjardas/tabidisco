export default function FontAwesome({ name, className, ...props }) {
  className = `fas fa-${name} ${className || ''}`;

  return (
    <span>
      <i className={className} {...props} />
    </span>
  );
}
