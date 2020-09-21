import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import Button from '@edx/paragon/dist/Button';
import { faFlag } from '@fortawesome/free-regular-svg-icons';
import { faEllipsisV, faStar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import messages from './messages';

function Comment({ intl, comment }) {
  return (
    <div className="discussion-comment d-flex flex-column m-2 card">
      <div className="header d-flex m-1 card-header">
        <div className="avatar">
          [A]
        </div>
        <div className="d-flex flex-column m-1">
          <div className="title">
            {/* TODO: Get title from thread */ }
            Some title
          </div>
          <div className="status">
            {/* TODO: get type from thread */ }
            discussion posted about { comment.posted_on } by { comment.author }
          </div>
        </div>
        <div className="d-flex icons m-1">
          <FontAwesomeIcon icon={faStar} />
          { comment.abuse_flagged && <FontAwesomeIcon icon={faFlag} /> }
          <FontAwesomeIcon icon={faEllipsisV} />
        </div>
      </div>
      <div className="comment-body d-flex" dangerouslySetInnerHTML={{ __html: comment.rendered_body }} />
      <div className="visibility-comment d-flex">
        {/*  TODO: Add parent group info */ }
      </div>
      <div className="actions d-flex">
        <Button>{ intl.formatMessage(messages.add_response) }</Button>
      </div>
    </div>
  );
}

export const commentShape = PropTypes.shape({
  posted_on: PropTypes.string,
  abuse_flagged: PropTypes.bool,
  rendered_body: PropTypes.string,
  author: PropTypes.string,
});

Comment.propTypes = {
  intl: intlShape.isRequired,
  comment: commentShape.isRequired,
};

export default injectIntl(Comment);
