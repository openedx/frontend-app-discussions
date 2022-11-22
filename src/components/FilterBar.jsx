/* eslint-disable react/forbid-prop-types */
import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import { capitalize, toString } from 'lodash';
import { useSelector } from 'react-redux';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Collapsible, Form, Icon, Spinner,
} from '@edx/paragon';
import { Tune } from '@edx/paragon/icons';

import {
  PostsStatusFilter, RequestStatus,
  ThreadOrdering, ThreadType,
} from '../data/constants';
import { selectCourseCohorts } from '../discussions/cohorts/data/selectors';
import messages from '../discussions/posts/post-filter-bar/messages';
import { ActionItem } from '../discussions/posts/post-filter-bar/PostFilterBar';

function FilterBar({
  intl,
  filters,
  selectedFilters,
  onFilterChange,
  showCohortsFilter,
}) {
  const [isOpen, setOpen] = useState(false);
  const cohorts = useSelector(selectCourseCohorts);
  const { status } = useSelector(state => state.cohorts);
  const selectedCohort = useMemo(() => cohorts.find(cohort => (
    toString(cohort.id) === selectedFilters.cohort)),
  [selectedFilters.cohort]);

  const allFilters = [
    {
      id: 'type-all',
      label: intl.formatMessage(messages.allPosts),
      value: ThreadType.ALL,
    },
    {
      id: 'type-discussions',
      label: intl.formatMessage(messages.filterDiscussions),
      value: ThreadType.DISCUSSION,
    },
    {
      id: 'type-questions',
      label: intl.formatMessage(messages.filterQuestions),
      value: ThreadType.QUESTION,
    },
    {
      id: 'status-any',
      label: intl.formatMessage(messages.filterAnyStatus),
      value: PostsStatusFilter.ALL,
    },
    {
      id: 'status-unread',
      label: intl.formatMessage(messages.filterUnread),
      value: PostsStatusFilter.UNREAD,
    },
    {
      id: 'status-reported',
      label: intl.formatMessage(messages.filterReported),
      value: PostsStatusFilter.REPORTED,
    },
    {
      id: 'status-unanswered',
      label: intl.formatMessage(messages.filterUnanswered),
      value: PostsStatusFilter.UNANSWERED,
    },
    {
      id: 'status-unresponded',
      label: intl.formatMessage(messages.filterUnresponded),
      value: PostsStatusFilter.UNRESPONDED,
    },
    {
      id: 'sort-activity',
      label: intl.formatMessage(messages.lastActivityAt),
      value: ThreadOrdering.BY_LAST_ACTIVITY,
    },
    {
      id: 'sort-comments',
      label: intl.formatMessage(messages.commentCount),
      value: ThreadOrdering.BY_COMMENT_COUNT,
    },
    {
      id: 'sort-votes',
      label: intl.formatMessage(messages.voteCount),
      value: ThreadOrdering.BY_VOTE_COUNT,
    },
  ];

  return (
    <Collapsible.Advanced
      open={isOpen}
      onToggle={() => setOpen(!isOpen)}
      className="filter-bar collapsible-card-lg border-0"
    >
      <Collapsible.Trigger className="collapsible-trigger border-0">
        <span className="text-primary-700 pr-4">
          {intl.formatMessage(messages.sortFilterStatus, {
            own: false,
            type: selectedFilters.postType,
            sort: selectedFilters.orderBy,
            status: selectedFilters.status,
            cohortType: selectedCohort?.name ? 'group' : 'all',
            cohort: capitalize(selectedCohort?.name),
          })}
        </span>
        <Collapsible.Visible whenClosed>
          <Icon src={Tune} />
        </Collapsible.Visible>
        <Collapsible.Visible whenOpen>
          <Icon src={Tune} />
        </Collapsible.Visible>
      </Collapsible.Trigger>
      <Collapsible.Body className="collapsible-body px-4 pb-3 pt-0">
        <Form>
          <div className="d-flex flex-row py-2 justify-content-between">
            {filters.map((value) => (
              <Form.RadioSet
                name={value.name}
                className="d-flex flex-column list-group list-group-flush"
                value={selectedFilters[value.name]}
                onChange={onFilterChange}
              >
                {
                  value.filters.map(filterName => {
                    const element = allFilters.find(obj => obj.id === filterName);
                    if (element) {
                      return (
                        <ActionItem
                          id={element.id}
                          label={element.label}
                          value={element.value}
                          selected={selectedFilters[value.name]}
                        />
                      );
                    }
                    return false;
                  })
                }

              </Form.RadioSet>
            ))}
          </div>
          {showCohortsFilter && (
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
                    value={selectedFilters.cohort}
                    onChange={onFilterChange}
                  >
                    <ActionItem
                      id="all-groups"
                      label="All groups"
                      value=""
                      selected={selectedFilters.cohort}
                    />
                    {cohorts.map(cohort => (
                      <ActionItem
                        key={toString(cohort.id)}
                        id={toString(cohort.id)}
                        label={capitalize(cohort.name)}
                        value={toString(cohort.id)}
                        selected={selectedFilters.cohort}
                      />
                    ))}
                  </Form.RadioSet>
                </div>
              )}
            </>
          )}
        </Form>
      </Collapsible.Body>
    </Collapsible.Advanced>
  );
}

FilterBar.propTypes = {
  intl: intlShape.isRequired,
  filters: PropTypes.array.isRequired,
  selectedFilters: PropTypes.object.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  showCohortsFilter: PropTypes.bool,
};

FilterBar.defaultProps = {
  showCohortsFilter: false,
};

export default injectIntl(FilterBar);
