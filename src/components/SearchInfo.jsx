import React from 'react';
import PropTypes from 'prop-types';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button, Icon } from '@edx/paragon';
import { Search } from '@edx/paragon/icons';

import { RequestStatus } from '../data/constants';
import messages from '../discussions/posts/post-actions-bar/messages';

function SearchInfo({
  intl,
  count,
  text,
  loadingStatus,
  onClear,
  textSearchRewrite,
}) {
  return (
    <div className="d-flex flex-row border-bottom border-light-400">
      <Icon src={Search} className="justify-content-start ml-3.5 mr-2 mb-2 mt-2.5" />
      <Button variant="" size="inline" className="text-justify p-2">
        {loadingStatus === RequestStatus.SUCCESSFUL && (
          textSearchRewrite ? intl.formatMessage(messages.searchRewriteInfo, {
            searchString: text,
            count,
            textSearchRewrite,
          })
            : intl.formatMessage(messages.searchInfo, { count, text })
        )}
        {loadingStatus !== RequestStatus.SUCCESSFUL && intl.formatMessage(messages.searchInfoSearching)}
      </Button>
      <Button variant="link" size="inline" className="ml-auto mr-3" onClick={onClear} style={{ minWidth: '26%' }}>
        {intl.formatMessage(messages.clearSearch)}
      </Button>
    </div>
  );
}

SearchInfo.propTypes = {
  intl: intlShape.isRequired,
  count: PropTypes.number.isRequired,
  text: PropTypes.string.isRequired,
  loadingStatus: PropTypes.string.isRequired,
  textSearchRewrite: PropTypes.string,
  onClear: PropTypes.func,
};

SearchInfo.defaultProps = {
  onClear: () => {},
  textSearchRewrite: null,
};

export default injectIntl(SearchInfo);
