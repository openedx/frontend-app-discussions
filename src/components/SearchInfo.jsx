import React from 'react';
import PropTypes from 'prop-types';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button, Icon } from '@edx/paragon';
import { Search } from '@edx/paragon/icons';

import messages from '../discussions/posts/post-actions-bar/messages';

function SearchInfo({
  intl,
  count,
  text,
  onClear,
}) {
  return (
    <div className="d-flex flex-row border-bottom">
      <Icon src={Search} className="justify-content-start ml-3.5 mr-2 mb-2 mt-2.5" />
      <Button variant="" size="inline">
        {intl.formatMessage(messages.searchInfo, { count, text })}
      </Button>
      <Button variant="link" size="inline" className="ml-auto mr-4" onClick={onClear}>
        {intl.formatMessage(messages.clearSearch)}
      </Button>
    </div>
  );
}

SearchInfo.propTypes = {
  intl: intlShape.isRequired,
  count: PropTypes.number.isRequired,
  text: PropTypes.string.isRequired,
  onClear: PropTypes.func,
};

SearchInfo.defaultProps = {
  onClear: () => {},
};

export default injectIntl(SearchInfo);
