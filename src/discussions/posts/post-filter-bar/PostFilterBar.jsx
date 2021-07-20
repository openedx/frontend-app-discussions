import React from 'react';
import PropTypes from 'prop-types';

import { useDispatch, useSelector } from 'react-redux';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Icon } from '@edx/paragon';
import { ArrowDropUpDown } from '@edx/paragon/icons';

import { SelectableDropdown } from '../../../components';
import {
  AllPostsFilter, MyPostsFilter, PostsStatusFilter, ThreadOrdering,
} from '../../../data/constants';
import { buildIntlSelectionList } from '../../utils';
import {
  setAllPostsTypeFilter, setMyPostsTypeFilter, setSortedBy, setStatusFilter,
} from '../data';
import { selectThreadFilters, selectThreadSorting } from '../data/selectors';
import messages from './messages';

function PostFilterBar({
  filterSelfPosts,
  intl,
}) {
  const dispatch = useDispatch();
  const currentSorting = useSelector(selectThreadSorting());
  const currentFilters = useSelector(selectThreadFilters());
  const allPostsFilterOptions = buildIntlSelectionList(AllPostsFilter, intl, messages);
  const myPostsFilterOptions = buildIntlSelectionList(MyPostsFilter, intl, messages);
  const postsStatusFilterOptions = buildIntlSelectionList(PostsStatusFilter, intl, messages);
  const postOrderingOptions = buildIntlSelectionList(ThreadOrdering, intl, messages);
  return (
    <>
      <div className="d-flex flex-row p-1">
        <div className="m-1">
          {filterSelfPosts
            ? (
              <SelectableDropdown
                selected={currentFilters.myPosts}
                options={myPostsFilterOptions}
                onChange={(typeFilter) => dispatch(setMyPostsTypeFilter(typeFilter.value))}
                label={
                  intl.formatMessage(messages[currentFilters.myPosts])
                }
              />
            ) : (
              <SelectableDropdown
                selected={currentFilters.allPosts}
                options={allPostsFilterOptions}
                onChange={(typeFilter) => dispatch(setAllPostsTypeFilter(typeFilter.value))}
                label={intl.formatMessage(messages[currentFilters.allPosts])}
              />
            )}
        </div>
        <div className="flex-fill m-1">
          <SelectableDropdown
            selected={currentFilters.status}
            options={postsStatusFilterOptions}
            onChange={(statusFilter) => dispatch(setStatusFilter(statusFilter.value))}
            label={
              intl.formatMessage(
                messages.filterBy,
                { filterBy: intl.formatMessage(messages[currentFilters.status]) },
              )
            }
          />
        </div>
        <div className="justify-content-end m-1">
          <SelectableDropdown
            selected={currentSorting}
            options={postOrderingOptions}
            onChange={(sortBy) => dispatch(setSortedBy(sortBy.value))}
            label={
              <Icon src={ArrowDropUpDown} aria-label="Sort" title="Sort" />
            }
          />
        </div>
      </div>
      <div className="d-flex flex-row card-header py-1 px-3 small">
        {intl.formatMessage(
          messages.sortedBy,
          { sortBy: intl.formatMessage(messages[currentSorting]) },
        )}
      </div>
    </>
  );
}

PostFilterBar.propTypes = {
  filterSelfPosts: PropTypes.bool,
  intl: intlShape.isRequired,
};

PostFilterBar.defaultProps = {
  filterSelfPosts: false,
};

export default injectIntl(PostFilterBar);
