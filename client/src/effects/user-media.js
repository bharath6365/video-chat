import {useState, useEffect} from 'react';

const useUserMedia = () => {
  const [constraints, setConstraints] = useState({
    video: true,
    audio: true
  })
  // We need to return the stream.
  const [stream, setStream] = useState(null);
  useEffect(() => {
    const getMediaStream = async () => {
      console.log('Use Effect running');
      try {
        const userStream = await navigator.mediaDevices.getUserMedia(constraints);
        setStream(userStream);
      } catch (e) {
        if (e.t0 && e.t0.name === 'NotFoundError') {
          window.location.href = '/no-support';
        }
        console.error(e.message);
        alert('This application needs webcam and microphone access to work. Do not worry about your privacy.');
      }
    };

    getMediaStream();
  }, []);

  return stream;
}

export default useUserMedia;