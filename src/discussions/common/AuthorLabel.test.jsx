import React from 'react';

import { render, screen } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { IntlProvider } from 'react-intl';

import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider } from '@edx/frontend-platform/react';

import { initializeStore } from '../../store';
import executeThunk from '../../test-utils';
import { getCourseConfigApiUrl } from '../data/api';
import fetchCourseConfig from '../data/thunks';
import AuthorLabel from './AuthorLabel';
import DiscussionContext from './context';

const courseId = 'course-v1:edX+DemoX+Demo_Course';
const courseConfigApiUrl = getCourseConfigApiUrl();
let store;
let axiosMock;
let container;

function renderComponent(author, authorLabel, linkToProfile, labelColor, enableInContextSidebar) {
  const wrapper = render(
    <IntlProvider locale="en">
      <AppProvider store={store}>
        <DiscussionContext.Provider value={{ courseId, enableInContextSidebar }}>
          <AuthorLabel
            author={author}
            authorLabel={authorLabel}
            linkToProfile={linkToProfile}
            labelColor={labelColor}
          />
        </DiscussionContext.Provider>
      </AppProvider>
    </IntlProvider>,
  );
  container = wrapper.container;
  return container;
}

describe('Author label', () => {
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
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    axiosMock.onGet(`${courseConfigApiUrl}${courseId}/`).reply(200, {
      has_moderation_privileges: true,
    });
    axiosMock.onGet(`${courseConfigApiUrl}${courseId}/settings`).reply(200, {});
    await executeThunk(fetchCourseConfig(courseId), store.dispatch, store.getState);
  });

  describe.each([
    ['anonymous', null, false, ''],
    ['ta_user', 'Community TA', true, 'text-TA-color'],
    ['moderator_user', 'Moderator', true, 'text-TA-color'],
    ['retired__user', null, false, ''],
    ['staff_user', 'Global Staff', true, 'text-staff-color'],
    ['learner_user', null, false, ''],
  ])('for %s', (author, authorLabel, linkToProfile, labelColor) => {
    it(
      'it has author name text',
      async () => {
        renderComponent(author, authorLabel, linkToProfile, labelColor);
        const authorElement = container.querySelector('[role=heading]');
        const authorName = author.startsWith('retired__user') ? '[Deactivated]' : author;

        expect(authorElement).toHaveTextContent(authorName);
      },
    );

    it(
      `it is "${(!linkToProfile) && 'not'}" clickable when linkToProfile is ${!!linkToProfile} and enableInContextSidebar is false`,
      async () => {
        renderComponent(author, authorLabel, linkToProfile, labelColor, false);

        if (linkToProfile) {
          expect(screen.queryByTestId('learner-posts-link')).toBeInTheDocument();
        } else {
          expect(screen.queryByTestId('learner-posts-link')).not.toBeInTheDocument();
        }
      },
    );

    it(
      'it is not clickable when enableInContextSidebar is true',
      async () => {
        renderComponent(author, authorLabel, linkToProfile, labelColor, true);

        expect(screen.queryByTestId('learner-posts-link')).not.toBeInTheDocument();
      },
    );

    it(
      `it has "${!linkToProfile && 'not'}" label text and label color when linkToProfile is ${!!linkToProfile}`,
      async () => {
        renderComponent(author, authorLabel, linkToProfile, labelColor);
        const authorElement = container.querySelector('[role=heading]');
        const labelParentNode = authorElement.parentNode.parentNode;
        const labelElement = labelParentNode.lastChild.lastChild;
        const label = ['CTA', 'TA', 'Staff'].includes(labelElement.textContent) && labelElement.textContent;
        const roleLabelByAuthorLabel = {
          'Community TA': 'Community TA',
          Moderator: 'Discussion Moderator',
          Staff: 'Global Staff',
        };
        const expectedRoleLabel = roleLabelByAuthorLabel[authorLabel];

        if (linkToProfile) {
          expect(labelParentNode).toHaveClass(labelColor);
          expect(labelElement).toHaveTextContent(label);
        } else {
          expect(authorElement.parentNode.lastChild).not.toHaveTextContent(label, { exact: true });
          expect(authorElement.parentNode).not.toHaveClass(labelColor, { exact: true });
          expect(screen.queryByText('Community TA')).not.toBeInTheDocument();
          expect(screen.queryByText('TA')).not.toBeInTheDocument();
          expect(screen.queryByText('Staff')).not.toBeInTheDocument();
        }
      },
    );
  });

  describe('Learner status messages', () => {
    describe('with new learner_status API field', () => {
      it('should display new learner message when backend provides learner_status="new"', () => {
        const postData = { learner_status: 'new' };
        renderComponent('testuser', null, false, '', false, postData, true);
        expect(screen.getByText('👋 Hi, I am a new learner')).toBeInTheDocument();
      });

      it('should not display new learner message when backend provides learner_status="regular"', () => {
        const postData = { learner_status: 'regular' };
        renderComponent('testuser', null, false, '', false, postData, true);
        expect(screen.queryByText('👋 Hi, I am a new learner')).not.toBeInTheDocument();
      });

      it('should not display new learner message when backend provides learner_status="staff"', () => {
        const postData = { learner_status: 'staff' };
        renderComponent('testuser', null, false, '', false, postData, true);
        expect(screen.queryByText('👋 Hi, I am a new learner')).not.toBeInTheDocument();
      });

      it('should not display new learner message when backend provides learner_status="anonymous"', () => {
        const postData = { learner_status: 'anonymous' };
        renderComponent('testuser', null, false, '', false, postData, true);
        expect(screen.queryByText('👋 Hi, I am a new learner')).not.toBeInTheDocument();
      });

      it('should not display new learner message for staff users even if backend says learner_status="new"', () => {
        const postData = { learner_status: 'new' };
        renderComponent('testuser', 'Staff', false, '', false, postData, true);
        expect(screen.queryByText('👋 Hi, I am a new learner')).not.toBeInTheDocument();
      });
    });

    describe('with legacy boolean API fields (backward compatibility)', () => {
      it('should display new learner message when backend provides is_new_learner=true', () => {
        const postData = { is_new_learner: true, is_regular_learner: false };
        renderComponent('testuser', null, false, '', false, postData, true);
        expect(screen.getByText('👋 Hi, I am a new learner')).toBeInTheDocument();
      });

      it('should not display new learner message when backend provides is_new_learner=false', () => {
        const postData = { is_new_learner: false, is_regular_learner: false };
        renderComponent('testuser', null, false, '', false, postData, true);
        expect(screen.queryByText('👋 Hi, I am a new learner')).not.toBeInTheDocument();
      });

      it('should not display new learner message for staff users even if backend says new learner', () => {
        const postData = { is_new_learner: true, is_regular_learner: false };
        renderComponent('testuser', 'Staff', false, '', false, postData, true);
        expect(screen.queryByText('👋 Hi, I am a new learner')).not.toBeInTheDocument();
      });

      it('should not display new learner message for moderators', () => {
        const postData = { is_new_learner: true, is_regular_learner: false };
        renderComponent('testuser', 'Moderator', false, '', false, postData, true);
        expect(screen.queryByText('👋 Hi, I am a new learner')).not.toBeInTheDocument();
      });

      it('should not display new learner message for Community TAs', () => {
        const postData = { is_new_learner: true, is_regular_learner: false };
        renderComponent('testuser', 'Community TA', false, '', false, postData, true);
        expect(screen.queryByText('👋 Hi, I am a new learner')).not.toBeInTheDocument();
      });

      it('should not display new learner message for anonymous users', () => {
        const postData = { is_new_learner: true, is_regular_learner: false };
        renderComponent('anonymous', null, false, '', false, postData, true);
        expect(screen.queryByText('👋 Hi, I am a new learner')).not.toBeInTheDocument();
      });

      it('should not display new learner message for retired users', () => {
        const postData = { is_new_learner: true, is_regular_learner: false };
        renderComponent('retired__user_123', null, false, '', false, postData, true);
        expect(screen.queryByText('👋 Hi, I am a new learner')).not.toBeInTheDocument();
      });

      it('should prioritize new learner_status field over legacy boolean fields', () => {
        // If both are present, learner_status should take precedence
        const postData = { learner_status: 'regular', is_new_learner: true };
        renderComponent('testuser', null, false, '', false, postData, true);
        expect(screen.queryByText('👋 Hi, I am a new learner')).not.toBeInTheDocument();
      });
    });

    describe('general cases', () => {
      it('should not display new learner message when postData is not provided', () => {
        renderComponent('testuser', null, false, '', false, null, true);
        expect(screen.queryByText('👋 Hi, I am a new learner')).not.toBeInTheDocument();
      });

      it('should not display new learner message when postData is empty object', () => {
        renderComponent('testuser', null, false, '', false, {}, true);
        expect(screen.queryByText('👋 Hi, I am a new learner')).not.toBeInTheDocument();
      });
    });

    describe('sidebar behavior', () => {
      it('should not display learner messages in sidebar (postOrComment=false)', () => {
        const postData = { learner_status: 'new' };
        renderComponent('testuser', null, false, '', false, postData, false);
        expect(screen.queryByText('👋 Hi, I am a new learner')).not.toBeInTheDocument();
      });

      it('should not display regular learner message in sidebar', () => {
        const postData = { learner_status: 'regular' };
        renderComponent('testuser', null, false, '', false, postData, false);
        expect(screen.queryByText('Learner')).not.toBeInTheDocument();
        expect(screen.queryByText('👋 Hi, I am a new learner')).not.toBeInTheDocument();
      });

      it('should display learner messages in post view (postOrComment=true)', () => {
        const postData = { learner_status: 'new' };
        renderComponent('testuser', null, false, '', false, postData, true);
        expect(screen.getByText('👋 Hi, I am a new learner')).toBeInTheDocument();
      });
    });
  });

  describe('Single-line ordering', () => {
    it('renders role before age when roleBeforeTimestamp is true', () => {
      render(
        <IntlProvider locale="en">
          <AppProvider store={store}>
            <DiscussionContext.Provider value={{ courseId, enableInContextSidebar: false }}>
              <AuthorLabel
                author="staff_user"
                authorLabel="Staff"
                postCreatedAt="2026-03-06T00:00:00.000Z"
                singleLine
                roleBeforeTimestamp
                alert
              />
            </DiscussionContext.Provider>
          </AppProvider>
        </IntlProvider>,
      );

      const roleLabel = screen.getByText('Global Staff');
      const timestamp = document.querySelector('.post-summary-timestamp');

      expect(timestamp).toBeInTheDocument();
      expect(roleLabel.compareDocumentPosition(timestamp)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    });
  });

  describe('Null author handling', () => {
    it('should display "[Deleted User]" when author is null', () => {
      renderComponent(null, null, false, '');
      const authorElement = container.querySelector('[role=heading]');
      expect(authorElement).toHaveTextContent('[Deleted User]');
    });

    it('should use text-gray-700 styling when author is null', () => {
      renderComponent(null, null, false, '');
      const authorElement = container.querySelector('[role=heading]');
      expect(authorElement).toHaveClass('text-gray-700');
    });

    it('should not generate a link when author is null even with linkToProfile=true', () => {
      renderComponent(null, null, true, '');
      expect(screen.queryByTestId('learner-posts-link')).not.toBeInTheDocument();
    });

    it('should handle null author with staff label correctly', () => {
      renderComponent(null, 'Staff', false, 'text-staff-color');
      const authorElement = container.querySelector('[role=heading]');
      expect(authorElement).toHaveTextContent('[Deleted User]');
      // Should still show the staff label even though author is null
      expect(container).toHaveTextContent('Global Staff');
    });

    it('should not display learner messages when author is null', () => {
      const postData = { learner_status: 'new' };
      renderComponent(null, null, false, '', false, postData, true);
      expect(screen.queryByText('👋 Hi, I am a new learner')).not.toBeInTheDocument();
    });
  });
});
