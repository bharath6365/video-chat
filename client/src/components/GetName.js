import React, {useState, useRef} from 'react'
/*
  We might prompt the user to enter the name everytime he enters the app or he can decide to persist the name for subsequent logins. 
*/
export default function GetName() {
  const checkboxRef = useRef();
  // Name change.
  const handleChange = (e) => {
    setName(e.target.value);
  }
  
  // Form Submission.
  const handleSubmit = (e) => {
    e.preventDefault();
    const isChecked = checkboxRef.current.checked;

    if (isChecked) {
      localStorage.setItem("name", name);
    } else {
      sessionStorage.setItem("name", name);
    }
    redirect();
  }

  // Redirect to chat route.
  // TODO: Don't let the page reload.
  const redirect = () => {
    window.location.href = "/chat";
  }

  const [name, setName] = useState('');
  return (
    <div className="name-form-container">
      <form onSubmit={handleSubmit}>
        <fieldset>
          <input required type="text" autoFocus name="name" placeholder="Enter your name" value={name} 
            onChange={handleChange}
          />
        </fieldset>

        <fieldset className="checkbox-fieldset">
          <label>
            Remember your name for subsequent logins?
          </label>
          <div className="checkbox-wrapper">
            <input ref={checkboxRef} type="checkbox" />
            <span></span>
          </div>
          
        </fieldset>
      </form>
    </div>
  )
}
