import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';
import { useSelector } from 'react-redux';

import Post from './Post';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({ pathname: '/test' }),
  useNavigate: () => jest.fn(),
}));

jest.mock('@edx/frontend-platform/i18n', () => ({
  useIntl: () => ({
    formatMessage: (msg) => ((msg && msg.defaultMessage) ? msg.defaultMessage : 'test-message'),
  }),
  defineMessages: (msgs) => msgs,
}));

jest.mock('@openedx/paragon', () => {
  const actual = jest.requireActual('@openedx/paragon');
  // eslint-disable-next-line global-require
  const PropTypes = require('prop-types');

  const MockHyperlink = ({ children }) => <div>{children}</div>;
  MockHyperlink.propTypes = { children: PropTypes.node.isRequired };

  return {
    ...actual,
    Hyperlink: MockHyperlink,
    useToggle: actual.useToggle,
  };
});

jest.mock('../../common', () => {
  // eslint-disable-next-line global-require
  const PropTypes = require('prop-types');

  const MockConfirmation = ({ confirmButtonVariant, isOpen }) => {
    if (!isOpen) { return null; }
    return (
      <div data-testid="mock-confirmation" data-variant={confirmButtonVariant}>
        Mock Confirmation
      </div>
    );
  };

  MockConfirmation.propTypes = {
    confirmButtonVariant: PropTypes.string,
    isOpen: PropTypes.bool.isRequired,
  };

  // eslint-disable-next-line react/prop-types
  const MockAlertBanner = () => <div />;

  return {
    Confirmation: MockConfirmation,
    AlertBanner: MockAlertBanner,
  };
});

jest.mock('./PostHeader', () => function MockPostHeader() { return <div>PostHeader</div>; });
jest.mock('./PostFooter', () => function MockPostFooter() { return <div>PostFooter</div>; });
jest.mock('./ClosePostReasonModal', () => function MockCloseModal() { return <div />; });
jest.mock('../../../components/HTMLLoader', () => function MockLoader() { return <div>Body Content</div>; });

jest.mock('../../common/HoverCard', () => {
  // eslint-disable-next-line global-require
  const { ContentActions } = require('../../../data/constants');
  // eslint-disable-next-line global-require
  const PropTypes = require('prop-types');

  const MockHoverCard = ({ actionHandlers }) => (
    <div>
      <button
        type="button"
        data-testid="trigger-delete"
        onClick={() => actionHandlers[ContentActions.DELETE] && actionHandlers[ContentActions.DELETE]()}
      >
        Delete Post
      </button>
      <button
        type="button"
        data-testid="trigger-report"
        onClick={() => actionHandlers[ContentActions.REPORT] && actionHandlers[ContentActions.REPORT]()}
      >
        Report Post
      </button>
    </div>
  );

  MockHoverCard.propTypes = {
    actionHandlers: PropTypes.shape({}).isRequired,
  };

  return MockHoverCard;
});

describe('Post Component - Delete/Report Confirmation', () => {
  const mockPostId = '123';

  beforeEach(() => {
    useSelector.mockReturnValue({
      topicId: 'topic-1',
      abuseFlagged: false,
      closed: false,
      pinned: false,
      voted: false,
      following: false,
      author: {},
      title: 'Test Post',
      renderedBody: '<div>Hello</div>',
      users: {},
    });
  });

  const renderPost = () => {
    // eslint-disable-next-line global-require
    const DiscussionContext = require('../../common/context').default;

    return render(
      <DiscussionContext.Provider value={{ postId: mockPostId, enableInContextSidebar: false, courseId: 'course-1' }}>
        <Post
          handleAddResponseButton={jest.fn()}
          openRestrictionDialogue={jest.fn()}
        />
      </DiscussionContext.Provider>,
    );
  };

  it('passes "danger" variant to Confirmation modal when deleting a post', () => {
    renderPost();

    const deleteBtn = screen.getByTestId('trigger-delete');
    fireEvent.click(deleteBtn);

    const confirmation = screen.getByTestId('mock-confirmation');
    expect(confirmation).toHaveAttribute('data-variant', 'danger');
  });

  it('does NOT pass "danger" variant to Confirmation modal when reporting a post', () => {
    renderPost();

    const reportBtn = screen.getByTestId('trigger-report');
    fireEvent.click(reportBtn);

    const confirmation = screen.getByTestId('mock-confirmation');
    expect(confirmation).not.toHaveAttribute('data-variant', 'danger');
  });
});
