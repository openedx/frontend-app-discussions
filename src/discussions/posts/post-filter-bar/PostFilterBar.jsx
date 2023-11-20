import React from 'react';

import { Form } from '@edx/paragon';

import CohortFilters from './CohortFilters';
import CollapsibleFilter from './CollapsibleFilter';
import PostSortFilters from './PostSortFilters';
import PostStatusFilters from './PostStatusFilters';
import PostTypeFilters from './PostTypeFilters';

const PostFilterBar = () => (
  <CollapsibleFilter>
    <Form>
      <div className="d-flex flex-row py-2 justify-content-between">
        <PostTypeFilters />
        <PostStatusFilters />
        <PostSortFilters />
      </div>
      <CohortFilters />
    </Form>
  </CollapsibleFilter>
);

export default React.memo(PostFilterBar);
