import React, {
  useEffect,
  useRef,
} from 'react';
import PropTypes from 'prop-types';

function ScrollThreshold({ onScroll }) {
  const elementRef = useRef(null);

  useEffect(() => {
    if (!elementRef.current) {
      return undefined;
    }

    // create the observer
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onScroll();
        }
      },
    );

    observer.observe(elementRef.current);

    // cleanup callback
    return () => {
      observer.disconnect();
    };
  }, [elementRef]);

  return (
    <div ref={elementRef} />
  );
}

ScrollThreshold.propTypes = {
  onScroll: PropTypes.func.isRequired,
};

export default ScrollThreshold;
