from deepface import DeepFace
from flask import Flask, request, jsonify

# for i in range(1, 5):
#     for j in range(1, 5):
#         # Skip comparing an image with itself
#         if i == j:
#             continue
#
#         print("Verifying " + str(i) + " with " + str(j))
#         # Use DeepFace to verify if the two images are of the same person
#         result = DeepFace.verify(
#           img1_path = "dataset/img" + str(i) + ".jpg", 
#           img2_path = "dataset/img" + str(j) + ".jpg",
#         )
#
#         print(result)

app = Flask(__name__)

@app.route('/is-face-valid', methods=['POST'])
def is_face_valid():
    try:
        img = request.json.get('img')
        if not img:
            return jsonify({'error': 'No image provided'}), 400

        result = DeepFace.verify(
            img1_path = img, 
            img2_path = "dataset/tiago.jpg",
        )
        print(result)

        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)