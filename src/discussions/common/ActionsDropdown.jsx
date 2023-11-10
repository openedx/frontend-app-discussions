import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';

import { useDispatch, useSelector } from 'react-redux';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { logError } from '@edx/frontend-platform/logging';
import {
  Button, Dropdown, Icon, IconButton, ModalPopup, useToggle,Modal, InputSelect , InputText
} from '@edx/paragon';
import { MoreHoriz } from '@edx/paragon/icons';

import { ContentActions } from '../../data/constants';
import { commentShape } from '../comments/comment/proptypes';
import { selectBlackoutDate } from '../data/selectors';
import messages from '../messages';
import { postShape } from '../posts/post/proptypes';
import { inBlackoutDateRange, useActions } from '../utils';
import { DiscussionContext } from './context';


import { resetReport, setDetails, setType, addReports } from './data/slice';
function ActionsDropdown({
  intl,
  commentOrPost,
  disabled,
  actionHandlers,
}) {
  const [isOpen, open, close] = useToggle(false);
  const [target, setTarget] = useState(null);
  const actions = useActions(commentOrPost);
  const { inContext } = useContext(DiscussionContext);
  const handleActions = (action) => {
    const actionFunction = actionHandlers[action];
    if (actionFunction) {
      actionFunction();
    } else {
      logError(`Unknown or unimplemented action ${action}`);
    }
  };
  const blackoutDateRange = useSelector(selectBlackoutDate);
  // Find and remove edit action if in blackout date range.
  if (inBlackoutDateRange(blackoutDateRange)) {
    actions.splice(actions.findIndex(action => action.id === 'edit'), 1);
  }

  // model report 
  const [modelReport , setModalReport] = useState(false)
  const typeReport = [intl.formatMessage(messages.duplicationReport), intl.formatMessage(messages.inappropriateReport)]
  const dispatch = useDispatch()
  const reportSelector = useSelector(state=>state.report)

  const handlerModalReport =(action)=>{
    close()
    setModalReport(true)
    dispatch(setType(typeReport[0]))
    
  }
// console.log(useSelector(state=>state))
  const handlerReport = ()=>{
    const actionFunction = actionHandlers['abuse_flagged'];
    if (actionFunction) {
      actionFunction();
      dispatch(addReports({id:commentOrPost.id , type : reportSelector.type }))
    } else {
      logError(`Unknown or unimplemented action ${'abuse_flagged'}`);
    }
    setModalReport(false)
    
    dispatch(resetReport())
  }

  return (
    <>
      <IconButton
        onClick={open}
        alt={intl.formatMessage(messages.actionsAlt)}
        src={MoreHoriz}
        iconAs={Icon}
        disabled={disabled}
        size="sm"
        ref={setTarget}
      />
      <ModalPopup
        onClose={close}
        positionRef={target}
        isOpen={isOpen}
        placement={inContext ? 'left' : 'auto-start'}
      >
        <div
          className="bg-white p-1 shadow d-flex flex-column"
          data-testid="actions-dropdown-modal-popup"
        >
          {actions.map(action => (
            <React.Fragment key={action.id}>
              {action.action === ContentActions.DELETE
              && <Dropdown.Divider />}
             <Dropdown.Item
                as={Button}
                variant="tertiary"
                size="inline"
                // onClick={() => {
                //   close();
                //   handleActions(action);
                // }}
                onClick={() => {
                  close();
                  const actionHandler = action.id !== 'report' ? handleActions : handlerModalReport;
                  actionHandler(action.action);
                }}
                className="d-flex justify-content-start py-1.5 mr-4"
              >
                <Icon src={action.icon} className="mr-1" /> {intl.formatMessage(action.label)}
              </Dropdown.Item>
              
            </React.Fragment>
          ))}
        </div>
      </ModalPopup>

      <div>
         <Modal
              open ={modelReport}
              title={intl.formatMessage(messages.titleModalReport)}
              closeText = {intl.formatMessage(messages.closeModalReport)}
              body={<div>
                  <InputSelect
                    name="type_report"
                    label={intl.formatMessage(messages.labelModalReport)}
                    value={typeReport[0]}
                    options={typeReport}
                    onChange={(e)=>dispatch(setType(e))}
                  />
                  <InputText name="details_report" value={reportSelector.details} label={intl.formatMessage(messages.detailModalReport)}  onChange={(e)=>dispatch(setDetails(e))}/>
              </div>}
              buttons={[
                <Button onClick={handlerReport} variant="primary">{intl.formatMessage(messages.submitModalReport)}</Button>,
              ]}
              
              onClose={() => {setModalReport(false)
                              dispatch(resetReport())}}
              
            />

      
      </div>
    </>
  );
}

ActionsDropdown.propTypes = {
  intl: intlShape.isRequired,
  commentOrPost: PropTypes.oneOfType([commentShape, postShape]).isRequired,
  disabled: PropTypes.bool,
  actionHandlers: PropTypes.objectOf(PropTypes.func).isRequired,
};

ActionsDropdown.defaultProps = {
  disabled: false,
};

export default injectIntl(ActionsDropdown);
