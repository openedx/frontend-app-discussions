import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as timeago from 'timeago.js';
import { commentShape } from '../comment/Comment';
import CommentIcons from '../comment-icons/CommentIcons';
import InlineReply from './inline-reply/InlineReply';
import { selectReplyInlineReplies } from '../data/selectors';
import { fetchReplyInlineReplies } from '../data/thunks';

function Reply({ reply }) {
  const dispatch = useDispatch();
  const inlineReplies = useSelector(selectReplyInlineReplies(reply.id));
  useEffect(() => {
    dispatch(fetchReplyInlineReplies(reply.id));
  }, [reply.id]);

  return (
    <div className="discussion-reply d-flex flex-column mt-2">
      <div className="d-flex flex-row">
        <div className="d-flex flex-column flex-fill">
          <div className="status small">
            <span className="font-weight-bold text-info-300">{ reply.author }</span> commented { timeago.format(reply.created_at) }
          </div>
          <div className="reply-body d-flex" dangerouslySetInnerHTML={{ __html: reply.rendered_body }} />
        </div>
        <CommentIcons abuseFlagged={reply.abuse_flagged} following={reply.following} />
      </div>
      <div className="visibility-reply d-flex small text-gray-300">
        This post is visible to everyone
      </div>
      { inlineReplies.map(inlineReply => <InlineReply reply={inlineReply} key={inlineReply.id} />) }
    </div>
  );
}

Reply.propTypes = {
  reply: commentShape.isRequired,
};

export default Reply;
