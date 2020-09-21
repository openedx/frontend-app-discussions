import React from 'react';
import * as timeago from 'timeago.js';
import { commentShape } from '../../comment/Comment';
import CommentIcons from '../../comment-icons/CommentIcons';

function InlineReply({ reply }) {
  return (
    <div className="discussion-reply d-flex flex-column mt-2">
      <div className="d-flex flex-row">
        <div className="d-flex flex-column flex-fill">
          <div className="status small">
            <span className="font-weight-bold text-info-300">{ reply.author }</span> replied { timeago.format(reply.created_at) }
          </div>
          <div className="reply-body d-flex" dangerouslySetInnerHTML={{ __html: reply.rendered_body }} />
        </div>
        <CommentIcons abuseFlagged={reply.abuse_flagged} following={reply.following} />
      </div>
      <div className="visibility-reply d-flex small text-gray-300">
        This post is visible to everyone
      </div>
    </div>
  );
}

InlineReply.propTypes = {
  reply: commentShape.isRequired,
};

export default InlineReply;
