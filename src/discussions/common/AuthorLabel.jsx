import React from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Icon } from '@edx/paragon';
import { Institution, School } from '@edx/paragon/icons';

import messages from '../messages';

function AuthorLabel({
  intl,
  author,
  authorLabel,
  linkToProfile,
  labelColor,
}) {
  let icon = null;
  let authorLabelMessage = null;
  if (authorLabel === 'Staff') {
    icon = Institution;
    authorLabelMessage = intl.formatMessage(messages.authorLabelStaff);
  }
  if (authorLabel === 'Community TA') {
    icon = School;
    authorLabelMessage = intl.formatMessage(messages.authorLabelTA);
  }
  const labelContents = (
    <>
      <span className="mr-1">{author}</span>
      {icon && (
        <Icon
          style={{
            width: '1rem',
            height: '1rem',
          }}
          src={icon}
        />
      )}
      {authorLabelMessage && (
        <span className="mr-3 ml-1">
          {authorLabelMessage}
        </span>
      )}
    </>
  );
  const className = classNames('d-flex align-items-center', labelColor);
  return linkToProfile
    ? React.createElement('a', { href: '#nowhere', className }, labelContents)
    : React.createElement('div', { className }, labelContents);
}

AuthorLabel.propTypes = {
  intl: intlShape,
  author: PropTypes.string.isRequired,
  authorLabel: PropTypes.string,
  linkToProfile: PropTypes.bool,
  labelColor: PropTypes.string,
};

AuthorLabel.defaultProps = {
  linkToProfile: false,
  authorLabel: null,
  labelColor: '',
};

export default injectIntl(AuthorLabel);
