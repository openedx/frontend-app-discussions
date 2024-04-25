import React, {
  useCallback, useContext, useEffect, useMemo, useState,
} from 'react';
import PropTypes from 'prop-types';

import {
  Collapsible, Form, Icon, Spinner,
} from '@openedx/paragon';
import { Check, Tune } from '@openedx/paragon/icons';
import classNames from 'classnames';
import { capitalize, isEmpty, toString } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { useIntl } from '@edx/frontend-platform/i18n';

import {
  PostsStatusFilter, RequestStatus,
  ThreadOrdering, ThreadType,
} from '../../../data/constants';
import selectCourseCohorts from '../../cohorts/data/selectors';
import fetchCourseCohorts from '../../cohorts/data/thunks';
import DiscussionContext from '../../common/context';
import { selectUserHasModerationPrivileges, selectUserIsGroupTa } from '../../data/selectors';
import {
  setCohortFilter, setPostsTypeFilter, setSortedBy, setStatusFilter,
} from '../data';
import { selectThreadFilters, selectThreadSorting } from '../data/selectors';
import messages from './messages';

export const ActionItem = React.memo(({
  id,
  label,
  value,
  selected,
}) => (
  <label
    htmlFor={id}
    className="focus border-bottom-0 d-flex align-items-center w-100 py-2 m-0 font-weight-500 filter-menu"
    data-testid={value === selected ? 'selected' : null}
    style={{ cursor: 'pointer' }}
    aria-checked={value === selected}
    // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
    tabIndex={value === selected ? '0' : '-1'}
  >
    <Icon src={Check} className={classNames('text-success dropdown-icon-dimensions', { invisible: value !== selected })} />
    <Form.Radio id={id} className="sr-only sr-only-focusable" value={value} tabIndex="0">
      {label}
    </Form.Radio>
    <span aria-hidden className="text-truncate">
      {label}
    </span>
  </label>
));

ActionItem.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  selected: PropTypes.string.isRequired,
};

const PostFilterBar = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const { courseId } = useParams();
  const { page } = useContext(DiscussionContext);
  const userHasModerationPrivileges = useSelector(selectUserHasModerationPrivileges);
  const userIsGroupTa = useSelector(selectUserIsGroupTa);
  const currentSorting = useSelector(selectThreadSorting());
  const currentFilters = useSelector(selectThreadFilters());
  const { status } = useSelector(state => state.cohorts);
  const cohorts = useSelector(selectCourseCohorts);
  const [isOpen, setOpen] = useState(false);

  const selectedCohort = useMemo(() => (
    cohorts.find(cohort => (
      toString(cohort.id) === currentFilters.cohort
    ))
  ), [cohorts, currentFilters.cohort]);

  const handleSortFilterChange = useCallback((event) => {
    const currentType = currentFilters.postType;
    const currentStatus = currentFilters.status;
    const {
      name,
      value,
    } = event.currentTarget;
    const filterContentEventProperties = {
      statusFilter: currentStatus,
      threadTypeFilter: currentType,
      sortFilter: currentSorting,
      cohortFilter: selectedCohort,
      triggeredBy: name,
    };

    if (name === 'type') {
      dispatch(setPostsTypeFilter(value));
      if (
        value === ThreadType.DISCUSSION && currentStatus === PostsStatusFilter.UNANSWERED
      ) {
        // You can't filter discussions by unanswered
        dispatch(setStatusFilter(PostsStatusFilter.ALL));
      }
      filterContentEventProperties.threadTypeFilter = value;
    }

    if (name === 'status') {
      dispatch(setStatusFilter(value));
      if (value === PostsStatusFilter.UNANSWERED && currentType !== ThreadType.QUESTION) {
        // You can't filter discussions by unanswered so switch type to questions
        dispatch(setPostsTypeFilter(ThreadType.QUESTION));
      }
      if (value === PostsStatusFilter.UNRESPONDED && currentType !== ThreadType.DISCUSSION) {
        // You can't filter questions by not responded so switch type to discussion
        dispatch(setPostsTypeFilter(ThreadType.DISCUSSION));
      }
      filterContentEventProperties.statusFilter = value;
    }

    if (name === 'sort') {
      dispatch(setSortedBy(value));
      filterContentEventProperties.sortFilter = value;
    }

    if (name === 'cohort') {
      dispatch(setCohortFilter(value));
      filterContentEventProperties.cohortFilter = value;
    }

    sendTrackEvent('edx.forum.filter.content', filterContentEventProperties);
    setOpen(false);
  }, [currentFilters, currentSorting, dispatch, selectedCohort]);

  useEffect(() => {
    if (userHasModerationPrivileges && isEmpty(cohorts)) {
      dispatch(fetchCourseCohorts(courseId));
    }
  }, [courseId, userHasModerationPrivileges]);

  const renderCohortFilter = useMemo(() => (
    userHasModerationPrivileges && (
      <>
        <div className="border-bottom my-2" />
        {status === RequestStatus.IN_PROGRESS ? (
          <div className="d-flex justify-content-center p-4">
            <Spinner animation="border" variant="primary" size="lg" />
          </div>
        ) : (
          <div className="d-flex flex-row pt-2">
            <Form.RadioSet
              name="cohort"
              className="d-flex flex-column list-group list-group-flush w-100"
              value={currentFilters.cohort}
              onChange={handleSortFilterChange}
            >
              <ActionItem
                id="all-groups"
                label="All groups"
                value=""
                selected={currentFilters.cohort}
              />
              {cohorts.map(cohort => (
                <ActionItem
                  key={cohort.id}
                  id={toString(cohort.id)}
                  label={capitalize(cohort.name)}
                  value={toString(cohort.id)}
                  selected={currentFilters.cohort}
                />
              ))}
            </Form.RadioSet>
          </div>
        )}
      </>
    )
  ), [cohorts, currentFilters.cohort, handleSortFilterChange, status, userHasModerationPrivileges]);

  return (
    <Collapsible.Advanced
      open={isOpen}
      onToggle={setOpen}
      className="filter-bar collapsible-card-lg border-0"
    >
      <Collapsible.Trigger className="collapsible-trigger border-0">
        <span className="text-primary-500 pr-4 font-style">
          {intl.formatMessage(messages.sortFilterStatus, {
            own: false,
            type: currentFilters.postType,
            sort: currentSorting,
            status: currentFilters.status,
            cohortType: selectedCohort?.name ? 'group' : 'all',
            cohort: capitalize(selectedCohort?.name),
          })}
        </span>
        <span>
          <Collapsible.Visible whenClosed>
            <Icon src={Tune} />
          </Collapsible.Visible>
          <Collapsible.Visible whenOpen>
            <Icon src={Tune} />
          </Collapsible.Visible>
        </span>
      </Collapsible.Trigger>
      <Collapsible.Body className="collapsible-body px-4 pb-3 pt-0">
        <Form>
          <div className="d-flex flex-row py-2 justify-content-between">
            <Form.RadioSet
              name="type"
              className="d-flex flex-column list-group list-group-flush"
              value={currentFilters.postType}
              onChange={handleSortFilterChange}
            >
              <ActionItem
                id="type-all"
                label={intl.formatMessage(messages.allPosts)}
                value={ThreadType.ALL}
                selected={currentFilters.postType}
              />
              <ActionItem
                id="type-discussions"
                label={intl.formatMessage(messages.filterDiscussions)}
                value={ThreadType.DISCUSSION}
                selected={currentFilters.postType}
              />
              <ActionItem
                id="type-questions"
                label={intl.formatMessage(messages.filterQuestions)}
                value={ThreadType.QUESTION}
                selected={currentFilters.postType}
              />
            </Form.RadioSet>
            <Form.RadioSet
              name="status"
              className="d-flex flex-column list-group list-group-flush"
              value={currentFilters.status}
              onChange={handleSortFilterChange}
            >
              <ActionItem
                id="status-any"
                label={intl.formatMessage(messages.filterAnyStatus)}
                value={PostsStatusFilter.ALL}
                selected={currentFilters.status}
              />
              <ActionItem
                id="status-unread"
                label={intl.formatMessage(messages.filterUnread)}
                value={PostsStatusFilter.UNREAD}
                selected={currentFilters.status}
              />
              {page !== 'my-posts' && (
                <ActionItem
                  id="status-following"
                  label={intl.formatMessage(messages.filterFollowing)}
                  value={PostsStatusFilter.FOLLOWING}
                  selected={currentFilters.status}
                />
              )}
              {(userHasModerationPrivileges || userIsGroupTa) && (
                <ActionItem
                  id="status-reported"
                  label={intl.formatMessage(messages.filterReported)}
                  value={PostsStatusFilter.REPORTED}
                  selected={currentFilters.status}
                />
              )}
              <ActionItem
                id="status-unanswered"
                label={intl.formatMessage(messages.filterUnanswered)}
                value={PostsStatusFilter.UNANSWERED}
                selected={currentFilters.status}
              />
              <ActionItem
                id="status-unresponded"
                label={intl.formatMessage(messages.filterUnresponded)}
                value={PostsStatusFilter.UNRESPONDED}
                selected={currentFilters.status}
              />
            </Form.RadioSet>
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
          </div>
          {renderCohortFilter}
        </Form>
      </Collapsible.Body>
    </Collapsible.Advanced>
  );
};

export default React.memo(PostFilterBar);
