import { useEffect, useState  } from 'react';
import './headerLearning.scss'
import PropTypes from 'prop-types';
import { fetchLanguage } from './data/thunks';
import flag_vn from './assets/vietnam-flag-icon.svg'
import flag_en from './assets/united-kingdom-flag-icon.svg'
import Cookies from 'js-cookie';

const optionsLanguage = [{
    code: 'vi' ,
    flag : flag_vn,
    name: 'VN'
} ,{
    code:'en',
    flag:flag_en ,
    name:'EN'
}

]

const SelectLanguage = ({ username }) => {
    const [showOptions, setShowOptions] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
  
    useEffect(async () => {
      try {
        const data = await fetchLanguage(username);
        setSelectedOption(data['pref-lang']);
      } catch (error) {
        console.log(error);
      }
    }, [username]);
  
    useEffect(() => {
      if (selectedOption == null) {
        setSelectedOption('');
      }
    }, [selectedOption]);
  
    const handlerSelect = () => {
      setShowOptions(!showOptions);
    };
  
    useEffect(() => {
      const clickOutsideHandler = () => {
        setShowOptions(false);
      };
      if (showOptions) {
        window.addEventListener('click', clickOutsideHandler);
      } else {
        window.removeEventListener('click', clickOutsideHandler);
      }
      return () => {
        window.removeEventListener('click', clickOutsideHandler);
      };
    }, [showOptions]);
  
    const handlerOption = (e) => {
      setSelectedOption(e.code);
      setShowOptions(false);
      Cookies.set('openedx-language-preference', e.code);
      window.location.reload();
    };
  
    return (
      <div className='custom-selected'>
        <div className='select-selected' onClick={() => handlerSelect(selectedOption)}>
          <span>
            <img
              src={optionsLanguage.find((e) => e.code === selectedOption)?.flag}
              alt={selectedOption}
            />
          </span>
          {selectedOption
            ? optionsLanguage.find((e) => e.code === selectedOption).name.toUpperCase()
            : ''}
        </div>
        {showOptions && (
          <div className='select-options'>
            {optionsLanguage.map((e) => {
              return (
                <div key={e.code} className='option' onClick={() => handlerOption(e)}>
                  <span>
                    <img src={e.flag} alt={e.name} />
                  </span>
                  {e.name}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };


SelectLanguage.propTypes = {
  
    username: PropTypes.string.isRequired,
  };
  

export default SelectLanguage
