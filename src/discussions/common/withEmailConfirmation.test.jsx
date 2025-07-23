import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from 'react-intl';
import { Context as ResponsiveContext } from 'react-responsive';
import { MemoryRouter } from 'react-router';

import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';

import { initializeStore } from '../../store';
import EmptyPosts from '../empty-posts/EmptyPosts';
import messages from '../messages';
import { sendEmailForAccountActivation } from '../posts/data/api';

let store;
const courseId = 'course-v1:edX+DemoX+Demo_Course';

jest.mock('../posts/data/api', () => ({
  sendEmailForAccountActivation: jest.fn(),
}));

function renderComponent(location = `/${courseId}/`) {
  return render(
    <IntlProvider locale="en">
      <ResponsiveContext.Provider value={{ width: 1280 }}>
        <AppProvider store={store} wrapWithRouter={false}>
          <MemoryRouter initialEntries={[location]}>
            <EmptyPosts subTitleMessage={messages.emptyMyPosts} />
          </MemoryRouter>
        </AppProvider>
      </ResponsiveContext.Provider>
    </IntlProvider>,
  );
}

describe('EmptyPage', () => {
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

  it('should open the confirmation link dialogue box.', async () => {
    renderComponent(`/${courseId}/my-posts/`);

    const addPostButton = screen.getByRole('button', { name: 'Add a post' });
    await userEvent.click(addPostButton);

    expect(screen.queryByText('Send confirmation link')).toBeInTheDocument();
  });

  it('dispatches sendAccountActivationEmail on confirm', async () => {
    sendEmailForAccountActivation.mockResolvedValue({ success: true });
    renderComponent(`/${courseId}/my-posts/`);

    const addPostButton = screen.getByRole('button', { name: 'Add a post' });
    await userEvent.click(addPostButton);
    const confirmButton = screen.getByText('Send confirmation link');
    fireEvent.click(confirmButton);
    expect(sendEmailForAccountActivation).toHaveBeenCalled();
  });

  it('should close the confirmation dialogue box.', async () => {
    renderComponent(`/${courseId}/my-posts/`);

    const addPostButton = screen.getByRole('button', { name: 'Add a post' });
    await userEvent.click(addPostButton);
    const confirmButton = screen.getByText('Close');
    fireEvent.click(confirmButton);

    expect(sendEmailForAccountActivation).toHaveBeenCalled();

    expect(screen.queryByText('Close')).not.toBeInTheDocument();
  });
});
