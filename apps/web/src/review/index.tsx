import { Outlet, useNavigate, useParams } from "react-router-dom";
import { Dashboard } from "./Dashboard";
import { ReviewSession } from "./ReviewSession";

export function ReviewLayout() {
  return <Outlet />;
}

export function ReviewDashboard() {
  const navigate = useNavigate();

  return (
    <Dashboard
      onStartReview={() => navigate("/review/session")}
      onSelectEntry={id => navigate(`/review/entries/${encodeURIComponent(id)}`)}
      onBackToMain={() => navigate("/")}
    />
  );
}

export function ReviewSessionPage() {
  const navigate = useNavigate();

  return (
    <ReviewSession
      onBack={() => navigate("/review")}
      onNavigate={id => navigate(`/review/entries/${encodeURIComponent(id)}`, { replace: true })}
    />
  );
}

export function ReviewEntry() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  if (!id) {
    navigate("/review");
    return null;
  }

  return (
    <ReviewSession
      entryId={decodeURIComponent(id)}
      onBack={() => navigate("/review")}
      onNavigate={newId => navigate(`/review/entries/${encodeURIComponent(newId)}`, { replace: true })}
    />
  );
}
