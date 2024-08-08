import React, { useState } from 'react';

import {
  Hyperlink, Icon, IconButton, IconButtonWithTooltip,
} from '@openedx/paragon';
import { Close, HelpOutline } from '@openedx/paragon/icons';

import { useIntl } from '@edx/frontend-platform/i18n';

import messages from '../discussions/posts/post-editor/messages';

const PostHelpPanel = () => {
  const intl = useIntl();
  const [showHelpPane, setShowHelpPane] = useState(false);

  return (
    <>
      <div className="d-flex justify-content-end">
        <IconButtonWithTooltip
          onClick={() => setShowHelpPane(true)}
          alt={intl.formatMessage(messages.showHelpIcon)}
          tooltipContent={<div>{intl.formatMessage(messages.discussionHelpTooltip)}</div>}
          src={HelpOutline}
          iconAs={Icon}
          size="inline"
          className="float-right p-3 help-icon"
          iconClassNames="help-icon-size"
          data-testid="help-button"
          invertColors
          isActive
        />
      </div>
      {showHelpPane && (
        <div
          className="w-100 p-2 bg-light-200 rounded box-shadow-down-1 post-preview overflow-auto my-3"
          style={{ minHeight: '200px', wordBreak: 'break-word' }}
        >
          <IconButton
            onClick={() => setShowHelpPane(false)}
            alt={intl.formatMessage(messages.actionsAlt)}
            src={Close}
            iconAs={Icon}
            size="inline"
            className="float-right p-3"
            iconClassNames="icon-size"
            data-testid="hide-help-button"
          />
          <div className="pt-2 px-3">
            <h4 className="font-weight-bold">{intl.formatMessage(messages.discussionHelpHeader)}</h4>
            <p className="pt-2">{intl.formatMessage(messages.discussionHelpDescription)}</p>
            <Hyperlink
              target="_blank"
              className="w-100"
              destination="https://support.edx.org/hc/en-us/sections/115004169687-Participating-in-Course-Discussions"
              showLaunchIcon={false}
            >
              {intl.formatMessage(messages.discussionHelpCourseParticipation)}
            </Hyperlink>
            <Hyperlink
              target="_blank"
              className="w-100"
              destination="https://support.edx.org/hc/en-us/articles/360000035267-Entering-math-expressions-in-course-discussions"
              showLaunchIcon={false}
            >
              {intl.formatMessage(messages.discussionHelpMathExpressions)}
            </Hyperlink>
          </div>
        </div>
      )}
    </>
  );
};

export default React.memo(PostHelpPanel);
