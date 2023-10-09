import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import messages from './messages';
import { Dropdown  } from '@edx/paragon';
import { getConfig } from '@edx/frontend-platform';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle , faHouse } from '@fortawesome/free-solid-svg-icons';
import SelectLanguage from './SelectLanguage';
import SearchCourse from './SearchCourse';
import { useSelector, useDispatch } from 'react-redux';
import { showGlobalChatGPT } from './data/slice';
import logoChatGPT from './assets/chatGPT.svg'
import ChatGPT from '../chatGPT/ChatGPT';

const AuthenticatedUserDropdown = ({intl,username})=>{

    const dashboardMenuItem = (
        <Dropdown.Item href={`${getConfig().LMS_BASE_URL}/dashboard`}>
             <i class="bi bi-house" ></i>
          {intl.formatMessage(messages.dashboard)}
        </Dropdown.Item>
      );
      const isShowGlobalChatGPT = useSelector(state => state.header.isShowGlobalChatGPT)
      const dispatch = useDispatch()
       
      const handlerChatGPT = ()=>{
    
        dispatch(showGlobalChatGPT())
      }


    return <>
     <div className='d-flex align-items-center ' style={{gap:'1rem'}}>
      <div className="btn-chatGPT" onClick={handlerChatGPT}>
          <span>
              <img src={logoChatGPT} alt='logo-chatGPT' />
          </span>
      </div>
        <SearchCourse />
        <a  className="text-gray-700" href='https://funix.gitbook.io/funix-documentation/' target='_blank'>{intl.formatMessage(messages.help)}</a>
        <SelectLanguage username={username} />
      </div>
              <Dropdown className="user-dropdown ml-3">
        <Dropdown.Toggle variant="outline-primary">
          <FontAwesomeIcon icon={faUserCircle} className="d-md-none" size="lg" />
          <span data-hj-suppress className="d-none d-md-inline">
            {username}
          </span>
        </Dropdown.Toggle>
        <Dropdown.Menu className="dropdown-menu-right">
          
          {dashboardMenuItem}
          
          <Dropdown.Item href={`${getConfig().LMS_BASE_URL}/account/settings`}>
          <i className="bi bi-person"></i>
            {intl.formatMessage(messages.account)}
          </Dropdown.Item>
          
          <Dropdown.Item href={getConfig().LOGOUT_URL}>
          <i className="bi bi-box-arrow-left" ></i>
            {intl.formatMessage(messages.signOut)}
          </Dropdown.Item  >
          
        </Dropdown.Menu>
      </Dropdown>
      <div className={isShowGlobalChatGPT ? 'css-1bljlat' : 'css-16kvbm'}>
            <div className={isShowGlobalChatGPT ? 'css-19dz5pz' : 'css-1dntyew'}>
            <ChatGPT />
            </div>
      </div>
     </>
}
AuthenticatedUserDropdown.propTypes = {
    intl: intlShape.isRequired,
    username: PropTypes.string.isRequired,
  };
  
  AuthenticatedUserDropdown.defaultProps = {
  
  }

export default injectIntl(AuthenticatedUserDropdown);