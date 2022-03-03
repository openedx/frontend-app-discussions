import { render, screen, waitFor } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { Factory } from 'rosie';

import { camelCaseObject, initializeMockApp, snakeCaseObject } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';

import { ThreadType } from '../../data/constants';
import AlertBanner from './AlertBanner';

import '../comments/data/__factories__';

let store;

function buildTestContent(buildParams) {
  const buildParamsSnakeCase = snakeCaseObject(buildParams);
  return [
    Factory.build('comment', { ...buildParamsSnakeCase }, null),
  ].map(content => camelCaseObject(content));
}

function renderComponent(
  content,
) {
  render(
    <IntlProvider locale="en">
      <AppProvider store={store}>
        <AlertBanner
          content={content}
          postType={ThreadType.QUESTION}
        />
      </AppProvider>
    </IntlProvider>,
  );
}

describe('AlertBanner', () => {
  beforeEach(async () => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: false,
        roles: [],
      },
    });
  });

  it.each(buildTestContent({ endorsed: true, endorsedByLabel: 'Staff' }))(
    'endorsed by label is Staff when endorsed by staff user',
    async (content) => {
      renderComponent(content);

      await waitFor(() => expect(screen.getByText('Staff')).toBeInTheDocument());
    },
  );

  it.each(buildTestContent({ endorsed: true, endorsedByLabel: 'Community TA' }))(
    'endorsed by label is TA when not endorsed by staff user',
    async (content) => {
      renderComponent(content);

      await waitFor(() => expect(screen.getByText('TA')).toBeInTheDocument());
    },
  );
});
