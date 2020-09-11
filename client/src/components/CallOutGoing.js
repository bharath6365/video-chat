import React from 'react';
import { Header, Modal } from 'semantic-ui-react';

export default function CallOutGoing() {
  return (
    <Modal defaultOpen={true} closeOnDimmerClick={false} closeOnDocumentClick={false} basic size="small">
      <Header icon="call" content="Calling the user..." />
      <Modal.Content>
        <p>Hang on tight.</p>
      </Modal.Content>
    </Modal>
  );
}
