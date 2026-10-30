import { useState } from "react";
import { Navigate } from "react-router-dom";
import apiClient from "../api/apiClient";
import PageShell from "../components/PageShell";
import PageCss from "../components/PageCss";

export default function ChangePassword() {
    const token = sessionStorage.getItem("token");
    const role = sessionStorage.getItem("role") === "admin" ? "admin" : "student";

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [saving, setSaving] = useState(false);

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    async function submit(event) {
        event.preventDefault();
        setError("");
        setSuccess("");

        if (newPassword.length < 12) {
            return setError("New password must contain at least 12 characters.");
        }
        if (newPassword !== confirmPassword) {
            return setError("New password and confirm password do not match.");
        }

        setSaving(true);
        try {
            await apiClient.put("/profile/password", { currentPassword, newPassword });
            setSuccess("Password changed successfully. Use the new password next time you log in.");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            const data = err.response && err.response.data;
            setError(
                (data && data.errors && data.errors.map((e) => e.message || e).join(" ")) ||
                (data && data.message) ||
                "Unable to change the password"
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <>
            <PageCss href="/css/my_courses.css" />
            <PageShell
                variant={role}
                active="password"
                footer="standard"
                crumbs={[
                    { label: "Dashboard", to: role === "admin" ? "/admin-dashboard" : "/dashboard" },
                    { label: "Change Password" }
                ]}
            >
                <div className="page">
                    <header className="page-head">
                        <div className="page-head__text">
                            <h1>Change Password</h1>
                            <p className="page-head__sub">
                                Use at least 12 characters. If the administrator gave you a temporary
                                password, change it here right after logging in.
                            </p>
                        </div>
                    </header>

                    <form onSubmit={submit} style={styles.card}>
                        {error && <p role="alert" style={styles.error}>{error}</p>}
                        {success && <p role="status" style={styles.success}>{success}</p>}

                        <div style={styles.field}>
                            <label htmlFor="currentPassword" style={styles.label}>Current password</label>
                            <input id="currentPassword" type="password" value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                autoComplete="current-password" required style={styles.input} />
                        </div>
                        <div style={styles.field}>
                            <label htmlFor="newPassword" style={styles.label}>New password</label>
                            <input id="newPassword" type="password" value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                autoComplete="new-password" required minLength={12} style={styles.input} />
                        </div>
                        <div style={styles.field}>
                            <label htmlFor="confirmNewPassword" style={styles.label}>Confirm new password</label>
                            <input id="confirmNewPassword" type="password" value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                autoComplete="new-password" required minLength={12} style={styles.input} />
                        </div>

                        <button type="submit" className="btn btn--primary" disabled={saving}>
                            {saving ? "Saving…" : "Change password"}
                        </button>
                    </form>
                </div>
            </PageShell>
        </>
    );
}

const styles = {
    card: { maxWidth: 460, background: "#fff", border: "1px solid #e2e6e3", borderRadius: 12, padding: 24 },
    field: { position: "relative", marginBottom: 16 },
    label: { display: "block", fontWeight: 600, marginBottom: 6 },
    input: { width: "100%", padding: "10px 12px", border: "1px solid #cfd6d1", borderRadius: 8, font: "inherit", boxSizing: "border-box" },
    error: { color: "#b3261e", margin: "0 0 12px" },
    success: { color: "#1e7a46", margin: "0 0 12px" }
};
