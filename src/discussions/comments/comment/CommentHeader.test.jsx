import React from 'react';

import { render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';

import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';

import { initializeStore } from '../../../store';
import { DiscussionContext } from '../../common/context';
import CommentHeader from './CommentHeader';

let store;

function renderComponent(comment, postType, actionHandlers) {
  return render(
    <IntlProvider locale="en">
      <AppProvider store={store}>
        <DiscussionContext.Provider
          value={{ courseId: 'course-v1:edX+TestX+Test_Course' }}
        >
          <CommentHeader comment={comment} postType={postType} actionHandlers={actionHandlers} />
        </DiscussionContext.Provider>
      </AppProvider>
    </IntlProvider>,
  );
}

const mockComment = {
  author: 'abc123',
  authorLabel: 'ABC 123',
  endorsed: true,
  editableFields: ['endorsed'],
};

describe('Comment Header', () => {
  beforeEach(async () => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });
    store = initializeStore();
  });

  it('should render verified icon for endorsed discussion posts', () => {
    renderComponent(mockComment, 'discussion', {});
    expect(screen.queryAllByTestId('check-icon')).toHaveLength(1);
  });
  it('should render check icon for endorsed question posts', () => {
    renderComponent(mockComment, 'question', {});
    expect(screen.queryAllByTestId('check-icon')).toHaveLength(1);
  });
});
