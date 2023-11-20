import React, { memo } from 'react';

import { useSelector } from 'react-redux';

import Search from '../../../components/Search';
import withConditionalInContextRendering from '../../common/withConditionalInContextRendering';
import { useCurrentPage } from '../../data/hooks';
import { selectEnableInContext } from '../../data/selectors';
import { TopicSearchBar as IncontextSearch } from '../../in-context-topics/topic-search';

const SearchField = () => {
  const enableInContext = useSelector(selectEnableInContext);
  const page = useCurrentPage();

  return (
    enableInContext && ['topics', 'category'].includes(page) ? <IncontextSearch /> : <Search />
  );
};

export default memo(withConditionalInContextRendering(SearchField, false));
