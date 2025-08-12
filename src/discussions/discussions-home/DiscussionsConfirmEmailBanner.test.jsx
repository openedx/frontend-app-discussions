import {
  fireEvent, render, screen, waitFor,
} from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { act } from 'react-dom/test-utils';
import { IntlProvider } from 'react-intl';
import { Context as ResponsiveContext } from 'react-responsive';

import { getConfig, initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider } from '@edx/frontend-platform/react';

import { initializeStore } from '../../store';
import executeThunk from '../../test-utils';
import { getDiscussionsConfigUrl } from '../data/api';
import fetchCourseConfig from '../data/thunks';
import DiscussionsConfirmEmailBanner from './DiscussionsConfirmEmailBanner';
import messages from './messages';

const courseId = 'course-v1:edX+DemoX+Demo_Course';
let axiosMock;
let store;

function renderComponent() {
  render(
    <IntlProvider locale="en">
      <ResponsiveContext.Provider value={{ width: 1280 }}>
        <AppProvider store={store}>
          <DiscussionsConfirmEmailBanner />
        </AppProvider>
      </ResponsiveContext.Provider>
    </IntlProvider>,
  );
}

describe('DiscussionsConfirmEmailBanner', () => {
  beforeEach(async () => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    store = initializeStore();
  });

  describe('render', () => {
    it('does not show when email is verified', async () => {
      axiosMock.onGet(getDiscussionsConfigUrl(courseId)).reply(200, { isEmailVerified: true });
      await executeThunk(fetchCourseConfig(courseId), store.dispatch, store.getState);
      renderComponent();
      const banner = screen.queryByRole('alert');
      expect(banner).toBeNull();
    });

    describe('when email is unverified', () => {
      let resendEmailUrl;
      beforeEach(async () => {
        resendEmailUrl = `${getConfig().LMS_BASE_URL}/api/send_account_activation_email`;
        axiosMock.onGet(getDiscussionsConfigUrl(courseId)).reply(200, { isEmailVerified: false });
        axiosMock.onPost(resendEmailUrl).reply(200);
        await executeThunk(fetchCourseConfig(courseId), store.dispatch, store.getState);
        renderComponent();
      });

      it('shows banner and confirm now button', async () => {
        const banner = await screen.findByRole('alert');
        expect(banner.textContent).toContain('Remember to confirm');
        const confirmButton = await screen.findByRole('button', { name: messages.confirmNowButton.defaultMessage });
        expect(confirmButton).toBeInTheDocument();
      });

      it('opens modal, closes banner, and calls resend email API when confirm now button is clicked', async () => {
        const confirmButton = await screen.findByRole('button', { name: messages.confirmNowButton.defaultMessage });
        await act(async () => {
          fireEvent.click(confirmButton);
        });
        await waitFor(() => {
          const modal = screen.getByRole('dialog');
          expect(modal).toBeInTheDocument();
          const banner = screen.queryByRole('alert');
          expect(banner).not.toBeInTheDocument();
          expect(axiosMock.history.post.length).toBe(1);
          expect(axiosMock.history.post[0].url).toBe(resendEmailUrl);
        });
      });

      it('shows modal header, body, image, and confirm email button and closes modal and banner on click', async () => {
        const confirmButton = await screen.findByRole('button', { name: messages.confirmNowButton.defaultMessage });
        await act(async () => {
          fireEvent.click(confirmButton);
        });
        await waitFor(() => {
          const modalHeader = screen.getByText(messages.confirmEmailModalHeader.defaultMessage);
          expect(modalHeader).toBeInTheDocument();
          const modalBody = screen.getByText(messages.confirmEmailModalBody.defaultMessage);
          expect(modalBody).toBeInTheDocument();
          const confirmImage = screen.getByRole('img', { name: messages.confirmEmailImageAlt.defaultMessage });
          expect(confirmImage).toBeInTheDocument();
          const verifyButton = screen.getByRole('button', { name: messages.verifiedConfirmEmailButton.defaultMessage });
          expect(verifyButton).toBeInTheDocument();
          act(() => {
            fireEvent.click(verifyButton);
          });
        });
        await waitFor(() => {
          const modal = screen.queryByRole('dialog');
          expect(modal).not.toBeInTheDocument();
          const banner = screen.queryByRole('alert');
          expect(banner).not.toBeInTheDocument();
        });
      });
    });
  });
});
