
import numpy as np
from ultralytics import YOLO
import random
import cv2
import os
import torch
import argparse

def run_detection(ip_address):
    file_path = os.path.join(os.path.dirname(__file__), "utils", "coco.txt")

    if not os.path.exists(file_path):
        print(f"Error: '{file_path}' not found! Ensure 'coco.txt' exists in the utils folder.")
        return

    with open(file_path, "r") as my_file:
        class_list = my_file.read().splitlines()

    detection_colors = [(random.randint(0, 255), random.randint(0, 255), random.randint(0, 255)) for _ in range(len(class_list))]
    model = YOLO("weights/yolov8n.pt")
    frame_wid, frame_hyt = 1920, 1080

    # Use IP camera stream URL
    camera_url = f"http://{ip_address}:8080/video"
    cap = cv2.VideoCapture(camera_url)

    if not cap.isOpened():
        print(f"Cannot access the IP camera at {camera_url}. Please check the IP address and ensure the IP camera is running.")
        return

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                print("Can't receive frame (stream end?). Exiting ...")
                break

            frame = cv2.resize(frame, (frame_wid, frame_hyt))
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
                        3,
                    )

                    font = cv2.FONT_HERSHEY_COMPLEX
                    cv2.putText(
                        frame,
                        f"{class_list[clsID]} {round(conf * 100, 2)}%",
                        (int(bb[0]), int(bb[1]) - 10),
                        font,
                        1,
                        (255, 255, 255),
                        2,
                    )

            cv2.imshow("Object Detection", frame)

            if cv2.waitKey(1) & 0xFF == ord("q"):
                break

    finally:
        cap.release()
        cv2.destroyAllWindows()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Run object detection on IP camera stream')
    parser.add_argument('ip_address', type=str, help='IP address of the camera')
    args = parser.parse_args()
    
    run_detection(args.ip_address)

