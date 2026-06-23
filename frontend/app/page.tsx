"use client";
import { useState } from "react";

export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const [epsilon, setEpsilon] = useState(0.1);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
  };

  const runAttack = async () => {
    if (!image) return alert("Please upload an image first!");
    setLoading(true);

    const formData = new FormData();
    formData.append("file", image);
    formData.append("epsilon", String(epsilon));

    try {
      const response = await fetch("http://127.0.0.1:8000/attack", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      alert("Error connecting to backend. Make sure it is running.");
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2 text-purple-400">
          FGSM Adversarial Attack
        </h1>
        <p className="text-center text-gray-400 mb-10">
          Fast Gradient Sign Method — DevNeuron Assessment
        </p>

        <div className="bg-gray-900 rounded-2xl p-6 mb-8 border border-gray-800">
          <h2 className="text-xl font-semibold mb-4 text-purple-300">
            Upload Image
          </h2>

          <input
            type="file"
            accept="image/png, image/jpeg"
            onChange={handleImageChange}
            className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0 file:bg-purple-600 file:text-white
              hover:file:bg-purple-700 cursor-pointer mb-6"
          />

          <label className="block text-sm text-gray-400 mb-2">
            Epsilon (attack strength): <span className="text-purple-400 font-bold">{epsilon}</span>
          </label>
          <input
            type="range"
            min="0.01"
            max="0.5"
            step="0.01"
            value={epsilon}
            onChange={(e) => setEpsilon(parseFloat(e.target.value))}
            className="w-full accent-purple-500 mb-6"
          />
          <div className="flex justify-between text-xs text-gray-500 -mt-4 mb-6">
            <span>0.01 (weak)</span>
            <span>0.50 (strong)</span>
          </div>

          <button
            onClick={runAttack}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700
              disabled:bg-gray-700 disabled:cursor-not-allowed font-semibold
              transition-all duration-200 text-lg"
          >
            {loading ? "Running Attack..." : "Run FGSM Attack"}
          </button>
        </div>

        {result && (
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <h2 className="text-xl font-semibold mb-6 text-purple-300">
              Attack Results
            </h2>

            <div className={`rounded-xl p-4 mb-6 text-center text-lg font-bold ${
              result.attack_success
                ? "bg-red-900 border border-red-500 text-red-300"
                : "bg-green-900 border border-green-500 text-green-300"
            }`}>
              {result.attack_success
                ? "Attack Successful — Model was fooled!"
                : "Attack Failed — Model held strong!"}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-800 rounded-xl p-4 text-center">
                <p className="text-gray-400 text-sm mb-1">Clean Prediction</p>
                <p className="text-5xl font-bold text-green-400">
                  {result.clean_prediction}
                </p>
              </div>
              <div className="bg-gray-800 rounded-xl p-4 text-center">
                <p className="text-gray-400 text-sm mb-1">Adversarial Prediction</p>
                <p className="text-5xl font-bold text-red-400">
                  {result.adversarial_prediction}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2">Original Image</p>
                {preview && (
                  <img
                    src={preview}
                    alt="Original"
                    className="rounded-xl border border-gray-700 w-full object-contain max-h-64"
                  />
                )}
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2">
                  Adversarial Image (ε={result.epsilon})
                </p>
                <img
                  src={`data:image/png;base64,${result.adversarial_image_base64}`}
                  alt="Adversarial"
                  className="rounded-xl border border-red-800 w-full object-contain max-h-64"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}