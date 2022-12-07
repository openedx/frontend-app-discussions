import React from 'react';

import { render, screen } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { IntlProvider } from 'react-intl';

import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider } from '@edx/frontend-platform/react';

import { initializeStore } from '../../store';
import { executeThunk } from '../../test-utils';
import { getCourseConfigApiUrl } from '../data/api';
import { fetchCourseConfig } from '../data/thunks';
import AuthorLabel from './AuthorLabel';
import { DiscussionContext } from './context';

const courseId = 'course-v1:edX+DemoX+Demo_Course';
const courseConfigApiUrl = getCourseConfigApiUrl();
let store;
let axiosMock;
let container;

function renderComponent(author, authorLabel, linkToProfile, labelColor) {
  const wrapper = render(
    <IntlProvider locale="en">
      <AppProvider store={store}>
        <DiscussionContext.Provider value={{ courseId }}>
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
      learners_tab_enabled: true,
      has_moderation_privileges: true,
    });
    axiosMock.onGet(`${courseConfigApiUrl}${courseId}/settings`).reply(200, {});
    await executeThunk(fetchCourseConfig(courseId), store.dispatch, store.getState);
  });

  describe.each([
    ['anonymous', null, false, ''],
    ['ta_user', 'Community TA', true, 'text-TA-color'],
    ['retired__user', null, false, ''],
    ['staff_user', 'Staff', true, 'text-staff-color'],
    ['learner_user', null, false, ''],
  ])('for %s', (
    author, authorLabel, linkToProfile, labelColor,
  ) => {
    it('it has author name text',
      async () => {
        renderComponent(author, authorLabel, linkToProfile, labelColor);
        const authorElement = container.querySelector('[role=heading]');
        const authorName = author.startsWith('retired__user') ? '[Deactivated]' : author;

        expect(authorElement).toHaveTextContent(authorName);
      });

    it(`it is "${!linkToProfile && 'not'}" clickable when linkToProfile is ${!!linkToProfile}`,
      async () => {
        renderComponent(author, authorLabel, linkToProfile, labelColor);

        if (linkToProfile) {
          expect(screen.queryByTestId('learner-posts-link')).toBeInTheDocument();
        } else {
          expect(screen.queryByTestId('learner-posts-link')).not.toBeInTheDocument();
        }
      });

    it(`it has "${!linkToProfile && 'not'}" label text and label color when linkToProfile is ${!!linkToProfile}`,
      async () => {
        renderComponent(author, authorLabel, linkToProfile, labelColor);
        const authorElement = container.querySelector('[role=heading]');
        const labelElement = authorElement.parentNode.lastChild;
        const label = ['TA', 'Staff'].includes(labelElement.textContent) && labelElement.textContent;

        if (linkToProfile) {
          expect(authorElement.parentNode).toHaveClass(labelColor);
          expect(authorElement.parentNode.lastChild).toHaveTextContent(label);
        } else {
          expect(authorElement.parentNode.lastChild).not.toHaveTextContent(label, { exact: true });
          expect(authorElement.parentNode).not.toHaveClass(labelColor, { exact: true });
        }
      });
  });
});
