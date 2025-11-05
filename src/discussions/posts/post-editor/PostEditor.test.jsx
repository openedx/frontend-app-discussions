import React from 'react';

import {
  fireEvent, render, screen, waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MockAdapter from 'axios-mock-adapter';
import { act } from 'react-dom/test-utils';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { IntlProvider } from 'react-intl';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Factory } from 'rosie';

import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider } from '@edx/frontend-platform/react';

import { getCourseMetadataApiUrl } from '../../../components/NavigationBar/data/api';
import fetchTab from '../../../components/NavigationBar/data/thunks';
import { getApiBaseUrl, Routes as ROUTES } from '../../../data/constants';
import { initializeStore } from '../../../store';
import executeThunk from '../../../test-utils';
import { getCohortsApiUrl } from '../../cohorts/data/api';
import DiscussionContext from '../../common/context';
import { getCourseConfigApiUrl } from '../../data/api';
import fetchCourseConfig from '../../data/thunks';
import fetchCourseTopics from '../../topics/data/thunks';
import { getThreadsApiUrl } from '../data/api';
import * as selectors from '../data/selectors';
import { fetchThread } from '../data/thunks';
import PostEditor from './PostEditor';

import '../../cohorts/data/__factories__';
import '../../data/__factories__';
import '../../topics/data/__factories__';
import '../data/__factories__';
import '../../../components/NavigationBar/data/__factories__';

const courseId = 'course-v1:edX+DemoX+Demo_Course';
const topicsApiUrl = `${getApiBaseUrl()}/api/discussion/v1/course_topics/${courseId}`;
const courseConfigApiUrl = getCourseConfigApiUrl();
const threadsApiUrl = getThreadsApiUrl();
let store;
let axiosMock;
let container;

jest.mock('react-google-recaptcha-v3', () => ({
  useGoogleReCaptcha: jest.fn(),
  // eslint-disable-next-line react/prop-types
  GoogleReCaptchaProvider: ({ children }) => <div>{children}</div>,
}));

async function renderComponent(editExisting = false, location = `/${courseId}/posts/`) {
  const paths = editExisting ? ROUTES.POSTS.EDIT_POST : [ROUTES.POSTS.NEW_POST];
  const wrapper = await render(
    <IntlProvider locale="en">
      <AppProvider store={store} wrapWithRouter={false}>
        <DiscussionContext.Provider
          value={{ courseId, category: null }}
        >
          <MemoryRouter initialEntries={[location]}>
            <Routes>
              {paths.map((path) => (
                <Route key={path} path={path} element={<PostEditor editExisting={editExisting} />} />
              ))}
            </Routes>
          </MemoryRouter>
        </DiscussionContext.Provider>
      </AppProvider>
    </IntlProvider>,
  );
  container = wrapper.container;
}

describe('PostEditor submit Form', () => {
  beforeEach(async () => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });

    Factory.resetAll();
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    const cwtopics = Factory.buildList('category', 2);
    Factory.reset('topic');
    axiosMock.onGet(topicsApiUrl).reply(200, {
      courseware_topics: cwtopics,
      non_courseware_topics: Factory.buildList('topic', 3, {}, { topicPrefix: 'ncw-' }),
    });
    axiosMock.onGet(`${getCourseMetadataApiUrl(courseId)}`).reply(200, (Factory.build('navigationBar', 1, { isEnrolled: true })));

    store = initializeStore({
      config: {
        provider: 'legacy',
        allowAnonymous: true,
        allowAnonymousToPeers: true,
        hasModerationPrivileges: false,
        settings: {
          dividedInlineDiscussions: ['category-1-topic-2'],
          dividedCourseWideDiscussions: ['ncw-topic-2'],
        },
        captchaSettings: {
          enabled: true,
          siteKey: 'test-key',
        },
      },
    });
    await executeThunk(fetchTab(courseId, 'outline'), store.dispatch, store.getState);
    await executeThunk(fetchCourseTopics(courseId), store.dispatch, store.getState);
    axiosMock.onGet(getCohortsApiUrl(courseId)).reply(200, Factory.buildList('cohort', 3));
  });

  test('successfully submits a new post with CAPTCHA', async () => {
    const mockExecuteRecaptcha = jest.fn(() => Promise.resolve('mock-token'));
    useGoogleReCaptcha.mockReturnValue({ executeRecaptcha: mockExecuteRecaptcha });
    const newThread = Factory.build('thread', { id: 'new-thread-1' });
    axiosMock.onPost(threadsApiUrl).reply(200, newThread);

    await renderComponent();

    await act(async () => {
      fireEvent.change(screen.getByTestId('topic-select'), {
        target: { value: 'ncw-topic-1' },
      });
      const postTitle = await screen.findByTestId('post-title-input');
      const tinymceEditor = await screen.findByTestId('tinymce-editor');

      fireEvent.change(postTitle, { target: { value: 'Test Post Title' } });
      fireEvent.change(tinymceEditor, { target: { value: 'Test Post Content' } });
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    });

    await waitFor(() => {
      expect(axiosMock.history.post).toHaveLength(1);
      expect(JSON.parse(axiosMock.history.post[0].data)).toMatchObject({
        course_id: 'course-v1:edX+DemoX+Demo_Course',
        topic_id: 'ncw-topic-1',
        type: 'discussion',
        title: 'Test Post Title',
        raw_body: 'Test Post Content',
        following: true,
        anonymous: false,
        anonymous_to_peers: false,
        enable_in_context_sidebar: false,
        notify_all_learners: false,
        captcha_token: 'mock-token',
      });
    });
  });

  test('successfully updated a post', async () => {
    const mockThread = {
      courseId: 'course-v1:edX+DemoX+Demo_Course',
      topicId: 'ncw-topic-1',
      type: 'discussion',
      title: 'Test Post Title',
      rawBody: 'Test Post Content',
      following: true,
      anonymous: false,
      anonymousToPeers: false,
      enableInContextSidebar: false,
      notifyAllLearners: false,
      captchaToken: 'mock-token',
    };
    jest
      .spyOn(selectors, 'selectThread')
      .mockImplementation(() => jest.fn(() => mockThread));

    const newThread = Factory.build('thread', { id: 'new-thread-1' });
    axiosMock.onPatch(threadsApiUrl).reply(200, newThread);

    await renderComponent(true, `/${courseId}/posts/post1/edit`);

    await act(async () => {
      fireEvent.change(screen.getByTestId('topic-select'), {
        target: { value: 'ncw-topic-1' },
      });
      const postTitle = await screen.findByTestId('post-title-input');
      const tinymceEditor = await screen.findByTestId('tinymce-editor');

      fireEvent.change(postTitle, { target: { value: 'Test Post Title' } });
      fireEvent.change(tinymceEditor, { target: { value: 'Test Post Content' } });
    });

    await act(async () => {
      fireEvent.click(container.querySelector('[data-testid="show-preview-button"]'));
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    });

    await act(async () => {
      expect(axiosMock.history.patch).toHaveLength(1);
    });
  });

  test('successfully show captcha error if executeRecaptcha returns null token', async () => {
    const mockExecuteRecaptcha = jest.fn().mockResolvedValue(null);
    useGoogleReCaptcha.mockReturnValue({ executeRecaptcha: mockExecuteRecaptcha });
    const newThread = Factory.build('thread', { id: 'new-thread-1' });
    axiosMock.onPost(threadsApiUrl).reply(200, newThread);

    await renderComponent();

    await act(async () => {
      fireEvent.change(screen.getByTestId('topic-select'), {
        target: { value: 'ncw-topic-1' },
      });
      const postTitle = await screen.findByTestId('post-title-input');
      const tinymceEditor = await screen.findByTestId('tinymce-editor');

      fireEvent.change(postTitle, { target: { value: 'Test Post Title' } });
      fireEvent.change(tinymceEditor, { target: { value: 'Test Post Content' } });
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    });

    expect(screen.getByText('CAPTCHA verification failed.')).toBeInTheDocument();
  });

  test('successfully show captcha error if executeRecaptcha throws', async () => {
    const mockExecuteRecaptcha = jest.fn().mockRejectedValue(new Error('recaptcha failed'));
    useGoogleReCaptcha.mockReturnValue({ executeRecaptcha: mockExecuteRecaptcha });
    const newThread = Factory.build('thread', { id: 'new-thread-1' });
    axiosMock.onPost(threadsApiUrl).reply(200, newThread);

    await renderComponent();

    await act(async () => {
      fireEvent.change(screen.getByTestId('topic-select'), {
        target: { value: 'ncw-topic-1' },
      });
      const postTitle = await screen.findByTestId('post-title-input');
      const tinymceEditor = await screen.findByTestId('tinymce-editor');

      fireEvent.change(postTitle, { target: { value: 'Test Post Title' } });
      fireEvent.change(tinymceEditor, { target: { value: 'Test Post Content' } });
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    });

    expect(screen.getByText('CAPTCHA verification failed.')).toBeInTheDocument();
  });
});

describe('PostEditor', () => {
  beforeEach(async () => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });

    Factory.resetAll();
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    const cwtopics = Factory.buildList('category', 2);
    Factory.reset('topic');
    axiosMock.onGet(topicsApiUrl).reply(200, {
      courseware_topics: cwtopics,
      non_courseware_topics: Factory.buildList('topic', 3, {}, { topicPrefix: 'ncw-' }),
    });
  });

  describe.each([
    {
      allowAnonymous: false,
      allowAnonymousToPeers: false,
    },
    {
      allowAnonymous: false,
      allowAnonymousToPeers: true,
    },
    {
      allowAnonymous: true,
      allowAnonymousToPeers: false,
    },
    {
      allowAnonymous: true,
      allowAnonymousToPeers: true,
    },
  ])('anonymous posting', ({
    allowAnonymous,
    allowAnonymousToPeers,
  }) => {
    beforeEach(async () => {
      store = initializeStore({
        config: {
          provider: 'legacy',
          allowAnonymous,
          allowAnonymousToPeers,
          moderationSettings: {},
          captchaSettings: {
            enabled: false,
            siteKey: '',
          },
        },
      });
      await executeThunk(fetchCourseTopics(courseId), store.dispatch, store.getState);
      await executeThunk(fetchTab(courseId, 'outline'), store.dispatch, store.getState);
    });

    test(`new post when anonymous posts are ${allowAnonymous ? '' : 'not'} allowed and anonymous posts to peers are ${
      allowAnonymousToPeers ? '' : 'not'} allowed`, async () => {
      await renderComponent();

      expect(screen.queryAllByRole('radio')).toHaveLength(2);
      // 2 categories with 4 subcategories each
      expect(screen.queryAllByText(/category-\d-topic \d/)).toHaveLength(8);
      // 3 non courseware topics
      expect(screen.queryAllByText(/ncw-topic \d/)).toHaveLength(3);
      expect(screen.queryByText('cohort', { exact: false })).not.toBeInTheDocument();
      expect(screen.queryByText('Post anonymously')).not.toBeInTheDocument();

      if (allowAnonymousToPeers) {
        expect(screen.queryByText('Post anonymously to peers')).toBeInTheDocument();
      } else {
        expect(screen.queryByText('Post anonymously to peers')).not.toBeInTheDocument();
      }
    });

    test('selectThread is not called while creating a new post', async () => {
      const mockSelectThread = jest.fn();
      jest.mock('../data/selectors', () => ({
        selectThread: mockSelectThread,
      }));
      await renderComponent();

      expect(mockSelectThread).not.toHaveBeenCalled();
    });
  });

  describe.each([
    {
      isNotifyAllLearnersEnabled: true,
      description: 'when "Notify All Learners" is enabled',
    },
    {
      isNotifyAllLearnersEnabled: false,
      description: 'when "Notify All Learners" is disabled',
    },
  ])('$description', ({ isNotifyAllLearnersEnabled }) => {
    beforeEach(async () => {
      store = initializeStore({
        config: {
          provider: 'legacy',
          is_notify_all_learners_enabled: isNotifyAllLearnersEnabled,
          moderationSettings: {},
          captchaSettings: {
            enabled: false,
            siteKey: '',
          },
        },
      });

      axiosMock
        .onGet(`${courseConfigApiUrl}${courseId}/`)
        .reply(200, { is_notify_all_learners_enabled: isNotifyAllLearnersEnabled });

      await store.dispatch(fetchCourseConfig(courseId));
      renderComponent();
    });

    test(`should ${isNotifyAllLearnersEnabled ? 'show' : 'not show'} the "Notify All Learners" option`, async () => {
      if (isNotifyAllLearnersEnabled) {
        await waitFor(() => expect(screen.queryByText('Notify All Learners')).toBeInTheDocument());
      } else {
        await waitFor(() => expect(screen.queryByText('Notify All Learners')).not.toBeInTheDocument());
      }
    });
  });

  describe('cohorting', () => {
    const dividedncw = ['ncw-topic-2'];
    const dividedcw = ['category-1-topic-2', 'category-2-topic-1', 'category-2-topic-2'];

    beforeEach(async () => {
      axiosMock.onGet(`${getCourseMetadataApiUrl(courseId)}`).reply(200, (Factory.build('navigationBar', 1, { isEnrolled: true })));
      axiosMock.onGet(getCohortsApiUrl(courseId)).reply(200, Factory.buildList('cohort', 3));
    });

    async function setupData(config = {}, settings = {}) {
      store = initializeStore({
        config: {
          provider: 'legacy',
          userRoles: ['Student', 'Moderator'],
          hasModerationPrivileges: true,
          settings: {
            dividedInlineDiscussions: dividedcw,
            dividedCourseWideDiscussions: dividedncw,
            ...settings,
          },
          captchaSettings: {
            enabled: false,
            siteKey: '',
          },
          ...config,
        },
      });
      await executeThunk(fetchCourseTopics(courseId), store.dispatch, store.getState);
      await executeThunk(fetchTab(courseId, 'outline'), store.dispatch, store.getState);
    }

    test('test privileged user', async () => {
      await setupData();
      await renderComponent();
      // Initially the user can't select a cohort
      expect(screen.queryByRole('combobox', { name: /cohort visibility/i })).not.toBeInTheDocument();
      // If a cohorted topic is selected, the cohort visibility selector is displayed
      ['ncw-topic 2', 'category-1-topic 2', 'category-2-topic 1', 'category-2-topic 2'].forEach(async (topicName) => {
        act(() => {
          userEvent.selectOptions(
            screen.getByRole('combobox', { name: /topic area/i }),
            screen.getByRole('option', { name: topicName }),
          );
        });

        expect(screen.queryByRole('combobox', { name: /cohort visibility/i })).toBeInTheDocument();
      });
      // Now if a non-cohorted topic is selected, the cohort visibility selector is hidden
      ['ncw-topic 1', 'category-1-topic 1', 'category-2-topic 4'].forEach(async (topicName) => {
        act(() => {
          userEvent.selectOptions(
            screen.getByRole('combobox', { name: /topic area/i }),
            screen.getByRole('option', { name: topicName }),
          );
        });
        expect(screen.queryByRole('combobox', { name: /cohort visibility/i })).not.toBeInTheDocument();
      });
    });

    test('test always divided inline', async () => {
      await setupData({}, { alwaysDivideInlineDiscussions: true });
      await renderComponent();
      // Initially the user can't select a cohort
      expect(screen.queryByRole('combobox', { name: /cohort visibility/i })).not.toBeInTheDocument();
      // All courseware topics are divided
      [1, 2].forEach(catId => {
        [1, 2, 3, 4].forEach((topicId) => {
          act(() => {
            userEvent.selectOptions(
              screen.getByRole('combobox', { name: /topic area/i }),
              screen.getByRole('option', { name: `category-${catId}-topic ${topicId}` }),
            );
          });

          expect(screen.queryByRole('combobox', { name: /cohort visibility/i })).toBeInTheDocument();
        });
      });

      // Non-courseware topics can still have cohort visibility hidden
      ['ncw-topic 1', 'ncw-topic 3'].forEach((topicName) => {
        act(() => {
          userEvent.selectOptions(
            screen.getByRole('combobox', { name: /topic area/i }),
            screen.getByRole('option', { name: topicName }),
          );
        });
        expect(screen.queryByRole('combobox', { name: /cohort visibility/i })).not.toBeInTheDocument();
      });
    });

    test('test unprivileged user', async () => {
      await setupData({ hasModerationPrivileges: false });
      await renderComponent();

      ['ncw-topic 1', 'ncw-topic 2', 'category-1-topic 1', 'category-2-topic 1'].forEach((topicName) => {
        act(() => {
          userEvent.selectOptions(
            screen.getByRole('combobox', { name: /topic area/i }),
            screen.getByRole('option', { name: topicName }),
          );
        });
        // If a cohorted topic is selected, the cohort visibility selector is displayed
        expect(screen.queryByRole('combobox', { name: /cohort visibility/i })).not.toBeInTheDocument();
      });
    });

    test('edit existing post should not show cohort selector to unprivileged users', async () => {
      const threadId = 'thread-1';
      await setupData({ hasModerationPrivileges: false });
      await act(async () => {
        axiosMock.onGet(`${threadsApiUrl}${threadId}/`).reply(200, Factory.build('thread'));
        await executeThunk(fetchThread(threadId), store.dispatch, store.getState);
        await renderComponent(true, `/${courseId}/posts/${threadId}/edit`);
      });

      ['ncw-topic 1', 'ncw-topic 2', 'category-1-topic 1', 'category-2-topic 1'].forEach((topicName) => {
        act(() => {
          userEvent.selectOptions(
            screen.getByRole('combobox', {
              name: /topic area/i,
            }),
            screen.getByRole('option', { name: topicName }),
          );
        });
        // If a cohorted topic is selected, the cohort visibility selector is displayed
        expect(screen.queryByRole('combobox', { name: /cohort visibility/i })).not.toBeInTheDocument();
      });
    });

    test('cancel posting of existing post', async () => {
      const threadId = 'thread-1';
      await setupData({
        editReasons: [
          {
            code: 'reason-1',
            label: 'Reason 1',
          },
          {
            code: 'reason-2',
            label: 'Reason 2',
          },
        ],
      });
      await act(async () => {
        axiosMock.onGet(`${threadsApiUrl}${threadId}/`).reply(200, Factory.build('thread'));
        await executeThunk(fetchThread(threadId), store.dispatch, store.getState);
        await renderComponent(true, `/${courseId}/posts/${threadId}/edit`);
      });

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await act(async () => {
        fireEvent.click(cancelButton);
      });
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });
  });

  describe('Edit codes', () => {
    const threadId = 'thread-1';

    beforeEach(async () => {
      const dividedncw = ['ncw-topic-2'];
      const dividedcw = ['category-1-topic-2', 'category-2-topic-1', 'category-2-topic-2'];

      store = initializeStore({
        config: {
          provider: 'legacy',
          hasModerationPrivileges: true,
          editReasons: [
            {
              code: 'reason-1',
              label: 'Reason 1',
            },
            {
              code: 'reason-2',
              label: 'Reason 2',
            },
          ],
          settings: {
            dividedInlineDiscussions: dividedcw,
            dividedCourseWideDiscussions: dividedncw,
          },
          captchaSettings: {
            enabled: false,
            siteKey: '',
          },
        },
      });
      await executeThunk(fetchCourseTopics(courseId), store.dispatch, store.getState);
      axiosMock.onGet(`${threadsApiUrl}${threadId}/`).reply(200, Factory.build('thread'));
      await executeThunk(fetchThread(threadId), store.dispatch, store.getState);
    });

    test('Edit post and see reasons', async () => {
      await act(async () => {
        await renderComponent(true, `/${courseId}/posts/${threadId}/edit`);
      });

      expect(screen.queryByRole('combobox', { name: /reason for editing/i })).toBeInTheDocument();
      expect(screen.getAllByRole('option', { name: /reason \d/i })).toHaveLength(2);
    });

    it('should show Preview Panel', async () => {
      await renderComponent(true, `/${courseId}/posts/${threadId}/edit`);

      await act(async () => {
        fireEvent.click(container.querySelector('[data-testid="show-preview-button"]'));
      });

      await waitFor(() => {
        expect(container.querySelector('[data-testid="hide-preview-button"]')).toBeInTheDocument();
        expect(container.querySelector('[data-testid="show-preview-button"]')).not.toBeInTheDocument();
      });
    });

    it('should hide Preview Panel', async () => {
      await renderComponent(true, `/${courseId}/posts/${threadId}/edit`);

      await act(async () => {
        fireEvent.click(container.querySelector('[data-testid="show-preview-button"]'));
      });

      await waitFor(() => {
        expect(container.querySelector('[data-testid="hide-preview-button"]')).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(container.querySelector('[data-testid="hide-preview-button"]'));
      });

      await waitFor(() => {
        expect(container.querySelector('[data-testid="show-preview-button"]')).toBeInTheDocument();
        expect(container.querySelector('[data-testid="hide-preview-button"]')).not.toBeInTheDocument();
      });
    });

    it('should show Help Panel', async () => {
      await renderComponent(true, `/${courseId}/posts/${threadId}/edit`);

      await act(async () => {
        fireEvent.click(container.querySelector('[data-testid="help-button"]'));
      });

      await waitFor(() => {
        expect(container.querySelector('[data-testid="hide-help-button"]')).toBeInTheDocument();
      });
    });

    it('should hide Help Panel', async () => {
      await renderComponent(true, `/${courseId}/posts/${threadId}/edit`);

      await act(async () => {
        fireEvent.click(container.querySelector('[data-testid="help-button"]'));
      });

      await act(async () => {
        fireEvent.click(container.querySelector('[data-testid="hide-help-button"]'));
      });

      await waitFor(() => {
        expect(container.querySelector('[data-testid="help-button"]')).toBeInTheDocument();
        expect(container.querySelector('[data-testid="hide-help-button"]')).not.toBeInTheDocument();
      });
    });

    it('should open the rate limit dialogue.', async () => {
      axiosMock.onPost(threadsApiUrl).reply(429);

      await renderComponent();

      await act(async () => {
        fireEvent.change(screen.getByTestId('topic-select'), {
          target: { value: 'ncw-topic-1' },
        });
        const postTitle = await screen.findByTestId('post-title-input');
        const tinymceEditor = await screen.findByTestId('tinymce-editor');

        fireEvent.change(postTitle, { target: { value: 'Test Post Title' } });
        fireEvent.change(tinymceEditor, { target: { value: 'Test Post Content' } });
      });

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /submit/i }));
      });

      expect(screen.queryByText('Post limit reached')).toBeInTheDocument();
    });
  });
});
