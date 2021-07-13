import React, { useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import * as timeago from 'timeago.js';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import { commentShape } from '../comment/Comment';
import CommentIcons from '../comment-icons/CommentIcons';
import { selectCommentResponses } from '../data/selectors';
import { fetchCommentResponses } from '../data/thunks';
import messages from '../messages';

function Reply({
  reply,
  intl,
}) {
  const dispatch = useDispatch();
  const hasChildren = !reply.parentId;
  const inlineReplies = useSelector(selectCommentResponses(reply.id));
  useEffect(() => {
    // If the comment has a parent comment, it won't have any children, so don't fetch them.
    if (hasChildren) {
      dispatch(fetchCommentResponses(reply.id));
    }
  }, [reply.id]);

  return (
    <div className="discussion-reply d-flex flex-column mt-2">
      <div className="d-flex flex-row">
        <div className="d-flex flex-column flex-fill">
          <div className="status small">
            <span className="font-weight-bold text-info-300 mr-1">
              {reply.author}
            </span>
            <span title={reply.createdAt}>
              {intl.formatMessage(messages.replyTime, {
                relativeTime: timeago.format(reply.createdAt, intl.locale),
              })}
            </span>
          </div>
          <div className="reply-body d-flex" dangerouslySetInnerHTML={{ __html: reply.renderedBody }} />
        </div>
        <CommentIcons abuseFlagged={reply.abuseFlagged} following={reply.following} />
      </div>
      <div className="ml-4">
        {/* Pass along intl since the `Reply` component used here is the one before it's injected with `injectIntl` */}
        {inlineReplies.map(inlineReply => <Reply reply={inlineReply} key={inlineReply.id} intl={intl} />)}
      </div>
    </div>
  );
}

Reply.propTypes = {
  reply: commentShape.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(Reply);
