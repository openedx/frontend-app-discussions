import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';
import { useSelector } from 'react-redux';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button } from '@edx/paragon';

import { DiscussionContext } from '../../common/context';
import { selectBlackoutDate } from '../../data/selectors';
import { inBlackoutDateRange } from '../../utils';
import messages from '../messages';
import CommentEditor from './CommentEditor';

function ResponseEditor({
  postId,
  intl,
  addWrappingDiv,
}) {
  const { inContext } = useContext(DiscussionContext);
  const [addingResponse, setAddingResponse] = useState(false);

  useEffect(() => {
    setAddingResponse(false);
  }, [postId]);

  const blackoutDateRange = useSelector(selectBlackoutDate);

  return addingResponse
    ? (
      <div className={classNames({ 'bg-white p-4 mb-4 rounded': addWrappingDiv })}>
        <CommentEditor
          comment={{ threadId: postId }}
          edit={false}
          onCloseEditor={() => setAddingResponse(false)}
        />
      </div>
    )
    : !inBlackoutDateRange(blackoutDateRange) && (
      <div className={classNames({ 'mb-4': addWrappingDiv }, 'actions d-flex')}>
        <Button
          variant="primary"
          className={classNames('px-2.5 py-2 font-size-14', { 'w-100': inContext })}
          onClick={() => setAddingResponse(true)}
          style={{
            lineHeight: '20px',
          }}
        >
          {intl.formatMessage(messages.addResponse)}
        </Button>
      </div>
    );
}

ResponseEditor.propTypes = {
  postId: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
  addWrappingDiv: PropTypes.bool,
};

ResponseEditor.defaultProps = {
  addWrappingDiv: false,
};

export default injectIntl(ResponseEditor);
