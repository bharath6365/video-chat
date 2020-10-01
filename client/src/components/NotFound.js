import React from 'react';
import { useSnackbar } from 'react-simple-snackbar';
import { snackBarOptions } from '../utils';

export default function NotFound({myStream}) {
  const [ openSnackbar ] = useSnackbar(snackBarOptions);



  const copyLink = () => {
    // Get the current hostname
    const host = window.location.hostname;


    // Copy it to clipboard
      navigator.clipboard.writeText(host).then(function() {

        // Send a notification to the user that it has beeen copied.
        openSnackbar('Url copied');
      });
  }
  return (
    <div className="not-found">
      {
        !myStream && (
          <p>
            You need to give camera and microphone access to see the list of available users.
          </p>
        )
      }
      {myStream && (
        <p>
          Looks like none of the users are online are right now. All you need to do is share this URL with someone that you need to talk to and there name would appear here as soon as they are online.
        </p>
      )}

      <button onClick={copyLink}>Copy Link</button>
    </div>
  )
}
