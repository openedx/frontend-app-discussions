import { faFlag, faStar as faEmptyStar } from '@fortawesome/free-regular-svg-icons';
import { faEllipsisV, faStar as faSolidStar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '@edx/paragon/dist/Button';
import PropTypes from 'prop-types';
import React from 'react';

function CommentIcons({ abuseFlagged, following }) {
  return (
    <div className="d-flex flex-column icons">
      {/* Only show the star if the comment has a following attribute, indicating it can be followed */}
      { following !== undefined && (
        following
          ? (

            <Button variant="link" className="p-0" size="xs">
              <FontAwesomeIcon icon={faSolidStar} />
            </Button>
          ) : (
            <Button variant="link" className="p-0" size="xs">
              <FontAwesomeIcon icon={faEmptyStar} />
            </Button>
          )
      )}
      { abuseFlagged && (
        <Button variant="link" className="p-0" size="xs">
          <FontAwesomeIcon icon={faFlag} />
        </Button>
      ) }
      <Button variant="link" className="p-0" size="xs">
        <FontAwesomeIcon icon={faEllipsisV} />
      </Button>
    </div>
  );
}

CommentIcons.propTypes = {
  abuseFlagged: PropTypes.bool,
  following: PropTypes.bool,
};

CommentIcons.defaultProps = {
  abuseFlagged: undefined,
  following: undefined,
};

export default CommentIcons;
