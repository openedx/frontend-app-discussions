import React from 'react';

import { render } from '@testing-library/react';
import { Helmet } from 'react-helmet';

import { getConfig } from '@edx/frontend-platform';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import Head from './Head';

describe('Head', () => {
  const props = {};
  it('should match render title tag and favicon with the site configuration values', () => {
    render(<IntlProvider locale="en"><Head {...props} /></IntlProvider>);
    const helmet = Helmet.peek();
    expect(helmet.title).toEqual(`Discussions | ${getConfig().SITE_NAME}`);
    expect(helmet.linkTags[0].rel).toEqual('shortcut icon');
    expect(helmet.linkTags[0].href).toEqual(getConfig().FAVICON_URL);
  });
});
