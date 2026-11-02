import React from 'react';
import PropTypes from 'prop-types';

import { act, render, screen } from '@testing-library/react';

import useIndexOfLastVisibleChild from './useIndexOfLastVisibleChild';

const TestNav = ({ tabWidths, containerWidth, withOverflow = true }) => {
  const [indexOfLastVisibleChild, containerRef, , overflowRef] = useIndexOfLastVisibleChild();
  return (
    <nav ref={containerRef} data-testid="nav" data-width={containerWidth} data-index={indexOfLastVisibleChild}>
      {tabWidths.map((width, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <a key={index} href="#tab" data-width={width}>{`Tab ${index}`}</a>
      ))}
      {withOverflow && <div ref={overflowRef} data-width={60}>More...</div>}
    </nav>
  );
};

TestNav.propTypes = {
  tabWidths: PropTypes.arrayOf(PropTypes.number).isRequired,
  containerWidth: PropTypes.number.isRequired,
  withOverflow: PropTypes.bool,
};

describe('useIndexOfLastVisibleChild', () => {
  let notifySizeChange;
  const observe = jest.fn();
  const disconnect = jest.fn();

  beforeEach(() => {
    observe.mockClear();
    disconnect.mockClear();
    global.ResizeObserver.mockImplementation((callback) => {
      notifySizeChange = callback;
      return { observe, unobserve: jest.fn(), disconnect };
    });
    jest.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function boundingRect() {
      return { width: Number(this.dataset.width || 0) };
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const renderNav = (props) => {
    const result = render(<TestNav {...props} />);
    act(() => notifySizeChange());
    return result;
  };
  const lastVisibleIndex = () => Number(screen.getByTestId('nav').dataset.index);

  it('keeps the tabs that fit next to the overflow menu', () => {
    // 60 (More...) + 100 + 100 fits in 300, a third tab does not.
    renderNav({ tabWidths: [100, 100, 100, 100], containerWidth: 300 });

    expect(lastVisibleIndex()).toBe(1);
  });

  it('keeps every tab when all of them fit', () => {
    renderNav({ tabWidths: [100, 100, 100, 100], containerWidth: 1000 });

    expect(lastVisibleIndex()).toBe(3);
  });

  it('re-measures when the tabs get wider while the window keeps its size', () => {
    renderNav({ tabWidths: [100, 100, 100, 100], containerWidth: 500 });
    expect(lastVisibleIndex()).toBe(3);

    // A late web font makes every label wider; only the tabs report a new size.
    screen.getAllByRole('link').forEach((tab) => tab.setAttribute('data-width', '150'));
    act(() => notifySizeChange());

    expect(lastVisibleIndex()).toBe(1);
  });

  it('counts only the tabs when there is no overflow element', () => {
    renderNav({ tabWidths: [100, 100, 100], containerWidth: 250, withOverflow: false });

    expect(lastVisibleIndex()).toBe(1);
  });

  it('measures nothing while no container is attached', () => {
    const Unattached = () => {
      const [indexOfLastVisibleChild] = useIndexOfLastVisibleChild();
      return <span data-testid="index">{indexOfLastVisibleChild}</span>;
    };
    render(<Unattached />);

    expect(observe).not.toHaveBeenCalled();
    expect(screen.getByTestId('index')).toHaveTextContent('-1');
  });

  it('observes the container and each of its children, and stops on unmount', () => {
    const { unmount } = renderNav({ tabWidths: [100, 100], containerWidth: 500 });
    const nav = screen.getByTestId('nav');

    expect(observe).toHaveBeenCalledWith(nav);
    [...nav.children].forEach((child) => expect(observe).toHaveBeenCalledWith(child));

    unmount();
    expect(disconnect).toHaveBeenCalled();
  });
});
