import React from 'react';

import classNames from 'classnames';
import { useSelector } from 'react-redux';

import { injectIntl } from '@edx/frontend-platform/i18n';
import { Avatar } from '@edx/paragon';

import { AvatarOutlineAndLabelColors } from '../../../data/constants';
import { AuthorLabel } from '../../common';
import { useAlertBannerVisible } from '../../data/hooks';
import { selectAuthorAvatars } from '../../posts/data/selectors';
import { commentShape } from './proptypes';

function CommentHeader({
  comment,
}) {
  const authorAvatars = useSelector(selectAuthorAvatars(comment.author));
  const colorClass = AvatarOutlineAndLabelColors[comment.authorLabel];
  const hasAnyAlert = useAlertBannerVisible(comment);

  return (
    <div className={classNames('d-flex flex-row justify-content-between', {
      'mt-2': hasAnyAlert,
    })}
    >
      <div className="align-items-center d-flex flex-row">
        <Avatar
          className={`border-0 ml-0.5 mr-2.5 ${colorClass ? `outline-${colorClass}` : 'outline-anonymous'}`}
          alt={comment.author}
          src={authorAvatars?.imageUrlSmall}
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
        />
      </div>
    </div>
  );
}

CommentHeader.propTypes = {
  comment: commentShape.isRequired,
};

export default injectIntl(CommentHeader);
