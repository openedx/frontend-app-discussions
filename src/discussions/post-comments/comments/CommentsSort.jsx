import React, { useCallback, useEffect, useState } from 'react';

import {
  Button, Dropdown, ModalPopup, useToggle,
} from '@openedx/paragon';
import { ExpandLess, ExpandMore } from '@openedx/paragon/icons';
import { useDispatch, useSelector } from 'react-redux';

import { useIntl } from '@edx/frontend-platform/i18n';

import { updateUserDiscussionsTourByName } from '../../tours/data';
import { selectCommentSortOrder } from '../data/selectors';
import { setCommentSortOrder } from '../data/slices';
import messages from '../messages';

const CommentSortDropdown = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const sortedOrder = useSelector(selectCommentSortOrder);
  const [isOpen, open, close] = useToggle(false);
  const [target, setTarget] = useState(null);

  const handleActions = useCallback((reverseOrder) => {
    close();
    dispatch(setCommentSortOrder(reverseOrder));
  }, []);

  const enableCommentsSortTour = useCallback((enabled) => {
    const data = {
      enabled,
      tourName: 'response_sort',
    };
    dispatch(updateUserDiscussionsTourByName(data));
  }, []);

  useEffect(() => {
    enableCommentsSortTour(true);
    return () => {
      enableCommentsSortTour(false);
    };
  }, []);

  return (
    <>
      <div className="comments-sort d-flex justify-content-end mx-4 mt-2">
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
      <div className="actions-dropdown">
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
              autoFocus={sortedOrder === false}
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
              autoFocus={sortedOrder === true}
            >
              {intl.formatMessage(messages.commentSort, {
                sort: true,
              })}
            </Dropdown.Item>
          </div>
        </ModalPopup>
      </div>
    </>
  );
};

export default CommentSortDropdown;
