import React from 'react';
import PropTypes from 'prop-types';

import { useDispatch } from 'react-redux';
import * as timeago from 'timeago.js';

import { injectIntl } from '@edx/frontend-platform/i18n';

import timeLocale from '../../common/time-locale';
import LikeButton from '../../posts/post/LikeButton';
import { editComment } from '../data/thunks';

function CommentIcons({
  comment,
}) {
  const dispatch = useDispatch();
  timeago.register('time-locale', timeLocale);

  const handleLike = () => dispatch(editComment(comment.id, { voted: !comment.voted }));

  return (comment.voted && (
    <div className="ml-n1.5 mt-10px">
      <LikeButton
        count={comment.voteCount}
        onClick={handleLike}
        voted={comment.voted}
      />
    </div>
  ));
}

CommentIcons.propTypes = {
  comment: PropTypes.shape({
    id: PropTypes.string,
    voteCount: PropTypes.number,
    following: PropTypes.bool,
    voted: PropTypes.bool,
    createdAt: PropTypes.string,
  }).isRequired,
};

export default injectIntl(CommentIcons);
