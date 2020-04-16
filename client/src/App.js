import React, { useEffect, useState, useRef } from 'react';
import './App.scss';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import styled from 'styled-components';
import Button from './components/Button';
import UserList from './components/UserList';

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
  border: 1px solid blue;
  width: 50%;
  height: 400px;
  position: relative;
`;

const Video = styled.video`
  position: absolute;
  right: 0; 
  bottom: 0;
  min-width: 100%; 
  min-height: 100%;
  width: auto; 
  height: auto; 
  z-index: -100;
  background-size: cover;
`;

function App() {
  // Our ID.
  const name = localStorage.getItem("name") || sessionStorage.getItem("name");
  const [ yourID, setYourID ] = useState('');

  // List of all the users retreived from the backend.
  const [ users, setUsers ] = useState({});

  // Stream from our audio and video.
  const [ stream, setStream ] = useState();

  // Call Received from some other user.
  const [ receivingCall, setReceivingCall ] = useState(false);

  //
  const [ caller, setCaller ] = useState({});
  const [ callerSignal, setCallerSignal ] = useState();

  // Flag to decide whether to accept the call.
  const [ callAccepted, setCallAccepted ] = useState(false);

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

    /* When someone is calling you this is run or you are being called by someone else. You get the signal of the other user which you must accept.
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

    socket.current.on('callAccepted', (partnerSignal) => {
      // Connection finally established. This is the CRUX.
      peer.signal(partnerSignal);
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

    peer.on('signal', (data) => {
      socket.current.emit('acceptCall', {
        signal: data,
        to: caller.id
      });
    });

    peer.on('stream', (stream) => {
      partnerVideo.current.srcObject = stream;
    });

    peer.signal(callerSignal);
  }

  function rejectCall() {
    setReceivingCall(false);
  }

  // Returns a list of people that we can call.
  // TODO: Add Styling
  function showUsersToCall() {
    return (
      // <Row>
      //   {Object.keys(users).map((key) => {
      //     // You dont want to call yourself for heaven sake.
      //     if (key === yourID) {
      //       return null;
      //     }
      //     const userName = users[key].name;
      //     return <Button handleClick={() => callPeer(key, stream)}>Call {userName}</Button>;
      //   })}
      // </Row>
      <UserList 
        users={users}
        yourID={yourID}
        handleClick={callPeer}
        yourStream={stream}
      />
    );
  }

  let UserVideo;
  if (stream) {
    UserVideo = <Video playsInline muted ref={userVideo} autoPlay />;
  }

  let PartnerVideo;
  if (callAccepted) {
    PartnerVideo = 
    (
      <VideoWrapper>
        <Video playsInline ref={partnerVideo} autoPlay />
      </VideoWrapper>
    );
  }

  let incomingCall;

  // TODO: Move it to a separate component.
  // Triggered by the listening to the hey event sent by the server.
  if (receivingCall) {
    incomingCall = (
      <div className="incoming-call-wrapper">
        <h1>{caller.name} is calling you</h1>
        <Button handleClick={acceptCall} variant="primary">
          Accept
        </Button>
        <Button handleClick={rejectCall} variant="secondary">
          Reject
        </Button>
      </div>
    );
  }
  return (
    <Container>
      <Row>
        <VideoWrapper>
          {UserVideo}
        </VideoWrapper>
        {PartnerVideo}
      </Row>
      {showUsersToCall()}
      <Row>{incomingCall}</Row>
    </Container>
  );
}
export default App;
