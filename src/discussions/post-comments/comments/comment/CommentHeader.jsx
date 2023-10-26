import React from 'react';

import classNames from 'classnames';

import { injectIntl } from '@edx/frontend-platform/i18n';
import { Avatar } from '@edx/paragon';

import { AvatarOutlineAndLabelColors } from '../../../../data/constants';
import { AuthorLabel } from '../../../common';
import { useAlertBannerVisible } from '../../../data/hooks';
import { commentShape } from './proptypes';

const CommentHeader = ({
  comment,
}) => {
  const colorClass = AvatarOutlineAndLabelColors[comment.authorLabel];
  const hasAnyAlert = useAlertBannerVisible(comment);

  const profileImage = Boolean(comment.users) && Object.values(comment.users)[0].profile.image;

  return (
    <div className={classNames('d-flex flex-row justify-content-between', {
      'mt-2': hasAnyAlert,
    })}
    >
      <div className="align-items-center d-flex flex-row">
        <Avatar
          className={`border-0 ml-0.5 mr-2.5 ${colorClass ? `outline-${colorClass}` : 'outline-anonymous'}`}
          alt={comment.author}
          src={profileImage.hasImage ? profileImage.imageUrlSmall : undefined}
          style={{
            width: '32px',
            height: '32px',
          }}
        />
        <AuthorLabel
          author={comment.author}
          authorLabel={comment.authorLabel}
          labelColor={colorClass && `text-${colorClass}`}
          linkToProfile
          postCreatedAt={comment.createdAt}
          postOrComment
        />
      </div>
    </div>
  );
};

CommentHeader.propTypes = {
  comment: commentShape.isRequired,
};

export default injectIntl(CommentHeader);
