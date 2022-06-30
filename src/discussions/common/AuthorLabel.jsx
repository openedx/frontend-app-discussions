import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';
import capitalize from 'lodash/capitalize';
import { Link, useLocation } from 'react-router-dom';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Icon } from '@edx/paragon';
import { Institution, School } from '@edx/paragon/icons';

import { Routes } from '../../data/constants';
import messages from '../messages';
import { discussionsPath } from '../utils';
import { DiscussionContext } from './context';

function AuthorLabel({
  intl,
  author,
  authorLabel,
  linkToProfile,
  labelColor,
}) {
  const location = useLocation();
  const { courseId } = useContext(DiscussionContext);
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

  const fontWeight = authorLabelMessage ? 'font-weight-500' : 'font-weight-normal text-primary-500';
  const className = classNames('d-flex align-items-center', labelColor);

  const labelContents = (
    <div className={className}>
      <span
        className={`mr-1 font-size-14 font-style-normal font-family-inter ${fontWeight}`}
        role="heading"
        aria-level="2"
      >
        {capitalize(author)}
      </span>
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
        <span
          className={`mr-3 font-size-14 font-style-normal font-family-inter ${fontWeight}`}
          style={{ marginLeft: '2px' }}
        >
          {authorLabelMessage}
        </span>
      )}
    </div>
  );

  return linkToProfile
    ? (
      <Link
        data-testid="learner-posts-link"
        to={discussionsPath(Routes.LEARNERS.POSTS, { learnerUsername: author, courseId })(location)}
        className="text-decoration-none"
        style={{ width: 'fit-content' }}
      >
        {labelContents}
      </Link>
    )
    : <>{labelContents}</>;
}

AuthorLabel.propTypes = {
  intl: intlShape.isRequired,
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
