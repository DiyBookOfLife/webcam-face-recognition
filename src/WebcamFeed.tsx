import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, setWebcamOn } from './store';

const WebcamFeed: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [scanMessage, setScanMessage] = useState("");

  const dispatch = useDispatch();
  const isWebcamOn = useSelector((state: RootState) => state.webcam.isWebcamOn);

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = '/models';
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(`${MODEL_URL}/tiny_face_detector_model`),
        faceapi.nets.faceLandmark68Net.loadFromUri(`${MODEL_URL}/face_landmark_68_model`),
        faceapi.nets.faceExpressionNet.loadFromUri(`${MODEL_URL}/face_expression_model`),
        faceapi.nets.ageGenderNet.loadFromUri(`${MODEL_URL}/age_gender_model`)
      ]);
      console.log('Models loaded');
    };

    loadModels();
  }, []);

  const detectFaces = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    faceapi.matchDimensions(canvas, video);
    let lastDetectionTime = 0;

    const runDetection = async (time: number) => {
      if (document.hidden) return;
      if (time - lastDetectionTime > 1000) {
        lastDetectionTime = time;

        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 160 }))
          .withFaceLandmarks()
          .withFaceExpressions()
          .withAgeAndGender();

        const resized = faceapi.resizeResults(detections, {
          width: video.videoWidth,
          height: video.videoHeight,
        });

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const context = canvas.getContext('2d');
        if (context) context.clearRect(0, 0, canvas.width, canvas.height);

        faceapi.draw.drawDetections(canvas, resized);
        faceapi.draw.drawFaceLandmarks(canvas, resized);
        faceapi.draw.drawFaceExpressions(canvas, resized);

        resized.forEach(result => {
          const { age, gender, genderProbability } = result;
          const { x, y } = result.detection.box;
          if (context) {
            context.fillStyle = 'white';
            context.font = '16px Arial';
            context.fillText(
              `${gender} (${Math.round(genderProbability * 100)}%) Age: ${Math.round(age)}`,
              x,
              y - 10
            );
          }
        });
      }

      animationFrameId.current = requestAnimationFrame(runDetection);
    };

    animationFrameId.current = requestAnimationFrame(runDetection);
  };

  const detectFacesInImage = async () => {
    const image = imageRef.current;
    const canvas = canvasRef.current;
    if (!image || !canvas) return;

    faceapi.matchDimensions(canvas, image);

    const detections = await faceapi
      .detectAllFaces(image, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions()
      .withAgeAndGender();

    const resized = faceapi.resizeResults(detections, {
      width: image.width,
      height: image.height,
    });

    canvas.width = image.width;
    canvas.height = image.height;

    const context = canvas.getContext('2d');
    if (context) context.clearRect(0, 0, canvas.width, canvas.height);

    if (resized.length > 0) {
      setScanMessage("✅ Image scanned successfully!");
      faceapi.draw.drawDetections(canvas, resized);
      faceapi.draw.drawFaceLandmarks(canvas, resized);
      faceapi.draw.drawFaceExpressions(canvas, resized);

      resized.forEach(result => {
        const { age, gender, genderProbability } = result;
        const { x, y } = result.detection.box;
        if (context) {
          context.fillStyle = 'white';
          context.font = '16px Arial';
          context.fillText(
            `${gender} (${Math.round(genderProbability * 100)}%) Age: ${Math.round(age)}`,
            x,
            y - 10
          );
        }
      });
    } else {
      setScanMessage("⚠️ No face detected in uploaded image.");
    }
  };

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          dispatch(setWebcamOn(true));
          requestAnimationFrame(() => detectFaces());
        };
      }
    } catch (err) {
      console.error('Error accessing webcam:', err);
    }
  };

  const stopVideo = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      dispatch(setWebcamOn(false));
    }

    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
  };

  const toggleWebcam = () => {
    const newState = !isWebcamOn;
    dispatch(setWebcamOn(newState));
    if (newState) {
      startVideo();
    } else {
      stopVideo();
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      setScanMessage("");
    }
  };

  return (
    <div className="container text-center py-4" style={{ maxWidth: '1000px', minHeight: '100vh' }}>

      <button onClick={toggleWebcam} className="webcam-button mb-3">
        {isWebcamOn ? 'Stop Webcam' : 'Start Webcam'}
      </button>

      <div
        className="position-relative mx-auto mb-5 camera-box"
        style={{ width: '100%', maxWidth: '800px', aspectRatio: '4 / 3' }}
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="img-fluid rounded shadow position-absolute top-0 start-0"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <canvas
          ref={canvasRef}
          id="overlay"
          className="position-absolute top-0 start-0"
          style={{
            width: '100%',
            height: '100%',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        />
      </div>

      <hr />
      <h2 className="mb-3">Upload an Image</h2>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="form-control mb-3"
      />

      {imageUrl && (
        <div className="position-relative mx-auto mb-4" style={{ width: '100%', maxWidth: '600px' }}>
          <img
            src={imageUrl}
            alt="Uploaded"
            ref={imageRef}
            onLoad={detectFacesInImage}
            className="img-fluid rounded shadow position-relative"
            style={{ width: '100%', maxHeight: '500px', objectFit: 'contain' }}
          />
          <canvas
            ref={canvasRef}
            className="position-absolute top-0 start-0"
            style={{
              width: '100%',
              height: '100%',
              zIndex: 10,
              pointerEvents: 'none',
            }}
          />
        </div>
      )}

      {scanMessage && (
        <p
          className={`scan-message mt-3 ${
            scanMessage.includes("⚠️") ? "warning" : ""
          }`}
        >
          {scanMessage}
        </p>
      )}

      <footer className="footerNote">© Toni Thomas 2025 🩷</footer>
    </div>
  );
};

export default WebcamFeed;
