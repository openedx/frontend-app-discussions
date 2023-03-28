import React from 'react';

import classNames from 'classnames';

import { injectIntl } from '@edx/frontend-platform/i18n';
import { Avatar } from '@edx/paragon';

import { AvatarOutlineAndLabelColors } from '../../../../data/constants';
import { AuthorLabel } from '../../../common';
import { useAlertBannerVisible } from '../../../data/hooks';
import { commentShape } from './proptypes';

function CommentHeader({
  comment,
}) {
  const colorClass = AvatarOutlineAndLabelColors[comment.authorLabel];
  const hasAnyAlert = useAlertBannerVisible({
    author: comment.author,
    abuseFlagged: comment.abuseFlagged,
    lastEdit: comment.lastEdit,
    closed: comment.closed,
  });

  return (
    <div className={classNames('d-flex flex-row justify-content-between', {
      'mt-2': hasAnyAlert,
    })}
    >
      <div className="align-items-center d-flex flex-row">
        <Avatar
          className={`border-0 ml-0.5 mr-2.5 ${colorClass ? `outline-${colorClass}` : 'outline-anonymous'}`}
          alt={comment.author}
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
}

CommentHeader.propTypes = {
  comment: commentShape.isRequired,
};

export default injectIntl(CommentHeader);
