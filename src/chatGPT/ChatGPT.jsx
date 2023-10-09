import logoChatGPT from '../header/assets/chatGPT.svg'
import BoxChat from './box-chat/BoxChat'
import { useDispatch } from 'react-redux'
import './chatGPT.scss'
import { closeChatGPT, showGlobalChatGPT } from '../header/data/slice'
const ChatGPT = ()=>{
    const dispatch = useDispatch()

    const handlerCloseChat = ()=>{
        dispatch(closeChatGPT())
    }
    return <div className='d-flex flex-column'>
        <div className='d-flex justify-content-between border-bottom p-3' >
            <div className='d-flex ' style={{gap:'20px'}}>
                <div>
                    <img src={logoChatGPT} alt='logo-chatgpt' width='100%'/>
                </div>
                <div className='d-flex flex-column'>
                    <span className='font-weight-bold' style={{fontSize:'24px'}}>
                        Chat GPT
                    </span>
                    <span className='' style={{fontSize:'12px' , marginTop:'-4px'}}>
                        Powered by <a href='#'>OpenAI</a>
                    </span>
                </div>
            </div>
            <div >
                <button className='close-btn' onClick={handlerCloseChat} >
                    <i class="bi bi-x-lg"></i>
                </button>
            </div>
        </div>

        
        <div>
           <BoxChat />
        </div>
        <div className='px-3'>
            <div className='pt-2 border-top d-flex flex-column'>
            </div>
        </div>
    </div>
}

export default ChatGPT