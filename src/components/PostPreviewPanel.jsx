import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { Button, Icon, IconButton } from '@openedx/paragon';
import { Close } from '@openedx/paragon/icons';

import { useIntl } from '@edx/frontend-platform/i18n';

import messages from '../discussions/posts/post-editor/messages';
import HTMLLoader from './HTMLLoader';

const PostPreviewPanel = ({
  htmlNode, isPost, editExisting,
}) => {
  const intl = useIntl();
  const [showPreviewPane, setShowPreviewPane] = useState(false);

  return (
    <>
      {showPreviewPane && (
        <div
          className={`w-100 p-2 bg-light-200 rounded box-shadow-down-1 post-preview overflow-auto ${isPost ? 'mt-2 mb-5' : 'my-3'}`}
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
            data-testid="hide-preview-button"
          />
          {htmlNode && (
            <HTMLLoader
              htmlNode={htmlNode}
              cssClassName="text-primary"
              componentId="post-preview"
              testId="post-preview"
              delay={500}
            />
          )}
        </div>
      )}
      <div className="d-flex justify-content-end">
        {!showPreviewPane && (
          <Button
            variant="link"
            size="sm"
            onClick={() => setShowPreviewPane(true)}
            className={`text-primary-500 font-style p-0 ${editExisting && 'mb-4.5'}`}
            style={{ lineHeight: '26px' }}
            data-testid="show-preview-button"
          >
            {intl.formatMessage(messages.showPreviewButton)}
          </Button>
        )}
      </div>
    </>
  );
};

PostPreviewPanel.propTypes = {
  htmlNode: PropTypes.node,
  isPost: PropTypes.bool,
  editExisting: PropTypes.bool,
};

PostPreviewPanel.defaultProps = {
  htmlNode: '',
  isPost: false,
  editExisting: false,
};

export default React.memo(PostPreviewPanel);
