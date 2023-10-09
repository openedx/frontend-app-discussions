import { useState } from 'react';
import './boxChat.scss'

const BoxChat = ()=>{


    const [message, setMessage] = useState('');

    const handleSubmit = (e) => {
      e.preventDefault();
      
      console.log('Message submitted:', message);
    };
  
    const handleTextareaChange = (e) => {
      setMessage(e.target.value);
    };
  
    const handleTextareaKeyPress = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
        
      }
    };


    return <>
        <div className="p-3 d-flex flex-column border-bottom box-message " >
            
        <div className="message" >
            <div className='time'>
                <span>Time</span>
            </div>
            <div className='text'>
                <span>
                    messages
                </span>
            </div>
        </div>

        <div className='result-message'>
            
                <div className='text'>
                    <span>
                        result-message
                    </span>
                </div>
            
        </div>

    </div>

    <div className='p-3'>
            <form onSubmit={handleSubmit}>
                <label className='' style={{fontWeight:'600'}}>Type message</label>
                <div className='type-message'>
                    <textarea 
                        value={message}
                        onChange={handleTextareaChange}
                        onKeyPress={handleTextareaKeyPress}
                    ></textarea>
                </div>
                <div>
                    <button disabled={message.length == 0} id='btn-message' type='submit'>Send</button>
                </div>
            </form>
    </div>
    </>
}

export default BoxChat