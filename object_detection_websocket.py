
import numpy as np
from ultralytics import YOLO
import random
import cv2
import os
import torch
import argparse
import websockets
import asyncio
import json
import base64
from datetime import datetime

async def send_frames(websocket, ip_address):
    file_path = os.path.join(os.path.dirname(__file__), "utils", "coco.txt")

    if not os.path.exists(file_path):
        print(f"Error: '{file_path}' not found! Ensure 'coco.txt' exists in the utils folder.")
        await websocket.send(json.dumps({
            "type": "error", 
            "message": f"Error: '{file_path}' not found! Ensure 'coco.txt' exists in the utils folder."
        }))
        return

    with open(file_path, "r") as my_file:
        class_list = my_file.read().splitlines()

    detection_colors = [(random.randint(0, 255), random.randint(0, 255), random.randint(0, 255)) for _ in range(len(class_list))]
    model = YOLO("weights/yolov8n.pt")
    frame_wid, frame_hyt = 640, 480  # Reduced resolution for streaming

    # Use IP camera stream URL
    camera_url = f"http://{ip_address}:8080/video"
    cap = cv2.VideoCapture(camera_url)

    if not cap.isOpened():
        error_msg = f"Cannot access the IP camera at {camera_url}. Please check the IP address and ensure the IP camera is running."
        print(error_msg)
        await websocket.send(json.dumps({"type": "error", "message": error_msg}))
        return

    try:
        await websocket.send(json.dumps({"type": "status", "message": "Connected to camera stream"}))
        
        while True:
            ret, frame = cap.read()
            if not ret:
                await websocket.send(json.dumps({"type": "error", "message": "Can't receive frame from camera"}))
                break

            frame = cv2.resize(frame, (frame_wid, frame_hyt))
            detected_objects = []
            
            results = model(frame, conf=0.45, device="cuda" if torch.cuda.is_available() else "cpu")

            for result in results:
                boxes = result.boxes
                for box in boxes:
                    clsID = int(box.cls.cpu().numpy()[0])
                    conf = float(box.conf.cpu().numpy()[0])
                    bb = box.xyxy.cpu().numpy()[0]

                    cv2.rectangle(
                        frame,
                        (int(bb[0]), int(bb[1])),
                        (int(bb[2]), int(bb[3])),
                        detection_colors[clsID],
                        2,
                    )

                    font = cv2.FONT_HERSHEY_SIMPLEX
                    cv2.putText(
                        frame,
                        f"{class_list[clsID]} {round(conf * 100, 2)}%",
                        (int(bb[0]), int(bb[1]) - 10),
                        font,
                        0.5,
                        (255, 255, 255),
                        1,
                    )
                    
                    detected_objects.append({
                        "class": class_list[clsID],
                        "confidence": round(conf * 100, 2)
                    })

            # Convert frame to base64 for sending via WebSocket
            _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
            jpg_as_text = base64.b64encode(buffer).decode('utf-8')
            
            # Send frame and detections
            timestamp = datetime.now().isoformat()
            await websocket.send(json.dumps({
                "type": "frame", 
                "image": jpg_as_text,
                "detections": detected_objects,
                "timestamp": timestamp
            }))
            
            # Limit the frame rate to avoid overloading
            await asyncio.sleep(0.1)

    except websockets.exceptions.ConnectionClosed:
        print("WebSocket connection closed")
    finally:
        cap.release()

async def main(ip_address, port=8765):
    print(f"Starting WebSocket server on port {port}")
    print(f"Using camera at IP: {ip_address}")
    
    async def handler(websocket):
        await send_frames(websocket, ip_address)
    
    async with websockets.serve(handler, "0.0.0.0", port):
        await asyncio.Future()  # Run forever

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Run object detection on IP camera stream via WebSocket')
    parser.add_argument('ip_address', type=str, help='IP address of the camera')
    parser.add_argument('--port', type=int, default=8765, help='WebSocket server port (default: 8765)')
    args = parser.parse_args()
    
    asyncio.run(main(args.ip_address, args.port))
