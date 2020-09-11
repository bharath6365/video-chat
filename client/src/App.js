import React, { useEffect, useState, useRef } from 'react';
import './App.scss';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import { useSnackbar } from 'react-simple-snackbar';

import { snackBarOptions } from './utils';
import UserList from './components/UserList';
import CallCut from './images/call-cut.png';
import useUserMedia from './effects/user-media';
import CallReceiving from './components/CallReceiving';
import CallOutGoing from './components/CallOutGoing';


function App({ history }) {
  const name = localStorage.getItem('name') || sessionStorage.getItem('name');
  const avatarNumber = localStorage.getItem('avatarNumber');
  if (!name) {
    history.push('/');
  }

  // Our ID.
  const [ yourID, setYourID ] = useState('');

  // List of all the users retreived from the backend.
  const [ users, setUsers ] = useState({});


  // Call Received from some other user.
  const [ receivingCall, setReceivingCall ] = useState(false);

  // Outgoing call Modal.
  const [ outgoingCall, setOutgoingCall ] = useState(false);

  // Related to Call Accepting.
  const [ caller, setCaller ] = useState({});
  const [ callerSignal, setCallerSignal ] = useState();

  // Aren't caller and partner same?
  const [ partner, setPartner ] = useState(null);

  // Flag to decide whether to accept the call.
  const [ callAccepted, setCallAccepted ] = useState(false);

  // Peer object later used to close calls.
  let [ peer, setPeer ] = useState(null);

  const [ openSnackbar, closeSnackbar ] = useSnackbar(snackBarOptions);

  let [disconnectCount, setDisconnectCount] = useState(0);

  const userVideo = useRef();
  const partnerVideo = useRef();
  const socket = useRef();
  const ringAudio = useRef();
  const stream = useUserMedia();

  useEffect(() => {
    if (userVideo.current) {
      userVideo.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    // In Development. This is forwarded to the backend by create reac

    //When setting up the initial connection pass on the user name.
    socket.current = io.connect(process.env.REACT_APP_SOCKET_URL, {
      query: `userName=${name}&avatarNumber=${avatarNumber}`
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

    // Partner rejected your call. Not disconnect.
    socket.current.on('rejectCallAcknowledgement', (data) => {
      setOutgoingCall(false);
      openSnackbar(`${data.name} rejected your call`);
    });

    /* When someone is calling you this is run. You get the signal of the other user which you must accept. You are not the initiator.
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

      // Ringtone
      ringAudio.current.play();
    });
    
    // Unmount
    return () => {
      console.log('Unmount');
      socket.current.destroy();
    }
  }, [disconnectCount]);

  function callPeer(peerID, stream) {
    // Promise because we will have to disabl load button.
    return new Promise((resolve, reject) => {
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
        // Outgoing call modal.
        setOutgoingCall(true);

        // Signal to the Server to update the User List.
        changeUserAvailability(peerID, yourID, false);

        resolve(true);
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
        peer.signal(data.signal);
        setPartner(data.from);
        // Remove the outgoing Modal
        setOutgoingCall(false);
        setCallAccepted(true);
      });
    });
  }

  function initializeReceiverPeer() {
      // You are now some other peer (Not the initiator). You have your own stream that the other person must accept. Remember for Web RTC to work the person who initiated the call should also accept thee request.
      const receiverPeer = new Peer({
        initiator: false,
        trickle: false,
        stream: stream
      });

      setPeer(receiverPeer);

      // When you start generating a stream.
      receiverPeer.on('signal', (data) => {
        socket.current.emit('acceptCall', {
          signal: data,
          to: caller.id,
          from: yourID
        });
      });

      receiverPeer.on('stream', (stream) => {
        partnerVideo.current.srcObject = stream;
      });

      ringAudio.current.pause();
      ringAudio.current.currentTime = 0;

      // Add a disconnect method.

      receiverPeer.signal(callerSignal);
  }

  // When accept call is clicked on the UI by the receiver.
  function acceptCall() {
    setCallAccepted(true);
    setReceivingCall(false);

    if (peer) {
      peer.destroy();

      setTimeout(function () {
        initializeReceiverPeer();
      }, 2000);
    } else {
      initializeReceiverPeer();
    }
    
  }

  function resetPartner() {
    setPartner(null);
  }

  // TODO: Send some feedback to the person who called.
  function rejectCall() {
    setReceivingCall(false);
    changeUserAvailability(caller.id, yourID, true);
    socket.current.emit('rejectCall', {
      id: caller.id,
      name
    });
    resetPartner();
    // Reset Call Audio.
    ringAudio.current.pause();
    ringAudio.current.currentTime = 0;
  }

  // Triggered only when user manually clicks on disconnect call button.
  function disconnectCall() {
    // Send an event to the server that user disconected.
    socket.current.emit('disconnectCall', caller);
    // Update the list of users. Mark them as available.
    // Signal to the Server to update the User List.
    changeUserAvailability(partner, yourID, true);
    
    resetPartner();
    //setTimeout(() => window.location.reload(), 1000);
    setTimeout(() => setDisconnectCount(++disconnectCount), 1000);
  }

  // Function that changes the availability of users. (Busy/available)
  function changeUserAvailability(user1, user2, available = true) {
    socket.current.emit('updateUsers', {
      available,
      users: {
        [user1]: available,
        [user2]: available
      }
    });
  }

  // Outgoing call modal
  function showOutgoingCall() {
    if (!outgoingCall) return null;

    return (
      <CallOutGoing />
    );
  }

  // Returns a list of people that we can call.
  // TODO: Add Styling
  function showUsersToCall() {
    return <UserList users={users} yourID={yourID} handleClick={callPeer} yourStream={stream} />;
  }

  let UserVideo;
  if (stream) {
    UserVideo = <video playsInline muted ref={userVideo} autoPlay />;
  }

  let incomingCall;

  // Triggered by the listening to the hey event sent by the server.
  if (receivingCall) {
    incomingCall = (
      <CallReceiving caller={caller} acceptCall={acceptCall} rejectCall={rejectCall} />
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
  return (
    <div className="container">
      <div className="row video-section-wrapper">
        {/* Different styling when host video is*/}
        {
          <div c
            className={`
                video-wrapper
                host-video-wrapper
                ${showPartnerVideo ? 'connected' : ''}
              `}
          >
            {UserVideo}
          </div>
        }

        {showPartnerVideo && (
          <div className="video-wrapper partner-video-wrapper">
            <video playsInline ref={partnerVideo} autoPlay />
            <img onClick={() => disconnectCall()} className="call-cut" src={CallCut} />
          </div>
        )}
      </div>


      {showOutgoingCall()}
      {showUsersToCall()}
      <div className="row">{incomingCall}</div>

      <audio ref={ringAudio} loop>
        <source src="/audio/dialtone.mp3" />
      </audio>
    </div>
  );
}
export default App;
