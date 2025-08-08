import { Helmet } from 'react-helmet';

import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';

import messages from './messages';

const Head = () => {
  const intl = useIntl();

  return (
    <Helmet>
      <title>
        {intl.formatMessage(messages['discussions.page.title'], { siteName: getConfig().SITE_NAME })}
      </title>
      <link rel="shortcut icon" href={getConfig().FAVICON_URL} type="image/x-icon" />
    </Helmet>
  );
};

export default Head;
