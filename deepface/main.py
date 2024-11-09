from deepface import DeepFace
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/is-face-valid', methods=['POST'])
def is_face_valid():
    try:
        img = request.json.get('img')
        if not img:
            return jsonify({'error': 'No image provided'}), 400

        result = DeepFace.verify(
            img1_path = img, 
            img2_path = "dataset/tiago.jpg"
        )
        print(result)

        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001, host='0.0.0.0')
