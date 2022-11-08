import React, { useState } from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Collapsible, Form, Icon } from '@edx/paragon';
import { Check, Tune } from '@edx/paragon/icons';

import { LearnersOrdering } from '../../../data/constants';
import { selectUserHasModerationPrivileges, selectUserIsGroupTa } from '../../data/selectors';
import { setSortedBy } from '../data';
import { selectLearnerSorting } from '../data/selectors';
import messages from '../messages';

const ActionItem = ({
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
  >
    <Icon src={Check} className={classNames('text-success mr-2', { invisible: value !== selected })} />
    <Form.Radio id={id} className="sr-only sr-only-focusable" value={value} tabIndex="0">
      {label}
    </Form.Radio>
    <span aria-hidden className="text-truncate">
      {label}
    </span>
  </label>
);

ActionItem.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  selected: PropTypes.string.isRequired,
};

function LearnerFilterBar({
  intl,
}) {
  const dispatch = useDispatch();
  const userHasModerationPrivileges = useSelector(selectUserHasModerationPrivileges);
  const userIsGroupTa = useSelector(selectUserIsGroupTa);
  const currentSorting = useSelector(selectLearnerSorting());
  const [isOpen, setOpen] = useState(false);

  const handleSortFilterChange = (event) => {
    const { name, value } = event.currentTarget;

    if (name === 'sort') {
      dispatch(setSortedBy(value));
    }
  };

  return (
    <Collapsible.Advanced
      open={isOpen}
      onToggle={() => setOpen(!isOpen)}
      className="filter-bar collapsible-card-lg border-0"
    >
      <Collapsible.Trigger className="collapsible-trigger border-0">
        <span className="text-primary-700 pr-4">
          {intl.formatMessage(messages.sortFilterStatus, {
            sort: currentSorting,
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
            <Form.RadioSet
              name="sort"
              className="d-flex flex-column list-group list-group-flush"
              value={currentSorting}
              onChange={handleSortFilterChange}
            >
              <ActionItem
                id="sort-activity"
                label={intl.formatMessage(messages.mostActivity)}
                value={LearnersOrdering.BY_LAST_ACTIVITY}
                selected={currentSorting}
              />
              {(userHasModerationPrivileges || userIsGroupTa) && (
                <ActionItem
                  id="sort-reported"
                  label={intl.formatMessage(messages.reportedActivity)}
                  value={LearnersOrdering.BY_FLAG}
                  selected={currentSorting}
                />
              )}
              <ActionItem
                id="sort-recency"
                label={intl.formatMessage(messages.recentActivity)}
                value={LearnersOrdering.BY_RECENCY}
                selected={currentSorting}
              />
            </Form.RadioSet>
          </div>
        </Form>
      </Collapsible.Body>
    </Collapsible.Advanced>
  );
}

LearnerFilterBar.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(LearnerFilterBar);
