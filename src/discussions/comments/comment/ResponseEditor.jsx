import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';
import { useSelector } from 'react-redux';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button } from '@edx/paragon';

import { DiscussionContext } from '../../common/context';
import {
  selectBlackoutDate, selectIsCourseAdmin,
  selectIsCourseStaff, selectUserHasModerationPrivileges, selectUserIsGroupTa, selectUserIsStaff,
} from '../../data/selectors';
import { handleAddPostForRoles, inBlackoutDateRange } from '../../utils';
import messages from '../messages';
import CommentEditor from './CommentEditor';

function ResponseEditor({
  postId,
  intl,
  addWrappingDiv,
}) {
  const { inContext } = useContext(DiscussionContext);
  const [addingResponse, setAddingResponse] = useState(false);
  const blackoutDateRange = useSelector(selectBlackoutDate);
  const isUserAdmin = useSelector(selectUserIsStaff);
  const userHasModerationPrivilages = useSelector(selectUserHasModerationPrivileges);
  const isUserGroupTA = useSelector(selectUserIsGroupTa);
  const isCourseAdmin = useSelector(selectIsCourseAdmin);
  const isCourseStaff = useSelector(selectIsCourseStaff);

  useEffect(() => {
    setAddingResponse(false);
  }, [postId]);

  const hasPrivilege = handleAddPostForRoles(isUserAdmin, userHasModerationPrivilages,
    isUserGroupTA, isCourseAdmin, isCourseStaff);

  const handleAddResponse = () => {
    if ((!(inBlackoutDateRange(blackoutDateRange)))) {
      return true;
    }
    if (hasPrivilege) {
      return true;
    }
    return false;
  };

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
    : handleAddResponse() && (
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
