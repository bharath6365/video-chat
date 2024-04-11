// Used to show the Call Accepting Screen
import React from 'react'
import { Button, Header, Icon, Modal } from 'semantic-ui-react';


export default function CallReceiving({caller, rejectCall, acceptCall}) {
  console.log('Caller', caller);
  const header = `${caller.userName} is calling you`;
  return (
    <Modal defaultOpen={true} closeOnDimmerClick={false} closeOnDocumentClick={false} basic size="small">
      <Header icon="call" content={header} />
      <Modal.Content>
        <p>Would you like to accept the call?</p>
      </Modal.Content>
      <Modal.Actions>
        <Button onClick={rejectCall} basic color="red" inverted>
          <Icon name="remove" /> No
        </Button>
        <Button onClick={acceptCall} color="green" inverted>
          <Icon name="checkmark" /> Yes
        </Button>
      </Modal.Actions>
    </Modal>
  )
}
