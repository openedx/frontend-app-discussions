import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import { Avatar, Badge, Icon } from '@openedx/paragon';
import { Question } from '@openedx/paragon/icons';
import classNames from 'classnames';

import { useIntl } from '@edx/frontend-platform/i18n';

import { AvatarOutlineAndLabelColors, ThreadType } from '../../../data/constants';
import { AuthorLabel } from '../../common';
import { useAlertBannerVisible } from '../../data/hooks';
import messages from './messages';

export const PostAvatar = React.memo(({
  author, postType, authorLabel, fromPostLink, read,
}) => {
  const outlineColor = AvatarOutlineAndLabelColors[authorLabel];

  const avatarSize = useMemo(() => {
    let size = '2rem';
    if (postType === ThreadType.DISCUSSION && !fromPostLink) {
      size = '2rem';
    } else if (postType === ThreadType.QUESTION) {
      size = '1.5rem';
    }
    return size;
  }, [postType]);

  const avatarSpacing = useMemo(() => {
    let spacing = 'mr-3 ';
    if (postType === ThreadType.DISCUSSION && fromPostLink) {
      spacing += 'pt-2 ml-0.5';
    } else if (postType === ThreadType.DISCUSSION) {
      spacing += 'ml-0.5 mt-0.5';
    }
    return spacing;
  }, [postType]);

  return (
    <div className={avatarSpacing}>
      {postType === ThreadType.QUESTION && (
        <Icon
          src={Question}
          className={classNames('position-absolute rounded-circle question-icon-size', {
            'question-icon-position': fromPostLink, 'bg-white': !read, 'bg-light-300': read,
          })}
        />
      )}
      <Avatar
        className={classNames('border-0 mt-1', {
          [`outline-${outlineColor}`]: outlineColor,
          'outline-anonymous': !outlineColor,
          'mt-3 ml-2': postType === ThreadType.QUESTION && fromPostLink,
          'mt-2.5': postType === ThreadType.QUESTION && !fromPostLink,
          'avarat-img-position mt-17px': postType === ThreadType.QUESTION,
        })}
        style={{
          height: avatarSize,
          width: avatarSize,
        }}
        alt={author}
      />
    </div>
  );
});

PostAvatar.propTypes = {
  author: PropTypes.string.isRequired,
  postType: PropTypes.string.isRequired,
  authorLabel: PropTypes.string,
  fromPostLink: PropTypes.bool,
  read: PropTypes.bool,
};

PostAvatar.defaultProps = {
  authorLabel: null,
  fromPostLink: false,
  read: false,
};

const PostHeader = ({
  abuseFlagged,
  author,
  authorLabel,
  closed,
  createdAt,
  hasEndorsed,
  lastEdit,
  title,
  postType,
  preview,
}) => {
  const intl = useIntl();
  const showAnsweredBadge = preview && hasEndorsed && postType === ThreadType.QUESTION;
  const authorLabelColor = AvatarOutlineAndLabelColors[authorLabel];
  const hasAnyAlert = useAlertBannerVisible({
    author, abuseFlagged, lastEdit, closed,
  });

  return (
    <div className={classNames('d-flex flex-fill mw-100', { 'mt-10px': hasAnyAlert && !preview })}>
      <div className="flex-shrink-0">
        <PostAvatar postType={postType} author={author} authorLabel={authorLabel} />
      </div>
      <div className="align-items-center d-flex flex-row">
        <div className="d-flex flex-column justify-content-start mw-100">
          {preview ? (
            <div className="h4 d-flex align-items-center pb-0 mb-0 flex-fill">
              <div className="flex-fill text-truncate" role="heading" aria-level="1">
                {title}
              </div>
              {showAnsweredBadge
                  && <Badge variant="success">{intl.formatMessage(messages.answered)}</Badge>}
            </div>
          ) : (
            <h5
              className="mb-0 font-style text-primary-500"
              style={{ lineHeight: '21px' }}
              aria-level="1"
              tabIndex="-1"
              accessKey="h"
            >
              {title}
            </h5>
          )}
          <AuthorLabel
            author={author || intl.formatMessage(messages.anonymous)}
            authorLabel={authorLabel}
            labelColor={authorLabelColor && `text-${authorLabelColor}`}
            linkToProfile
            postCreatedAt={createdAt}
            postOrComment
          />
        </div>
      </div>
    </div>
  );
};

PostHeader.propTypes = {
  preview: PropTypes.bool,
  hasEndorsed: PropTypes.bool.isRequired,
  postType: PropTypes.string.isRequired,
  authorLabel: PropTypes.string,
  author: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  createdAt: PropTypes.string.isRequired,
  abuseFlagged: PropTypes.bool,
  lastEdit: PropTypes.shape({
    reason: PropTypes.string,
  }),
  closed: PropTypes.bool,
};

PostHeader.defaultProps = {
  authorLabel: null,
  preview: false,
  abuseFlagged: false,
  lastEdit: {},
  closed: false,
};

export default React.memo(PostHeader);
