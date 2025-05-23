import streamlit as st
import requests
import json
from PIL import Image, ImageDraw, ImageFont
import time
import io
from io import BytesIO

# Display the header image
# image_url = "https://uwnewsroom-prod-backend.parallelpublicworks.com/sites/default/files/gettyimages-843352558_2.jpg"
image_url = "header_kidneystone.jpg"
# st.image("header_kidneystone.jpg", use_container_width=True, height=350)
# Fetch the image and resize it
# response = requests.get(image_url)
# img = Image.open(BytesIO(response.content))
img = Image.open(image_url)
img = img.resize((img.width, 350))  # Resize based on height

# Display the resized image
st.image(img, use_container_width=True)
# Public image URL


# Title for the app
st.title("RadAI: Kidney Stone Detection 🩺")
st.markdown("""
    **RadAI** is an AI-powered binary classification tool designed to assist in detecting kidney stones in ultrasound images. 
    The model classifies images into two categories: **Kidney Stone Detected** or **Normal Kidney**. 
    Simply upload or capture an image, and RadAI will process it and provide real-time results based on the analysis.
            
    We **REQUIRE** all users to complete the **User Acceptance Testing (UAT) survey** to help improve our system. Please access the survey [here](https://forms.gle/XcHB2Y57JT7FWFPSA).
""")

# Load the privacy.json file
with open("privacy.json", "r") as file:
    privacy_data = json.load(file)

# Accordion-style toggle for the Privacy Policy
with st.expander("Privacy Policy", expanded=False):  # Default not expanded
    for section in privacy_data["privacy_policy"]["sections"]:
        st.subheader(section["title"])
        st.write(section["content"])

# Add a checkbox for user agreement
agree = st.checkbox("I agree to the Privacy Policy")

# Show a confirmation message when the user checks the box
if agree:
    st.subheader("Input Options")
    input_option = st.radio("Choose input type", ("Upload Image", "Use Camera"), key="input_radio")

    # Initialize variables
    img_file_buffer = None
    uploaded_image = None

    # Use the camera
    if input_option == "Use Camera":
        img_file_buffer = st.camera_input("Take a picture")

    # Upload image
    elif input_option == "Upload Image":
        uploaded_image = st.file_uploader("Upload an image", type=["jpg", "jpeg", "png"])

    # Image handling
    image_path = None
    if img_file_buffer or uploaded_image:
        # Display the captured or uploaded image
        image = img_file_buffer if img_file_buffer else uploaded_image
        st.image(image, caption="Selected Image")

        # Extract the original name of the image and append '_predict'
        if uploaded_image:
            image_name = uploaded_image.name.split('.')[0]  # Get the name without extension
            image_extension = uploaded_image.name.split('.')[-1]  # Get the file extension
        elif img_file_buffer:
            image_name = "captured_image"  # If using the camera, name it something generic
            image_extension = "jpg"  # Assume .jpg for camera images (you can adjust if necessary)

        # Create the new image path with '_predict' appended
        image_path = f"{image_name}_predict.{image_extension}"

        # Save the image to a file
        # image_path = "selected_image.jpg"
        with open(image_path, "wb") as file:
            file.write(image.getbuffer())
            st.success(f"Image saved as '{image_path}'")

    # Inference and Overlay
    if image_path:
        # Display the loading message while making predictions
        with st.spinner("Processing! 🩺 please wait... "):
            # URLs and API setup for both models
            url_yolov8 = "https://predict.ultralytics.com"
            headers = {"x-api-key": "3b5056ac3a9ea918ac838037d777446ba97e9ad3fc"}
            data = {
                "model": "https://hub.ultralytics.com/models/SMt917G5PhT5W142f1Iq",  # YOLOv8m
                "imgsz": 640,
                "conf": 0.25,
                "iou": 0.45,
            }

            try:
                # Commented out YOLOv11m section
                # Send the image for inference for YOLOv11m
                # with open(image_path, "rb") as f:
                #     response_v11 = requests.post(url_yolov11, headers=headers, data=data, files={"file": f})
                # response_v11.raise_for_status()
                # results_v11 = response_v11.json()

                # Send the image for inference for YOLOv8m
                with open(image_path, "rb") as f:
                    response_v8 = requests.post(url_yolov8, headers=headers, data=data, files={"file": f})
                response_v8.raise_for_status()
                results_v8 = response_v8.json()

                # Load the images and draw results for both models
                original_image = Image.open(image_path)
                draw_v8 = ImageDraw.Draw(original_image)

                # Optional: Load a font for text (fallback if not found)
                try:
                    font = ImageFont.truetype("arial.ttf", 20)
                except IOError:
                    font = ImageFont.load_default()

                def process_results(results, draw):
                    kidney_stone_detected = False
                    normal_kidney_detected = False
                    total_confidence = 0
                    kidney_stone_count = 0
                    normal_kidney_count = 0

                    for detection in results["images"][0]["results"]:
                        box = detection["box"]
                        x1, y1, x2, y2 = box["x1"], box["y1"], box["x2"], box["y2"]
                        label = f'{detection["name"]} ({detection["confidence"]:.2f})'

                        # Check if the detected object is a "kidney-stone"
                        if "kidney-stone" in detection["name"].lower():
                            kidney_stone_detected = True
                            total_confidence += detection["confidence"]
                            kidney_stone_count += 1

                        # Check if the detected object is a "normal kidney"
                        elif "normal kidney" in detection["name"].lower():
                            normal_kidney_detected = True
                            total_confidence += detection["confidence"]
                            normal_kidney_count += 1

                        # Draw rectangle and label
                        draw.rectangle([(x1, y1), (x2, y2)], outline="red", width=3)

                        label_y = y1 - 15 if y1 - 15 > 0 else y2 + 5
                        label_y = label_y if label_y > 5 else y2 + 10  # Additional check to avoid out-of-bounds
                        draw.text((x1, label_y), label, fill="red", font=font)

                    # Add result text
                    if kidney_stone_detected:
                        average_confidence = (total_confidence / kidney_stone_count) * 100
                        result_label = f"Kidney Stone Detected"
                    elif normal_kidney_detected:
                        average_confidence = (total_confidence / normal_kidney_count) * 100
                        result_label = f"Normal Kidney \n Average Confidence: {average_confidence:.2f}%"
                    else:
                        result_label = "No Kidney Detected"
                    return result_label

                # Process and display results for YOLOv8m
                result_v8 = process_results(results_v8, draw_v8)

                # Display the annotated images for both models side by side
                # col1, col2 = st.columns(2)

                # with col1:
                #     st.subheader("YOLOv8m Prediction")
                #     st.image(original_image, caption=f"{result_v8}")
                st.subheader("YOLOv8m Prediction")
                st.image(original_image, caption=f"{result_v8}")

                # Save the annotated image to a BytesIO object for download
                buffered = io.BytesIO()
                original_image.save(buffered, format="PNG")
                buffered.seek(0)

                # Add a download button for the annotated image
                st.download_button(
                    label="Download Predicted Image",
                    data=buffered,
                    file_name=f"{image_name}_predict.{image_extension}",
                    mime="image/png"
                )

                st.markdown("""
                    <br><br>Your feedback matters to us! We would greatly appreciate it if you could take a moment to participate in our 
                    [User Acceptance Survey](https://forms.gle/CtFBdkfj39ZwRZrNA). Your insights will help us improve RadAI and ensure it meets your needs effectively.
                """, unsafe_allow_html=True)

            except Exception as e:
                st.error(f"Error: {e}")
else:
    st.warning("You need to agree to the Privacy Policy to proceed.")