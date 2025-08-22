import React from 'react';

import { act, render, renderHook } from '@testing-library/react';

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

  it('calls measureVisibleChildren on mount and when ResizeObserver triggers', () => {
    const TestComponent = () => {
      const [, containerRef] = useIndexOfLastVisibleChild();
      React.useEffect(() => {
        const container = document.createElement('div');
        container.getBoundingClientRect = () => ({ width: 200 });
        containerRef.current = container;
      }, []);
      return <div ref={containerRef} />;
    };

    const { unmount } = render(<TestComponent />);

    expect(observeMock).toHaveBeenCalled();

    act(() => {
      const resizeObserverCallback = observeMock.mock.calls[0][0];
      if (resizeObserverCallback && typeof resizeObserverCallback === 'function') {
        resizeObserverCallback();
      }
    });

    unmount();
  });

  it('calculates correct last visible index when children fit within container', () => {
    let resizeObserverCallback;

    global.ResizeObserver = function (callback) {
      resizeObserverCallback = callback;
      this.observe = jest.fn();
      this.disconnect = jest.fn();
    };

    const TestComponent = () => {
      const [lastVisibleIndex, containerRef, , overflowRef] = useIndexOfLastVisibleChild();

      React.useEffect(() => {
        const container = document.createElement('div');
        container.getBoundingClientRect = () => ({ width: 200 });

        const child1 = document.createElement('div');
        child1.getBoundingClientRect = () => ({ width: 50 });
        const child2 = document.createElement('div');
        child2.getBoundingClientRect = () => ({ width: 60 });
        const child3 = document.createElement('div');
        child3.getBoundingClientRect = () => ({ width: 70 });

        container.appendChild(child1);
        container.appendChild(child2);
        container.appendChild(child3);

        containerRef.current = container;
        overflowRef.current = null;
      }, []);

      return (
        <div>
          <div ref={containerRef} />
          <div data-testid="last-visible-index">{lastVisibleIndex}</div>
        </div>
      );
    };

    const { getByTestId, unmount } = render(<TestComponent />);

    act(() => {
      if (resizeObserverCallback) {
        resizeObserverCallback();
      }
    });

    // The last visible index should be 2 (all three children fit: 50 + 60 + 70 = 180 <= 200)
    expect(getByTestId('last-visible-index').textContent).toBe('2');

    unmount();
  });

  it('handles overflow element in width calculation', () => {
    let resizeObserverCallback;

    global.ResizeObserver = function (callback) {
      resizeObserverCallback = callback;
      this.observe = jest.fn();
      this.disconnect = jest.fn();
    };

    const TestComponent = () => {
      const [lastVisibleIndex, containerRef, , overflowRef] = useIndexOfLastVisibleChild();

      React.useEffect(() => {
        const container = document.createElement('div');
        container.getBoundingClientRect = () => ({ width: 150 });

        const overflow = document.createElement('div');
        overflow.getBoundingClientRect = () => ({ width: 30 });

        const child1 = document.createElement('div');
        child1.getBoundingClientRect = () => ({ width: 50 });
        const child2 = document.createElement('div');
        child2.getBoundingClientRect = () => ({ width: 60 });

        container.appendChild(child1);
        container.appendChild(child2);
        container.appendChild(overflow);

        containerRef.current = container;
        overflowRef.current = overflow;
      }, []);

      return (
        <div>
          <div ref={containerRef} />
          <div data-testid="last-visible-index">{lastVisibleIndex}</div>
        </div>
      );
    };

    const { getByTestId, unmount } = render(<TestComponent />);

    act(() => {
      if (resizeObserverCallback) {
        resizeObserverCallback();
      }
    });

    // With overflow width (30) + child1 (50) + child2 (60) = 140 <= 150
    // So last visible index should be 1 (child2)
    expect(getByTestId('last-visible-index').textContent).toBe('1');

    unmount();
  });

  it('returns -1 when no children fit within container width', () => {
    let resizeObserverCallback;

    global.ResizeObserver = function (callback) {
      resizeObserverCallback = callback;
      this.observe = jest.fn();
      this.disconnect = jest.fn();
    };

    const TestComponent = () => {
      const [lastVisibleIndex, containerRef] = useIndexOfLastVisibleChild();

      React.useEffect(() => {
        const container = document.createElement('div');
        container.getBoundingClientRect = () => ({ width: 50 });

        const child1 = document.createElement('div');
        child1.getBoundingClientRect = () => ({ width: 100 });
        const child2 = document.createElement('div');
        child2.getBoundingClientRect = () => ({ width: 80 });

        container.appendChild(child1);
        container.appendChild(child2);

        containerRef.current = container;
      }, []);

      return (
        <div>
          <div ref={containerRef} />
          <div data-testid="last-visible-index">{lastVisibleIndex}</div>
        </div>
      );
    };

    const { getByTestId, unmount } = render(<TestComponent />);

    act(() => {
      if (resizeObserverCallback) {
        resizeObserverCallback();
      }
    });

    // No children fit within 50px width, so should return -1
    expect(getByTestId('last-visible-index').textContent).toBe('-1');

    unmount();
  });
});
