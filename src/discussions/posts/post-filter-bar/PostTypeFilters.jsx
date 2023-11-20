import React from 'react';
import PropTypes from 'prop-types';

import { useSelector } from 'react-redux';

import { useIntl } from '@edx/frontend-platform/i18n';
import { Form } from '@edx/paragon';

import { ThreadType } from '../../../data/constants';
import { selectThreadFilters } from '../data/selectors';
import ActionItem from './ActionItem';
import messages from './messages';
import withFilterHandleChange from './withFilterHandleChange';

const PostTypeFilters = ({ handleSortFilterChange }) => {
  const intl = useIntl();
  const currentFilters = useSelector(selectThreadFilters());

  return (
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
  );
};

PostTypeFilters.propTypes = {
  handleSortFilterChange: PropTypes.func.isRequired,
};

export default React.memo(withFilterHandleChange(PostTypeFilters));
