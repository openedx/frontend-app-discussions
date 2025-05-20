import { useLayoutEffect, useRef, useState } from 'react';

const invisibleStyle = {
  position: 'absolute',
  left: 0,
  pointerEvents: 'none',
  visibility: 'hidden',
};

/**
 * This hook calculates the index of the last child that can fit into the
 * container element without overflowing. All children are rendered, but those
 * that exceed the available width are styled with `invisibleStyle` to hide them
 * visually while preserving their dimensions for measurement.
 *
 * It uses ResizeObserver to automatically react to any changes in container
 * size or child widths — without requiring a window resize event.
 *
 * Returns:
 * [
 *   indexOfLastVisibleChild, // Index of the last tab that fits in the container
 *   containerElementRef, // Ref to attach to the tabs container
 *   invisibleStyle, // Style object to apply to "hidden" tabs
 *   overflowElementRef // Ref to the overflow ("More...") element
 * ]
 */
export default function useIndexOfLastVisibleChild() {
  const containerElementRef = useRef(null);
  const overflowElementRef = useRef(null);
  const [indexOfLastVisibleChild, setIndexOfLastVisibleChild] = useState(-1);

  // Measures how many tab elements fit within the container's width
  const measureVisibleChildren = () => {
    const container = containerElementRef.current;
    const overflow = overflowElementRef.current;
    if (!container) { return; }

    const containingRect = container.getBoundingClientRect();

    // Get all children excluding the overflow element
    const children = Array.from(container.children).filter(child => child !== overflow);

    let sumWidth = overflow ? overflow.getBoundingClientRect().width : 0;
    let lastVisibleIndex = -1;

    for (let i = 0; i < children.length; i++) {
      const width = Math.floor(children[i].getBoundingClientRect().width);
      sumWidth += width;

      if (sumWidth <= containingRect.width) {
        lastVisibleIndex = i;
      } else {
        break;
      }
    }

    setIndexOfLastVisibleChild(lastVisibleIndex);
  };

  useLayoutEffect(() => {
    const container = containerElementRef.current;
    if (!container) { return undefined; }

    // ResizeObserver tracks size changes of the container or its children
    const resizeObserver = new ResizeObserver(() => {
      measureVisibleChildren();
    });

    resizeObserver.observe(container);
    // Run once on mount to ensure accurate measurement from the start
    measureVisibleChildren();

    return () => resizeObserver.disconnect();
  }, []);

  return [indexOfLastVisibleChild, containerElementRef, invisibleStyle, overflowElementRef];
}
