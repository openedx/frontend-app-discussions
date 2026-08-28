import React from 'react';

import { render, screen } from '@testing-library/react';
import { useSelector } from 'react-redux';

import { initializeMockApp } from '@edx/frontend-platform';

import Reply from './Reply';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock('@edx/frontend-platform/i18n', () => ({
  useIntl: () => ({
    formatMessage: (msg) => ((msg && msg.defaultMessage) ? msg.defaultMessage : 'test-message'),
  }),
  defineMessages: (msgs) => msgs,
}));

jest.mock('../../../common', () => {
  // eslint-disable-next-line global-require
  const PropTypes = require('prop-types');

  const MockAutoSpamAlertBanner = ({ autoSpamFlagged }) => (
    <div data-testid="auto-spam-alert-banner" data-flagged={String(autoSpamFlagged)} />
  );
  MockAutoSpamAlertBanner.propTypes = { autoSpamFlagged: PropTypes.bool };
  MockAutoSpamAlertBanner.defaultProps = { autoSpamFlagged: false };

  return {
    ActionsDropdown: () => <div />,
    AlertBanner: () => <div />,
    AuthorLabel: () => <div />,
    AutoSpamAlertBanner: MockAutoSpamAlertBanner,
    Confirmation: () => <div />,
  };
});

jest.mock('./CommentEditor', () => function MockCommentEditor() { return <div />; });
jest.mock('../../../../components/HTMLLoader', () => function MockLoader() { return <div>Body Content</div>; });

const reply = {
  id: 'reply-1',
  abuseFlagged: false,
  author: 'learner',
  authorLabel: null,
  endorsed: false,
  lastEdit: null,
  closed: false,
  closedBy: null,
  users: {},
  closeReason: null,
  createdAt: '2026-01-01T00:00:00Z',
  threadId: 'thread-1',
  parentId: 'comment-1',
  rawBody: 'Body',
  renderedBody: '<p>Body</p>',
  editByLabel: null,
  closedByLabel: null,
};

describe('Reply', () => {
  beforeEach(() => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'learner',
        administrator: false,
        roles: ['Student'],
      },
    });
  });

  const mockSelectors = (replyData) => {
    // The component reads the reply, then the author's avatar.
    useSelector.mockReset();
    useSelector.mockReturnValueOnce(replyData).mockReturnValue({});
  };

  it('shows the automatic spam banner for a reply flagged by AI moderation', () => {
    mockSelectors({ ...reply, isSpam: true });

    render(<Reply responseId="reply-1" />);

    expect(screen.getByTestId('auto-spam-alert-banner')).toHaveAttribute('data-flagged', 'true');
  });

  it('shows no spam banner for a reply that was not flagged', () => {
    mockSelectors({ ...reply, isSpam: false });

    render(<Reply responseId="reply-1" />);

    expect(screen.queryByTestId('auto-spam-alert-banner')).not.toBeInTheDocument();
  });

  it('shows no spam banner when the API response omits the flag', () => {
    mockSelectors(reply);

    render(<Reply responseId="reply-1" />);

    expect(screen.queryByTestId('auto-spam-alert-banner')).not.toBeInTheDocument();
  });
});
