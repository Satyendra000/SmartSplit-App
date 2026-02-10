import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useConfirm } from "../../components/common/ConfirmModal";
import { Users, Plus, ArrowRight, Trash2, Clock } from "lucide-react";
import Footer from "../../components/common/Footer";
import API_URL from "../../config/api";

const SplitSetup = ({ toast }) => {
  const navigate = useNavigate();
  const { confirm, ConfirmModal } = useConfirm();
  const [participants, setParticipants] = useState([""]);
  const [participantEmails, setParticipantEmails] = useState([""]);
  const [groupName, setGroupName] = useState("");
  const [duration, setDuration] = useState(7);

  const addParticipant = () => {
    setParticipants([...participants, ""]);
    setParticipantEmails([...participantEmails, ""]);
  };

  const removeParticipant = (index) => {
    if (participants.length > 1) {
      confirm({
        title: "Remove Participant?",
        message: "Are you sure you want to remove this participant?",
        confirmText: "Yes, Remove",
        cancelText: "Cancel",
        type: "warning",
        onConfirm: () => {
          setParticipants(participants.filter((_, i) => i !== index));
          setParticipantEmails(participantEmails.filter((_, i) => i !== index));
        },
      });
    }
  };

  const updateParticipant = (index, value) => {
    const updated = [...participants];
    updated[index] = value;
    setParticipants(updated);
  };

  const updateParticipantEmail = (index, value) => {
    const updated = [...participantEmails];
    updated[index] = value;
    setParticipantEmails(updated);
  };

  const generateSessionId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const createSession = async (groupName, participants, durationDays) => {
    const sessionId = generateSessionId();
    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + durationDays * 24 * 60 * 60 * 1000,
    );

    const session = {
      id: sessionId,
      groupName,
      participants,
      durationDays,
    };

    try {
      // Use backend API instead of localStorage
      // const baseUrl = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL;
      const response = await fetch(`${API_URL}/api/sessions/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(session),
      });

      const data = await response.json();

      if (data.success) {
        return sessionId;
      } else {
        console.error("Failed to create session:", data.message);
        toast.error(data.message || "Failed to create session");
        return null;
      }
    } catch (error) {
      console.error("Error creating session:", error);
      toast.error("Failed to connect to server. Please try again.");
      return null;
    }
  };

  const handleSubmit = async () => {
    const validParticipants = participants.filter((p) => p.trim() !== "");

    if (validParticipants.length < 1) {
      toast.error("Please add at least one participant");
      return;
    }
    if (!groupName.trim()) {
      toast.error("Please enter a group name");
      return;
    }

    // Create session in storage
    const sessionId = await createSession(
      groupName.trim(),
      validParticipants,
      duration,
    );

    if (sessionId) {

      // Store admin rights for this session
      localStorage.setItem(`split_session_admin_${sessionId}`, "true");

      // Store participant emails for notifications
      const emailMap = validParticipants.map((name, index) => ({
        name,
        email: participantEmails[index] || "",
      })).filter(p => p.email.trim() !== "");
      localStorage.setItem(`split_session_emails_${sessionId}`, JSON.stringify(emailMap));

      // Navigate to dashboard with session ID
      navigate(`/dashboard/split?session=${sessionId}`);
    } else {
      toast.error("Failed to create session. Please try again.");
    }
  };

  const handleBackToMain = () => {
    if (groupName.trim() || participants.some((p) => p.trim())) {
      confirm({
        title: "Leave Setup?",
        message:
          "You have unsaved changes. Are you sure you want to go back to home?",
        confirmText: "Yes, Leave",
        cancelText: "Stay",
        type: "warning",
        onConfirm: () => navigate("/"),
      });
    } else {
      navigate("/");
    }
  };

  return (
    <>
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-[120px] animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>

        <div className="absolute inset-0 opacity-[0.02]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)`,
              backgroundSize: "50px 50px",
            }}
          ></div>
        </div>

        <div className="relative z-10 w-full max-w-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-orange-500/20 rounded-xl blur-xl"></div>
                <div className="relative w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-2xl shadow-orange-500/20 flex items-center justify-center">
                  <Users className="w-9 h-9 text-white" strokeWidth={1.5} />
                </div>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Setup Split Group
            </h1>
            <p className="text-white/50 text-sm">
              Add participants to start splitting expenses
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/5 shadow-2xl p-8">
            <div className="mb-6">
              <label className="block text-sm font-semibold text-white/70 mb-2">
                Group Name
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g., Paris Trip, Roommates..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-white/70 mb-2">
                Participants
              </label>
              <div className="space-y-3 mb-4">
                {participants.map((participant, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={participant}
                        onChange={(e) => updateParticipant(index, e.target.value)}
                        placeholder={`Person ${index + 1}`}
                        className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all"
                      />
                      {participants.length > 1 && (
                        <button
                          onClick={() => removeParticipant(index)}
                          className="px-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    <input
                      type="email"
                      value={participantEmails[index] || ""}
                      onChange={(e) => updateParticipantEmail(index, e.target.value)}
                      placeholder="📧 Email (optional, for notifications)"
                      className="w-full px-4 py-2.5 ml-4 bg-white/[0.02] border border-white/5 rounded-lg text-white/70 placeholder-white/20 focus:outline-none focus:border-yellow-500/30 focus:bg-white/5 transition-all text-sm"
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={addParticipant}
                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-orange-500/30 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Another Person
              </button>
            </div>

            {/* Session Duration */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-white/70 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-500" />
                Session Duration
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMUw2IDZMMTEgMSIgc3Ryb2tlPSIjZjk3MzE2IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] bg-[length:12px] bg-[right_1rem_center] bg-no-repeat cursor-pointer"
              >
                <option value={1} className="bg-[#0a0a0a]">
                  1 Day
                </option>
                <option value={3} className="bg-[#0a0a0a]">
                  3 Days
                </option>
                <option value={7} className="bg-[#0a0a0a]">
                  7 Days (Recommended)
                </option>
                <option value={14} className="bg-[#0a0a0a]">
                  14 Days
                </option>
                <option value={30} className="bg-[#0a0a0a]">
                  30 Days
                </option>
              </select>
              <p className="text-xs text-white/40 mt-2">
                Session will expire in {duration}{" "}
                {duration === 1 ? "day" : "days"}
              </p>
            </div>

            <div className="flex gap-5">
              <button
                onClick={handleSubmit}
                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-lg transition-all shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 flex items-center justify-center gap-2"
              >
                <span>Continue to Dashboard</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={handleBackToMain}
                className="w-2/3 sm:w-1/2 lg:w-1/3 py-2.5 sm:py-3 lg:py-3.5 px-4 bg-gray-800 hover:bg-gray-500 text-white text-sm sm:text-base font-semibold rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <span className="text-lg sm:text-xl">←</span>
                <span>Back to home</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <ConfirmModal />
    </>
  );
};

export default SplitSetup;