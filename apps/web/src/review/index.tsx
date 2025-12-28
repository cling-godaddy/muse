import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dashboard } from "./Dashboard";
import { ReviewSession } from "./ReviewSession";

type View = "dashboard" | "session";

interface State {
  view: View
  entryId?: string
}

export function ReviewApp() {
  const navigate = useNavigate();
  const [state, setState] = useState<State>({ view: "dashboard" });

  const handleStartReview = () => {
    setState({ view: "session" });
  };

  const handleSelectEntry = (id: string) => {
    setState({ view: "session", entryId: id });
  };

  const handleBackToDashboard = () => {
    setState({ view: "dashboard" });
  };

  const handleBackToMain = () => {
    navigate("/");
  };

  if (state.view === "session") {
    return (
      <ReviewSession
        entryId={state.entryId}
        onBack={handleBackToDashboard}
      />
    );
  }

  return (
    <Dashboard
      onStartReview={handleStartReview}
      onSelectEntry={handleSelectEntry}
      onBackToMain={handleBackToMain}
    />
  );
}
