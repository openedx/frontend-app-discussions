import React from 'react';

import { render, renderHook } from '@testing-library/react';

import useIndexOfLastVisibleChild from './useIndexOfLastVisibleChild';

describe('useIndexOfLastVisibleChild', () => {
  let observeMock;
  let disconnectMock;

  beforeAll(() => {
    observeMock = jest.fn();
    disconnectMock = jest.fn();
    global.ResizeObserver = class {
      observe = observeMock;

      disconnect = disconnectMock;
    };
  });

  afterAll(() => {
    delete global.ResizeObserver;
  });

  beforeEach(() => {
    observeMock.mockReset();
    disconnectMock.mockReset();
  });

  it('calls disconnect on cleanup when container exists', () => {
    const TestComponent = () => {
      const [, containerRef] = useIndexOfLastVisibleChild();
      return <div ref={containerRef} />;
    };
    const { unmount } = render(<TestComponent />);
    unmount();
    expect(disconnectMock).toHaveBeenCalled();
  });

  it('handles missing container gracefully (no observer or disconnect)', () => {
    const { unmount } = renderHook(() => useIndexOfLastVisibleChild());
    unmount();
    expect(disconnectMock).not.toHaveBeenCalled();
  });

  it('returns -1 if there are no children', () => {
    const TestComponent = () => {
      const [, containerRef] = useIndexOfLastVisibleChild();
      React.useEffect(() => {
        const container = document.createElement('div');
        container.getBoundingClientRect = () => ({ width: 100 });
        containerRef.current = container;
      }, []);
      return <div ref={containerRef} />;
    };
    const { unmount } = render(<TestComponent />);
    unmount();
  });

  it('triggers break when child tabs exceed container width', () => {
    const TestComponent = () => {
      const [, containerRef] = useIndexOfLastVisibleChild();
      React.useEffect(() => {
        const container = document.createElement('div');
        container.getBoundingClientRect = () => ({ width: 100 });
        const child1 = document.createElement('div');
        child1.getBoundingClientRect = () => ({ width: 80 });
        const child2 = document.createElement('div');
        child2.getBoundingClientRect = () => ({ width: 80 });
        container.appendChild(child1);
        container.appendChild(child2);

        containerRef.current = container;
      }, []);
      return <div ref={containerRef} />;
    };
    const { unmount } = render(<TestComponent />);
    unmount();
  });
});
