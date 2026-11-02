import { useLayoutEffect, useRef, useState } from 'react';

const invisibleStyle = {
  position: 'absolute',
  left: 0,
  pointerEvents: 'none',
  visibility: 'hidden',
};

/**
 * Finds the index of the last child of the container that still fits, leaving room for the
 * overflow ("More...") element. Hidden children keep their width (see `invisibleStyle`), so
 * they are measured like the visible ones.
 *
 * It re-measures whenever the container or any child changes size, not only when the window
 * is resized: tab labels also get wider when a web font or a translation arrives after the
 * first render, while the container keeps its width.
 *
 * Returns [indexOfLastVisibleChild, containerElementRef, invisibleStyle, overflowElementRef].
 */
export default function useIndexOfLastVisibleChild() {
  const containerElementRef = useRef(null);
  const overflowElementRef = useRef(null);
  const [indexOfLastVisibleChild, setIndexOfLastVisibleChild] = useState(-1);

  // No dependency list: the children to observe are collected again after every render.
  useLayoutEffect(() => {
    const container = containerElementRef.current;
    if (!container) {
      return undefined;
    }
    const children = [...container.children];

    const measure = () => {
      const overflow = overflowElementRef.current;
      const availableWidth = container.getBoundingClientRect().width;
      let usedWidth = overflow ? overflow.getBoundingClientRect().width : 0;
      const items = children.filter(child => child !== overflow);
      const firstHidden = items.findIndex(child => {
        usedWidth += child.getBoundingClientRect().width;
        return usedWidth > availableWidth;
      });
      setIndexOfLastVisibleChild(firstHidden === -1 ? items.length - 1 : firstHidden - 1);
    };

    // Observing an element also reports its current size, which gives the first measurement.
    const observer = new ResizeObserver(measure);
    [container, ...children].forEach(element => observer.observe(element));
    return () => observer.disconnect();
  });

  return [indexOfLastVisibleChild, containerElementRef, invisibleStyle, overflowElementRef];
}
