import React from 'react';
import PropTypes from 'prop-types';

import { Avatar } from '@openedx/paragon';
import classNames from 'classnames';
import { useSelector } from 'react-redux';

import { getConfig } from '@edx/frontend-platform';

import { AvatarOutlineAndLabelColors } from '../../../../data/constants';
import { AuthorLabel } from '../../../common';
import { useAlertBannerVisible } from '../../../data/hooks';
import { selectAuthorAvatar } from '../../../posts/data/selectors';
import { getAuthorRoles } from '../../../utils';

const CommentHeader = ({
  author,
  authorLabel,
  abuseFlagged,
  closed,
  createdAt,
  lastEdit,
  commentUsers,
}) => {
  const firstRole = getAuthorRoles(authorLabel)[0];
  const colorClass = AvatarOutlineAndLabelColors[firstRole];
  const hasAnyAlert = useAlertBannerVisible({
    author,
    abuseFlagged,
    lastEdit,
    closed,
  });
  const authorAvatar = useSelector(selectAuthorAvatar(author));

  const profileImage = getConfig()?.ENABLE_PROFILE_IMAGE === 'true'
    ? Object.values(commentUsers ?? {})[0]?.profile?.image
    : null;

  return (
    <div className={classNames('d-flex flex-row justify-content-between', {
      'mt-2': hasAnyAlert,
    })}
    >
      <div className="align-items-center d-flex flex-row">
        <Avatar
          className={`border-0 ml-0.5 mr-2.5 ${colorClass ? `outline-${colorClass}` : 'outline-anonymous'}`}
          alt={author}
          src={profileImage?.hasImage ? profileImage?.imageUrlSmall : authorAvatar?.imageUrlSmall}
          style={{
            width: '32px',
            height: '32px',
          }}
        />
        <AuthorLabel
          author={author}
          authorLabel={authorLabel}
          labelColor={colorClass && `text-${colorClass}`}
          linkToProfile
          postCreatedAt={createdAt}
          postOrComment
        />
      </div>
    </div>
  );
};

CommentHeader.propTypes = {
  author: PropTypes.string.isRequired,
  authorLabel: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
  abuseFlagged: PropTypes.bool.isRequired,
  closed: PropTypes.bool,
  createdAt: PropTypes.string.isRequired,
  lastEdit: PropTypes.shape({
    editorUsername: PropTypes.string,
    reason: PropTypes.string,
  }),
  commentUsers: PropTypes.shape({}).isRequired,
};

CommentHeader.defaultProps = {
  authorLabel: null,
  closed: undefined,
  lastEdit: null,
};

export default React.memo(CommentHeader);
