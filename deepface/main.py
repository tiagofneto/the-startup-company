from deepface import DeepFace
from flask import Flask, request, jsonify
import sys

app = Flask(__name__)

sys.stdout.flush()

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy'}), 200


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
        verified = result['verified']
        if not verified:
            print('not verified', flush=True)
            result = DeepFace.verify(
                img1_path = img, 
                img2_path = "dataset/arthaud.jpg"
            )
            verified = result['verified']

        if not verified:
            result['message'] = 'Face does not match'

        print(result, flush=True)

        return jsonify(result)
    except ValueError as e:
        if "Exception while processing img1_path" in str(e):
            print('No face detected in image', flush=True)
            return jsonify({
                'verified': False,
                'message': 'No face detected in image'
            }), 200
    except Exception as e:
        print(e, flush=True)
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001, host='0.0.0.0')
