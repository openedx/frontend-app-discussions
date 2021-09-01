import React, { useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import * as timeago from 'timeago.js';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Avatar, Icon, IconButton } from '@edx/paragon';
import { MoreVert } from '@edx/paragon/icons';

import { commentShape } from '../comment/Comment';
import CommentIcons from '../comment-icons/CommentIcons';
import { selectCommentResponses } from '../data/selectors';
import { editComment, fetchCommentResponses } from '../data/thunks';
import messages from '../messages';

function ReplyHeader({ reply, intl }) {
  return (
    <div className="d-flex flex-row justify-content-between">
      <div className="align-items-center d-flex flex-row">
        <Avatar className="m-2" alt={reply.author} src={reply.users?.[reply.author]?.profile.image.image_url_small} />
        <div className="status small">
          <a href="#nowhere">
            <h1 className="font-weight-normal text-info-300 mr-1 small">
              {reply.author} {reply.authorLabel ? `(${reply.authorLabel})` : '' }
            </h1>
          </a>
          <h2 className="font-weight-normal small text-gray-500" title={reply.createdAt}>
            {intl.formatMessage(messages.replyTime, {
              relativeTime: timeago.format(reply.createdAt, intl.locale),
            })}
          </h2>
        </div>
      </div>
      <IconButton
        alt="Options"
        iconAs={Icon}
        // TODO: Implement overlay
        onClick={() => { }}
        size="sm"
        src={MoreVert}
        variant="primary"
      />
    </div>
  );
}

ReplyHeader.propTypes = {
  reply: commentShape.isRequired,
  intl: intlShape.isRequired,
};

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
    <div className="bt-1 discussion-reply d-flex flex-column my-2">
      <div>
        <ReplyHeader reply={reply} intl={intl} />
        <div className="reply-body d-flex px-2" dangerouslySetInnerHTML={{ __html: reply.renderedBody }} />
        <CommentIcons
          abuseFlagged={reply.abuseFlagged}
          count={reply.voteCount}
          following={reply.following}
          // FIXME: this API call fails
          onLike={() => dispatch(editComment(reply.id, { voted: !reply.voted }))}
          voted={reply.voted}
        />
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
