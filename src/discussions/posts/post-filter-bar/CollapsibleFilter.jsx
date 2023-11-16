import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import { capitalize, toString } from 'lodash';
import { useSelector } from 'react-redux';

import { useIntl } from '@edx/frontend-platform/i18n';
import { Collapsible, Icon } from '@edx/paragon';
import { Tune } from '@edx/paragon/icons';

import { selectCourseCohorts } from '../../cohorts/data/selectors';
import { selectThreadFilters, selectThreadSorting } from '../data/selectors';
import messages from './messages';

const CollapsibleFilter = ({ children }) => {
  const intl = useIntl();
  const currentSorting = useSelector(selectThreadSorting());
  const currentFilters = useSelector(selectThreadFilters());
  const cohorts = useSelector(selectCourseCohorts);
  const [isOpen, setOpen] = useState(false);

  const selectedCohort = useMemo(() => (
    cohorts.find(cohort => (
      toString(cohort.id) === currentFilters.cohort
    ))
  ), [cohorts, currentFilters.cohort]);

  const handleToggle = useCallback(() => {
    setOpen(!isOpen);
  }, [isOpen]);

  return (
    <Collapsible.Advanced
      open={isOpen}
      onToggle={handleToggle}
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
        <span id="icon-tune">
          <Collapsible.Visible whenClosed>
            <Icon src={Tune} />
          </Collapsible.Visible>
          <Collapsible.Visible whenOpen>
            <Icon src={Tune} />
          </Collapsible.Visible>
        </span>
      </Collapsible.Trigger>
      <Collapsible.Body className="collapsible-body px-4 pb-3 pt-0">
        {children}
      </Collapsible.Body>
    </Collapsible.Advanced>
  );
};

CollapsibleFilter.propTypes = {
  children: PropTypes.node.isRequired,
};

export default React.memo(CollapsibleFilter);
