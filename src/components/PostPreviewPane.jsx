import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button } from '@edx/paragon';
import { Close } from '@edx/paragon/icons';

import messages from '../discussions/posts/post-editor/messages';
import HTMLLoader from './HTMLLoader';

function PostPreviewPane({ htmlNode, intl, isPost }) {
  const [showPreviewPane, setShowPreviewPane] = useState(false);

  return (
    <>
      {showPreviewPane && (
        <div className={`p-2 bg-light-200 rounded shadow-sm ${isPost ? 'mt-3 mb-5.5' : 'my-3'}`} style={{ maxHeight: '200px', overflow: 'scroll' }}>
          <Close onClick={() => setShowPreviewPane(false)} className="float-right text-primary-500 mb" />
          <HTMLLoader htmlNode={htmlNode} />
        </div>
      )}
      <div className="d-flex justify-content-end">
        {!showPreviewPane
        && (
          <Button
            variant="link"
            size="md"
            onClick={() => setShowPreviewPane(true)}
            className="text-primary-500"
          >
            {intl.formatMessage(messages.showPreviewButton)}
          </Button>
        )}
      </div>
    </>
  );
}

PostPreviewPane.propTypes = {
  intl: intlShape.isRequired,
  htmlNode: PropTypes.node.isRequired,
  isPost: PropTypes.bool,
};

PostPreviewPane.defaultProps = {
  isPost: false,
};

export default injectIntl(PostPreviewPane);
