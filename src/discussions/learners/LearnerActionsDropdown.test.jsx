import {
  fireEvent, render, screen, waitFor,
} from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { act } from 'react-dom/test-utils';
import { IntlProvider } from 'react-intl';
import { Factory } from 'rosie';

import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider } from '@edx/frontend-platform/react';

import { ContentActions } from '../../data/constants';
import { initializeStore } from '../../store';
import executeThunk from '../../test-utils';
import { getCourseConfigApiUrl } from '../data/api';
import fetchCourseConfig from '../data/thunks';
import LearnerActionsDropdown from './LearnerActionsDropdown';

let store;
let axiosMock;
const courseId = 'course-v1:edX+TestX+Test_Course';
const username = 'abc123';

const renderComponent = ({
  contentType = 'LEARNER',
  userHasBulkDeletePrivileges = false,
  actionHandlers = {},
} = {}) => {
  render(
    <IntlProvider locale="en">
      <AppProvider store={store}>
        <LearnerActionsDropdown
          contentType={contentType}
          userHasBulkDeletePrivileges={userHasBulkDeletePrivileges}
          actionHandlers={actionHandlers}
        />
      </AppProvider>
    </IntlProvider>,
  );
};

const findOpenActionsDropdownButton = async () => (
  screen.findByRole('button', { name: 'Actions menu' })
);

describe('LearnerActionsDropdown', () => {
  beforeEach(async () => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username,
        administrator: false,
        roles: [],
      },
    });
    store = initializeStore();
    Factory.resetAll();
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());

    axiosMock.onGet(`${getCourseConfigApiUrl()}${courseId}/`)
      .reply(200, { isPostingEnabled: true });

    await executeThunk(fetchCourseConfig(courseId), store.dispatch, store.getState);
  });

  it('can open dropdown if enabled', async () => {
    renderComponent({ userHasBulkDeletePrivileges: true });

    const openButton = await findOpenActionsDropdownButton();
    await act(async () => {
      fireEvent.click(openButton);
    });

    await waitFor(() => expect(screen.queryByTestId('learner-actions-dropdown-modal-popup')).toBeInTheDocument());
  });

  it('shows delete action for privileged users', async () => {
    const mockHandler = jest.fn();
    renderComponent({
      userHasBulkDeletePrivileges: true,
      actionHandlers: { deleteCoursePosts: mockHandler, deleteOrgPosts: mockHandler },
    });

    const openButton = await findOpenActionsDropdownButton();
    await act(async () => {
      fireEvent.click(openButton);
    });

    await waitFor(() => {
      const deleteCourseItem = screen.queryByTestId('delete-course-posts');
      const deleteOrgItem = screen.queryByTestId('delete-org-posts');
      expect(deleteCourseItem).toBeInTheDocument();
      expect(deleteOrgItem).toBeInTheDocument();
    });
  });

  it('triggers deleteCoursePosts handler when delete-course-posts is clicked', async () => {
    const mockDeleteCourseHandler = jest.fn();
    const mockDeleteOrgHandler = jest.fn();
    renderComponent({
      userHasBulkDeletePrivileges: true,
      actionHandlers: {
        [ContentActions.DELETE_COURSE_POSTS]: mockDeleteCourseHandler,
        [ContentActions.DELETE_ORG_POSTS]: mockDeleteOrgHandler,
      },
    });

    const openButton = await findOpenActionsDropdownButton();
    await act(async () => {
      fireEvent.click(openButton);
    });

    await waitFor(() => expect(screen.queryByTestId('learner-actions-dropdown-modal-popup')).toBeInTheDocument());

    const deleteCourseItem = await screen.findByTestId('delete-course-posts');
    await act(async () => {
      fireEvent.click(deleteCourseItem);
    });

    await waitFor(() => expect(screen.queryByTestId('learner-actions-dropdown-modal-popup')).not.toBeInTheDocument());
    expect(mockDeleteCourseHandler).toHaveBeenCalled();
    expect(mockDeleteOrgHandler).not.toHaveBeenCalled();
  });

  it('triggers deleteOrgPosts handler when delete-org-posts is clicked', async () => {
    const mockDeleteCourseHandler = jest.fn();
    const mockDeleteOrgHandler = jest.fn();
    renderComponent({
      userHasBulkDeletePrivileges: true,
      actionHandlers: {
        [ContentActions.DELETE_COURSE_POSTS]: mockDeleteCourseHandler,
        [ContentActions.DELETE_ORG_POSTS]: mockDeleteOrgHandler,
      },
    });

    const openButton = await findOpenActionsDropdownButton();
    await act(async () => {
      fireEvent.click(openButton);
    });

    await waitFor(() => expect(screen.queryByTestId('learner-actions-dropdown-modal-popup')).toBeInTheDocument());

    const deleteOrgItem = await screen.findByTestId('delete-org-posts');
    await act(async () => {
      fireEvent.click(deleteOrgItem);
    });

    await waitFor(() => expect(screen.queryByTestId('learner-actions-dropdown-modal-popup')).not.toBeInTheDocument());
    expect(mockDeleteOrgHandler).toHaveBeenCalled();
    expect(mockDeleteCourseHandler).not.toHaveBeenCalled();
  });
});
