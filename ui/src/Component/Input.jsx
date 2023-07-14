import React from 'react'

const Input = ({setNewText}) => {


//Send message 
const handleInputText=(e)=>{
  e.preventDefault();
 
}
const handleChange = (e) => {
  setNewText(e.target.value);
};

  return (
    <form className='input' onSubmit={handleInputText}>
      <input type="text" placeholder='Type Something...'  onChange={handleChange} />
      <div className="send">
    
        <input type="file" style={{display:"none"}}  id="file" />
        <label htmlFor="file">
           <i className="ri-attachment-line"></i>
        </label>
        <button type='submit'>Send</button>
      </div>
    </form>
  )
}

export default Input
