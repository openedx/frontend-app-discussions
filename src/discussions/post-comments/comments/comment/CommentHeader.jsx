import React from 'react';
import PropTypes from 'prop-types';

import { Avatar } from '@openedx/paragon';
import classNames from 'classnames';

import { AvatarOutlineAndLabelColors } from '../../../../data/constants';
import { AuthorLabel } from '../../../common';
import { useAlertBannerVisible } from '../../../data/hooks';

const CommentHeader = ({
  author,
  authorLabel,
  abuseFlagged,
  closed,
  createdAt,
  lastEdit,
}) => {
  const colorClass = AvatarOutlineAndLabelColors[authorLabel];
  const hasAnyAlert = useAlertBannerVisible({
    author,
    abuseFlagged,
    lastEdit,
    closed,
  });

  return (
    <div className={classNames('d-flex flex-row justify-content-between', {
      'mt-2': hasAnyAlert,
    })}
    >
      <div className="align-items-center d-flex flex-row">
        <Avatar
          className={`border-0 ml-0.5 mr-2.5 ${colorClass ? `outline-${colorClass}` : 'outline-anonymous'}`}
          alt={author}
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
  authorLabel: PropTypes.string,
  abuseFlagged: PropTypes.bool.isRequired,
  closed: PropTypes.bool,
  createdAt: PropTypes.string.isRequired,
  lastEdit: PropTypes.shape({
    editorUsername: PropTypes.string,
    reason: PropTypes.string,
  }),
};

CommentHeader.defaultProps = {
  authorLabel: null,
  closed: undefined,
  lastEdit: null,
};

export default React.memo(CommentHeader);
