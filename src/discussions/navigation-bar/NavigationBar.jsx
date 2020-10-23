import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import SearchField from '@edx/paragon/dist/SearchField';
import { faSortAmountDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import { NavLink } from 'react-router-dom';
import { SelectableDropdown } from '../../components';
import { Routes, ThreadOrdering } from '../../data/constants';
import { buildIntlSelectionList } from '../utils';
import messages from './messages';

function NavigationBar({ intl, courseId }) {
  const threadOrderingOptions = buildIntlSelectionList(ThreadOrdering, intl, messages);
  return (
    <div className="navigation-bar d-flex flex-column">
      <ul className="nav">
        <li className="nav-item">
          <NavLink className="nav-link" to={Routes.POSTS.MY_POSTS.replace(':courseId', courseId)}>
            { intl.formatMessage(messages.my_posts) }
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink className="nav-link" to={Routes.POSTS.ALL_POSTS.replace(':courseId', courseId)}>
            { intl.formatMessage(messages.all_posts) }
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink className="nav-link" to={Routes.TOPICS.ALL.replace(':courseId', courseId)}>
            { intl.formatMessage(messages.all_topics) }
          </NavLink>
        </li>
      </ul>
      <div className="d-flex">
        <SearchField onSubmit={() => null} />
        <SelectableDropdown
          label={<FontAwesomeIcon icon={faSortAmountDown} />}
          defaultOption={ThreadOrdering.BY_LAST_ACTIVITY}
          options={threadOrderingOptions}
        />
      </div>
      <div className="d-flex">
        {/* TODO: hook into store */ }
        { intl.formatMessage(messages.sorted_by, { sortBy: 'something' }) }
      </div>
    </div>
  );
}

NavigationBar.propTypes = {
  courseId: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(NavigationBar);
