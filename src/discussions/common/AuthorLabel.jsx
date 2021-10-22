import React from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';

import { Icon } from '@edx/paragon';
import { Institution, School } from '@edx/paragon/icons';

function AuthorLabel({
  author,
  authorLabel,
  linkToProfile,
}) {
  const labelContents = (
    <>
      {author}
      {authorLabel === 'Staff' && (
      <Icon
        style={{
          width: '1rem',
          height: '1rem',
        }}
        src={Institution}
      />
      )}
      {authorLabel === 'Community TA' && (
      <Icon
        style={{
          width: '1rem',
          height: '1rem',
        }}
        src={School}
      />
      )}
    </>
  );
  const className = classNames('d-flex align-items-center', { 'text-success-700': Boolean(authorLabel) });
  return linkToProfile
    ? React.createElement('a', { href: '#nowhere', className }, labelContents)
    : React.createElement('div', { className }, labelContents);
}

AuthorLabel.propTypes = {
  author: PropTypes.string.isRequired,
  authorLabel: PropTypes.string,
  linkToProfile: PropTypes.bool,
};

AuthorLabel.defaultProps = {
  linkToProfile: false,
  authorLabel: null,
};

export default AuthorLabel;
