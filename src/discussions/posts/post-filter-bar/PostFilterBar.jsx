import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import React from 'react';
import PropTypes from 'prop-types';
import { buildIntlSelectionList } from '../../utils';
import { SelectableDropdown } from '../../../components/selectable-dropdown';
import {
  MyPostsFilter,
  AllPostsFilter,
  PostsStatusFilter,
  PostOrdering,
} from '../../../data/constants';
import messages from './messages';

function PostFilterBar({ filterSelfPosts, intl }) {
  let postsFilterOptions = buildIntlSelectionList(AllPostsFilter, intl, messages);
  let defaultPostFilter = AllPostsFilter.ALL_POSTS;
  if (filterSelfPosts) {
    postsFilterOptions = buildIntlSelectionList(MyPostsFilter, intl, messages);
    defaultPostFilter = MyPostsFilter.MY_POSTS;
  }

  const postsStatusFilterOptions = buildIntlSelectionList(PostsStatusFilter, intl, messages);
  const postOrderingOptions = buildIntlSelectionList(PostOrdering, intl, messages);

  return (
    <div className="d-flex flex-row card-header p-1">
      <div className="m-1">
        <SelectableDropdown
          defaultOption={defaultPostFilter}
          options={postsFilterOptions}
          onChange={() => null}
          label={
            intl.formatMessage(
              messages[defaultPostFilter],
            )
          }
        />
      </div>
      <div className="flex-fill m-1">
        <SelectableDropdown
          defaultOption={PostsStatusFilter.ALL}
          options={postsStatusFilterOptions}
          onChange={() => null}
          label={
            intl.formatMessage(
              messages.filter_by,
              { filterBy: intl.formatMessage(messages[PostsStatusFilter.ALL]) },
            )
          }
        />
      </div>
      <div className="justify-content-end m-1">
        <SelectableDropdown
          defaultOption={PostOrdering.BY_LAST_ACTIVITY}
          options={postOrderingOptions}
          onChange={() => null}
          label={
            intl.formatMessage(
              messages.sorted_by,
              { sortBy: intl.formatMessage(messages[PostOrdering.BY_LAST_ACTIVITY]) },
            )
          }
        />
      </div>
    </div>
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
