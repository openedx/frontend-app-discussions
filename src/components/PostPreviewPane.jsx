import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button, Icon, IconButton } from '@edx/paragon';
import { Close } from '@edx/paragon/icons';

import messages from '../discussions/posts/post-editor/messages';
import HTMLLoader from './HTMLLoader';

function PostPreviewPane({
  htmlNode, intl, isPost, editExisting,
}) {
  const [showPreviewPane, setShowPreviewPane] = useState(false);

  return (
    <>
      {showPreviewPane && (
        <div
          className={`w-100 p-2 bg-light-200 rounded box-shadow-down-1 post-preview ${isPost ? 'mt-2 mb-5' : 'my-3'}`}
          style={{ minHeight: '200px', wordBreak: 'break-word' }}
        >
          <IconButton
            onClick={() => setShowPreviewPane(false)}
            alt={intl.formatMessage(messages.actionsAlt)}
            src={Close}
            iconAs={Icon}
            size="inline"
            className="float-right p-3"
            iconClassNames="icon-size"
          />
          <HTMLLoader htmlNode={htmlNode} cssClassName="text-primary" />
        </div>
      )}
      <div className="d-flex justify-content-end">
        {!showPreviewPane
        && (
          <Button
            variant="link"
            size="md"
            onClick={() => setShowPreviewPane(true)}
            className={`text-primary-500 px-0 ${editExisting && 'mb-4.5'}`}
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
  editExisting: PropTypes.bool,
};

PostPreviewPane.defaultProps = {
  isPost: false,
  editExisting: false,
};

export default injectIntl(PostPreviewPane);
