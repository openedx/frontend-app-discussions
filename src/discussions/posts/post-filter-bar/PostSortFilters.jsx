import React from 'react';
import PropTypes from 'prop-types';

import { useSelector } from 'react-redux';

import { useIntl } from '@edx/frontend-platform/i18n';
import { Form } from '@edx/paragon';

import { ThreadOrdering } from '../../../data/constants';
import { selectThreadSorting } from '../data/selectors';
import ActionItem from './ActionItem';
import messages from './messages';
import withFilterHandleChange from './withFilterHandleChange';

const PostSortFilters = ({ handleSortFilterChange }) => {
  const intl = useIntl();
  const currentSorting = useSelector(selectThreadSorting());

  return (
    <Form.RadioSet
      name="sort"
      className="d-flex flex-column list-group list-group-flush"
      value={currentSorting}
      onChange={handleSortFilterChange}
    >
      <ActionItem
        id="sort-activity"
        label={intl.formatMessage(messages.lastActivityAt)}
        value={ThreadOrdering.BY_LAST_ACTIVITY}
        selected={currentSorting}
      />
      <ActionItem
        id="sort-comments"
        label={intl.formatMessage(messages.commentCount)}
        value={ThreadOrdering.BY_COMMENT_COUNT}
        selected={currentSorting}
      />
      <ActionItem
        id="sort-votes"
        label={intl.formatMessage(messages.voteCount)}
        value={ThreadOrdering.BY_VOTE_COUNT}
        selected={currentSorting}
      />
    </Form.RadioSet>
  );
};

PostSortFilters.propTypes = {
  handleSortFilterChange: PropTypes.func.isRequired,
};

export default React.memo(withFilterHandleChange(PostSortFilters));
