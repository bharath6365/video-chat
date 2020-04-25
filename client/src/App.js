import React, { useEffect, useState, useRef } from 'react';
import { Button, Header, Icon, Modal } from 'semantic-ui-react';
import './App.scss';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import styled from 'styled-components';
import MyButton from './components/Button';
import UserList from './components/UserList';
import CallCut from './images/call-cut.png';

const Container = styled.div`
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const Row = styled.div`
  display: flex;
  width: 100%;
`;

const VideoWrapper = styled.div`
  width: 50%;
  height: 400px;
  position: relative;
`;

const Video = styled.video`
  position: absolute;
  right: 0;
  bottom: 0;
  height: 100%;
  width: 100%;
  object-fit: cover;
`;

function App({ history }) {
  const name = localStorage.getItem('name') || sessionStorage.getItem('name');
  if (!name) {
    history.push('/');
  }

  // Our ID.
  const [ yourID, setYourID ] = useState('');

  // List of all the users retreived from the backend.
  const [ users, setUsers ] = useState({});

  // Stream from our audio and video.
  const [ stream, setStream ] = useState();

  // Call Received from some other user.
  const [ receivingCall, setReceivingCall ] = useState(false);

  // Related to Call Accepting.
  const [ caller, setCaller ] = useState({});
  const [ callerSignal, setCallerSignal ] = useState();

  // Aren't caller and partner same?
  const [ partner, setPartner ] = useState(null);

  // Flag to decide whether to accept the call.
  const [ callAccepted, setCallAccepted ] = useState(false);

  // Peer object later used to close calls.
  const [ peer, setPeer ] = useState(null);

  const userVideo = useRef();
  const partnerVideo = useRef();
  const socket = useRef();

  useEffect(() => {
    // In Development. This is forwarded to the backend by create react app.

    //When setting up the initial connection pass on the user name.
    socket.current = io.connect('/', { query: `userName=${name}` });

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        // Loads our Video.
        setStream(stream);
        if (userVideo.current) {
          userVideo.current.srcObject = stream;
        }
      })
      .catch(() => {
        alert('This application needs webcam and microphone access to work. Do not worry about your privacy.');
      });

    // Computed by the backend.
    socket.current.on('yourID', (id) => {
      setYourID(id);
    });
    socket.current.on('allUsers', (users) => {
      setUsers(users);
    });

    // When someone else rejects/disconnects your call.
    socket.current.on('partnerDisconnected', (data) => {
      setPartner(null);
    });

    /* When someone is calling you this is run or you are being called by someone else. You get the signal of the other user which you must accept. You are not the initiator.
      TODO: Refactor "hey" to a better name
    */

    socket.current.on('hey', (data) => {
      // Will tell the user that someone's calling.
      setReceivingCall(true);
      // Set the caller to be displayed.
      setCaller({
        id: data.from,
        name: data.name
      });
      setCallerSignal(data.signal);
      setPartner(data.from);
    });
  }, []);

  function callPeer(peerID, stream) {
    /* 
    Whenever we want to call a peer first we need to send a signal to someone that
    we are interested in talking to them. We do that by creating a peer (WebRTC) and then
    we pass it on to the other client through the socket (Server). The other client needs to accept our call and then he will send a signal over to you. When you call peer.signal(signal) and the other person calls peer.signal() you both are connected.
    */
    const peer = new Peer({
      // I'm initiating the call
      initiator: true,
      trickle: false,
      stream: stream
    });

    setPeer(peer);

    // This is the handshake that the other peer needs to accept.
    // We are also passing on stream data which the other peer must accept.
    peer.on('signal', (data) => {
      const callData = {
        userIdToCall: peerID,
        signalData: data,
        from: yourID,
        name
      };

      socket.current.emit('callUser', callData);
    });

    // As soon as we receive a stream from the other user. Set it
    peer.on('stream', (partnerStream) => {
      if (partnerVideo.current) {
        partnerVideo.current.srcObject = partnerStream;
      }
    });

    socket.current.on('callAccepted', (data) => {
      /*
        Connection finally established. You are the initiator and the person you wanted to
        talk with has accepted your request and sent his signal you need to do the handshake.
      */
      console.log('Call Accepted data is', data);
      peer.signal(data.signal);
      setPartner(data.from);
      setCallAccepted(true);
    });
  }

  function acceptCall() {
    setCallAccepted(true);
    setReceivingCall(false);
    // You are now some other peer (Not the initiator). You have your own stream that the other person must accept. Remember for Web RTC to work the person who initiated the call should also accept thee request.
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream
    });

    setPeer(peer);

    peer.on('signal', (data) => {
      socket.current.emit('acceptCall', {
        signal: data,
        to: caller.id,
        from: yourID
      });
    });

    peer.on('stream', (stream) => {
      partnerVideo.current.srcObject = stream;
    });

    // Add a disconnect method.

    peer.signal(callerSignal);
  }

  // TODO: Send some feedback to the person who called.
  function rejectCall() {
    setReceivingCall(false);
  }

  // Triggered only when user manually clicks on disconnect call button.
  function disconnectCall() {
    // Send an event to the server that user disconected.
    socket.current.emit('disconnectCall', caller);
    peer.destroy();
    setPartner(null);
  }

  // Returns a list of people that we can call.
  // TODO: Add Styling
  function showUsersToCall() {
    return <UserList users={users} yourID={yourID} handleClick={callPeer} yourStream={stream} />;
  }

  let UserVideo;
  if (stream) {
    UserVideo = <Video playsInline muted ref={userVideo} autoPlay />;
  }

  let incomingCall;

  // TODO: Move it to a separate component.
  // Triggered by the listening to the hey event sent by the server.
  if (receivingCall) {
    const header = `${caller.name} is calling you`;
    incomingCall = (
      <Modal 
        defaultOpen={true} 
        closeOnDimmerClick={false} 
        closeOnDocumentClick={false} 
        basic 
        size="small"
      >
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
    );
  }

  /* 
  Time to Render everything. We have a few things to decide.
  1) Show Partner Video flag
  2) Partner Disconnected State. Go back to the state where we show only the host video.
  */
  // showPartner video flag.
  const showPartnerVideo = callAccepted && partner && users[partner];

  const partnerDisconnected = callAccepted && partner && !users[partner];
  if (partnerDisconnected) {
    // Todo: Find a better way. Host Stream freezes.
    window.location.reload();
  }
  return (
    <Container>
      <Row className="video-section-wrapper">
        {/* Different styling when host video is*/}
        {
          <VideoWrapper
            className={`
                host-video-wrapper
                ${showPartnerVideo ? 'connected' : ''}
              `}
          >
            {UserVideo}
          </VideoWrapper>
        }

        {showPartnerVideo && (
          <VideoWrapper className="partner-video-wrapper">
            <Video playsInline ref={partnerVideo} autoPlay />
            <img onClick={() => disconnectCall()} className="call-cut" src={CallCut} />
          </VideoWrapper>
        )}
      </Row>

      {partnerDisconnected && <h2>User Disconnected...</h2>}

      {showUsersToCall()}
      <Row>{incomingCall}</Row>
    </Container>
  );
}
export default App;
