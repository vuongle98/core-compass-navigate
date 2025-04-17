
import { cn } from '@/lib/utils';
import React from 'react';

type AnimationType = 
  | 'fade-in'
  | 'fade-out'
  | 'slide-in-right'
  | 'slide-in-left'
  | 'slide-out-right'
  | 'slide-out-left'
  | 'scale-in'
  | 'scale-out'
  | 'bounce'
  | 'pulse'
  | 'pop';

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
    'bounce': 'animate-bounce',
    'pulse': 'animate-pulse',
    'pop': 'animate-pop'
  };

  const styleAttr = `--animation-duration: ${duration}ms; --animation-delay: ${delay}ms;`;
  
  return cn(
    animationClasses[type],
    className,
    'animation-custom-timing',
  );
};

// Animated component wrapper - using function approach instead of JSX
export const withAnimation = (Component: React.ComponentType<any>, animationProps: AnimationProps) => {
  return function WithAnimationWrapper(props: any) {
    const animationClass = getAnimationClass(animationProps);
    
    return React.createElement(
      'div',
      { 
        className: animationClass, 
        style: { 
          '--animation-duration': `${animationProps.duration || 300}ms`,
          '--animation-delay': `${animationProps.delay || 0}ms`
        } as React.CSSProperties
      },
      React.createElement(Component, props)
    );
  };
};

// Animation hook for components
export const useAnimation = (animationProps: AnimationProps) => {
  const animationClass = getAnimationClass(animationProps);
  const style = { 
    '--animation-duration': `${animationProps.duration || 300}ms`,
    '--animation-delay': `${animationProps.delay || 0}ms`
  } as React.CSSProperties;
  
  return { animationClass, style };
};
