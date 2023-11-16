import React, { memo } from 'react';

import Footer from '@edx/frontend-component-footer';

import withConditionalInContextRendering from '../common/withConditionalInContextRendering';

const DiscussionFooter = () => <Footer />;

export default memo(withConditionalInContextRendering(DiscussionFooter, false));
