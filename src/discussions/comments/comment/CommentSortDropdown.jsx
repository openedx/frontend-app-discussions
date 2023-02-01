import React, { useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Button, Dropdown, ModalPopup, useToggle,
} from '@edx/paragon';
import {
  ExpandLess, ExpandMore,
} from '@edx/paragon/icons';

import { selectCommentSortOrder } from '../data/selectors';
import { setCommentSortOrder } from '../data/slices';
import messages from '../messages';

function CommentSortDropdown({
  intl,
}) {
  const dispatch = useDispatch();
  const sortedOrder = useSelector(selectCommentSortOrder);
  const [isOpen, open, close] = useToggle(false);
  const [target, setTarget] = useState(null);

  const handleActions = (reverseOrder) => {
    close();
    dispatch(setCommentSortOrder(reverseOrder));
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
          {intl.formatMessage(messages.commentSort, {
            sort: sortedOrder,
          })}
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
            onClick={() => handleActions(false)}
          >
            {intl.formatMessage(messages.commentSort, {
              sort: false,
            })}
          </Dropdown.Item>
          <Dropdown.Item
            className="d-flex justify-content-start py-1.5"
            as={Button}
            variant="tertiary"
            size="inline"
            onClick={() => handleActions(true)}
          >
            {intl.formatMessage(messages.commentSort, {
              sort: true,
            })}
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
