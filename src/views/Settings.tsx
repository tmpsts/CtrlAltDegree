import { useEffect, useState } from "react";
import { getUserData, saveUserData } from "../api/userAPI";
import { useAuth } from "../context/AuthContext";

export default function Settings() {
  const { user } = useAuth();
  const [isLoading, setLoading] = useState(false);
  const [transcriptData, setTranscriptData] = useState<Transcript | null>(null);
  const [editableTranscript, setEditableTranscript] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        setLoading(true);
        try {
          const data = await getUserData(user.id.toString());
          if (data.transcript) {
            try {
              const transcript =
                typeof data.transcript === "string"
                  ? JSON.parse(data.transcript)
                  : data.transcript;

              setTranscriptData(transcript);
              setEditableTranscript(JSON.stringify(transcript, null, 2));
            } catch (e) {
              console.error("Error parsing transcript:", e);
            }
          }
        } catch (error) {
          console.error("Failed to fetch user data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [user]);

  const handleTranscriptChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setEditableTranscript(e.target.value);
  };

  const saveTranscript = async () => {
    if (!user) return;

    setIsSaving(true);
    setSaveMessage("");

    try {
      // Validate JSON before saving
      const parsedJson = JSON.parse(editableTranscript);

      await saveUserData({
        transcript: editableTranscript,
      });

      setTranscriptData(parsedJson);
      setSaveMessage("Transcript saved successfully!");
    } catch (error) {
      console.error("Failed to save transcript:", error);
      if (error instanceof SyntaxError) {
        setSaveMessage("Error: Invalid JSON format");
      } else {
        setSaveMessage("Error saving transcript");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 items-start overflow-auto w-full">
      <h1 className="header">Settings</h1>

      <div className="w-full">
        <h1 className="text-xl font-bold mb-2">Transcript</h1>

        <div className="flex flex-row gap-4 w-full">
          {/* Current transcript display */}
          <div className="w-1/2">
            <h2 className="text-lg font-semibold mb-2">Current Transcript</h2>
            <div className="h-96 overflow-y-auto border border-gray-300 rounded p-3">
              {isLoading ? (
                <div>Loading...</div>
              ) : transcriptData ? (
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(transcriptData, null, 2)}
                </pre>
              ) : (
                <div>No transcript data found</div>
              )}
            </div>
          </div>

          {/* Editable transcript */}
          <div className="w-1/2">
            <h2 className="text-lg font-semibold mb-2">Edit Transcript</h2>
            <textarea
              className="w-full h-96 p-3 border border-gray-300 rounded font-mono"
              value={editableTranscript}
              onChange={handleTranscriptChange}
              placeholder="Paste your JSON transcript data here"
            />
            <div className="mt-3 flex items-center">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
                onClick={saveTranscript}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Transcript"}
              </button>
              {saveMessage && (
                <span
                  className={`ml-3 ${
                    saveMessage.includes("Error")
                      ? "text-red-500"
                      : "text-green-500"
                  }`}
                >
                  {saveMessage}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
