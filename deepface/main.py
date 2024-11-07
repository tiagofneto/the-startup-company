from deepface import DeepFace

for i in range(1, 5):
    for j in range(1, 5):
        if i == j:
            continue

        print("Verifying " + str(i) + " with " + str(j))
        result = DeepFace.verify(
          img1_path = "dataset/img" + str(i) + ".jpg",
          img2_path = "dataset/img" + str(j) + ".jpg",
        )

        print(result)