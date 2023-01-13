import React, { useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Button, Dropdown, ModalPopup, useToggle,
} from '@edx/paragon';
import {
  ExpandLess, ExpandMore,
} from '@edx/paragon/icons';

import { CommentOrdering } from '../../../data/constants';
import { selectCommentSortedBy } from '../data/selectors';
import { setCommentSortedBy } from '../data/slices';
import messages from '../messages';

function CommentSortDropdown({
  intl,
}) {
  const dispatch = useDispatch();
  const commentSortedBy = useSelector(selectCommentSortedBy);
  const [isOpen, open, close] = useToggle(false);
  const [target, setTarget] = useState(null);

  const handleActions = (sortBy) => {
    close();
    dispatch(setCommentSortedBy(sortBy));
  };

  return (
    <>
      <div>
        <Button
          alt={intl.formatMessage(messages.actionsAlt)}
          ref={setTarget}
          variant="tertiary"
          onClick={open}
          size="sm"
          iconAfter={isOpen ? ExpandLess : ExpandMore}
        >
          {intl.formatMessage(messages[commentSortedBy])}
        </Button>
      </div>
      <ModalPopup
        onClose={close}
        positionRef={target}
        isOpen={isOpen}
      >
        <div
          className="bg-white p-1 shadow d-flex flex-column"
          data-testid="comment-sort-dropdown-modal-popup"
        >
          <Dropdown.Item
            className="d-flex justify-content-start py-1.5 mb-1"
            as={Button}
            variant="tertiary"
            size="inline"
            onClick={() => handleActions(CommentOrdering.BY_DESC)}
          >
            {intl.formatMessage(messages.desc)}
          </Dropdown.Item>
          <Dropdown.Item
            className="d-flex justify-content-start py-1.5"
            as={Button}
            variant="tertiary"
            size="inline"
            onClick={() => handleActions(CommentOrdering.BY_ASC)}
          >
            {intl.formatMessage(messages.asc)}
          </Dropdown.Item>
        </div>
      </ModalPopup>
    </>
  );
}

CommentSortDropdown.propTypes = {
  intl: intlShape.isRequired,

};

export default injectIntl(CommentSortDropdown);
