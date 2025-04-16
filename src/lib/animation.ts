
import { cn } from '@/lib/utils';

type AnimationType = 
  | 'fade-in'
  | 'fade-out'
  | 'slide-in-right'
  | 'slide-in-left'
  | 'slide-out-right'
  | 'slide-out-left'
  | 'scale-in'
  | 'scale-out'
  | 'bounce';

interface AnimationProps {
  type: AnimationType;
  duration?: number; // in milliseconds
  delay?: number;    // in milliseconds
  className?: string;
}

export const getAnimationClass = ({
  type,
  duration = 300,
  delay = 0,
  className = '',
}: AnimationProps): string => {
  const animationClasses: Record<AnimationType, string> = {
    'fade-in': 'animate-fade-in',
    'fade-out': 'animate-fade-out',
    'slide-in-right': 'animate-slide-in-right',
    'slide-in-left': 'animate-slide-in-left', 
    'slide-out-right': 'animate-slide-out-right',
    'slide-out-left': 'animate-slide-out-left',
    'scale-in': 'animate-scale-in',
    'scale-out': 'animate-scale-out',
    'bounce': 'animate-bounce'
  };

  const styleAttr = `--animation-duration: ${duration}ms; --animation-delay: ${delay}ms;`;
  
  return cn(
    animationClasses[type],
    className,
    'animation-custom-timing',
  );
};

// Animated component wrapper
export const withAnimation = (Component: React.ComponentType<any>, animationProps: AnimationProps) => {
  return (props: any) => {
    const animationClass = getAnimationClass(animationProps);
    
    return (
      <div className={animationClass} style={{ 
        '--animation-duration': `${animationProps.duration || 300}ms`,
        '--animation-delay': `${animationProps.delay || 0}ms`
      } as React.CSSProperties}>
        <Component {...props} />
      </div>
    );
  };
};
