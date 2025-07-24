interface DeepifyLogoProps {
  size?: number;
  className?: string;
}

export default function DeepifyLogo({ size = 16, className = "text-black" }: DeepifyLogoProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      className={className}
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 6v12" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 12L7 17" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 12l5 5" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
}