import React from 'react';
import PropTypes from 'prop-types';

import { Button, Icon } from '@edx/paragon';
import { StarFilled, StarOutline } from '@edx/paragon/icons';

import LikeButton from '../../posts/post/LikeButton';

function CommentIcons({
  count,
  following,
  onLike,
  voted,
}) {
  return (
    <div className="d-flex flex-column icons">
      <LikeButton
        count={count}
        onClick={() => onLike && onLike()}
        voted={voted}
      />
      {/* Only show the star if the comment has a following attribute, indicating it can be followed */}
      {following !== undefined && (
        following
          ? (
            <Button variant="link" className="p-0" size="xs">
              <Icon src={StarFilled} />
            </Button>
          ) : (
            <Button variant="link" className="p-0" size="xs">
              <Icon src={StarOutline} />
            </Button>
          )
      )}
    </div>
  );
}

CommentIcons.propTypes = {
  count: PropTypes.number.isRequired,
  following: PropTypes.bool,
  onLike: PropTypes.func,
  voted: PropTypes.bool,
};

CommentIcons.defaultProps = {
  following: undefined,
  onLike: undefined,
  voted: false,
};

export default CommentIcons;
