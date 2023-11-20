import React from 'react';
import PropTypes from 'prop-types';

import { useSelector } from 'react-redux';

import { useIntl } from '@edx/frontend-platform/i18n';
import { Form } from '@edx/paragon';

import { PostsStatusFilter } from '../../../data/constants';
import { useCurrentPage } from '../../data/hooks';
import { selectUserHasModerationPrivileges, selectUserIsGroupTa } from '../../data/selectors';
import { selectThreadFilters } from '../data/selectors';
import ActionItem from './ActionItem';
import messages from './messages';
import withFilterHandleChange from './withFilterHandleChange';

const PostStatusFilters = ({ handleSortFilterChange }) => {
  const intl = useIntl();
  const page = useCurrentPage();
  const userHasModerationPrivileges = useSelector(selectUserHasModerationPrivileges);
  const userIsGroupTa = useSelector(selectUserIsGroupTa);
  const { status } = useSelector(selectThreadFilters());

  return (
    <Form.RadioSet
      name="status"
      className="d-flex flex-column list-group list-group-flush"
      value={status}
      onChange={handleSortFilterChange}
    >
      <ActionItem
        id="status-any"
        label={intl.formatMessage(messages.filterAnyStatus)}
        value={PostsStatusFilter.ALL}
        selected={status}
      />
      <ActionItem
        id="status-unread"
        label={intl.formatMessage(messages.filterUnread)}
        value={PostsStatusFilter.UNREAD}
        selected={status}
      />
      {page !== 'my-posts' && (
      <ActionItem
        id="status-following"
        label={intl.formatMessage(messages.filterFollowing)}
        value={PostsStatusFilter.FOLLOWING}
        selected={status}
      />
      )}
      {(userHasModerationPrivileges || userIsGroupTa) && (
        <ActionItem
          id="status-reported"
          label={intl.formatMessage(messages.filterReported)}
          value={PostsStatusFilter.REPORTED}
          selected={status}
        />
      )}
      <ActionItem
        id="status-unanswered"
        label={intl.formatMessage(messages.filterUnanswered)}
        value={PostsStatusFilter.UNANSWERED}
        selected={status}
      />
      <ActionItem
        id="status-unresponded"
        label={intl.formatMessage(messages.filterUnresponded)}
        value={PostsStatusFilter.UNRESPONDED}
        selected={status}
      />
    </Form.RadioSet>
  );
};

PostStatusFilters.propTypes = {
  handleSortFilterChange: PropTypes.func.isRequired,
};

export default React.memo(withFilterHandleChange(PostStatusFilters));
