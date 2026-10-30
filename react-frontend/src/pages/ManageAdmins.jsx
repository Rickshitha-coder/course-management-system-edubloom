import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import apiClient from "../api/apiClient";
import PageShell from "../components/PageShell";
import PageCss from "../components/PageCss";

export default function ManageAdmins() {
    const token = sessionStorage.getItem("token");
    const role = sessionStorage.getItem("role");

    const [admins, setAdmins] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [reset, setReset] = useState(null); // { name, email, password }
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!token || role !== "admin") return;
        apiClient
            .get("/admins")
            .then((response) => setAdmins(response.data.admins))
            .catch(() => setError("Unable to load administrators"))
            .finally(() => setLoading(false));
    }, [token, role]);

    if (!token || role !== "admin") {
        return <Navigate to="/login" replace />;
    }

    async function resetPassword(admin) {
        const ok = window.confirm(
            `Reset the password for administrator ${admin.name} (${admin.email})?\n\n` +
            "Their old password will stop working immediately. Only do this when they asked you to."
        );
        if (!ok) return;

        setError("");
        setCopied(false);

        try {
            const response = await apiClient.post(`/admins/${admin._id}/reset-password`);
            setReset({ name: admin.name, email: admin.email, password: response.data.temporaryPassword });
        } catch (err) {
            setError((err.response && err.response.data && err.response.data.message) || "Password reset failed");
        }
    }

    async function copyPassword() {
        try {
            await navigator.clipboard.writeText(reset.password);
            setCopied(true);
        } catch {
            setError("Copy failed. Select the password and copy it manually.");
        }
    }

    return (
        <>
            <PageCss href="/css/my_courses.css" />
            <PageShell
                variant="admin"
                active="admins"
                footer="standard"
                crumbs={[{ label: "Dashboard", to: "/admin-dashboard" }, { label: "Manage Admins" }]}
            >
                <div className="page">
                    <header className="page-head">
                        <div className="page-head__text">
                            <h1>Manage Admins</h1>
                            <p className="page-head__sub">
                                Help another administrator who forgot their password. You cannot reset
                                your own password here; use Change Password for that.
                            </p>
                        </div>
                    </header>

                    {error && <p role="alert" style={styles.error}>{error}</p>}

                    {reset && (
                        <section style={styles.notice} aria-live="polite">
                            <h2 style={styles.noticeTitle}>New password for {reset.name}</h2>
                            <p style={{ margin: "0 0 8px" }}>{reset.email}</p>
                            <p style={styles.password}>{reset.password}</p>
                            <p style={styles.hint}>
                                Give this password to that administrator privately. It is shown only once.
                                They should log in and change it under <strong>Change Password</strong>.
                            </p>
                            <div style={{ display: "flex", gap: 8 }}>
                                <button type="button" className="btn btn--primary" onClick={copyPassword}>
                                    {copied ? "Copied" : "Copy password"}
                                </button>
                                <button type="button" className="btn" onClick={() => setReset(null)}>Done</button>
                            </div>
                        </section>
                    )}

                    <div style={{ overflowX: "auto" }}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    {["Name", "Email", "Since", "Action"].map((h) => (
                                        <th key={h} style={styles.th}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {loading && <tr><td style={styles.td} colSpan={4}>Loading…</td></tr>}
                                {admins.map((a) => (
                                    <tr key={a._id}>
                                        <td style={styles.td}>{a.name}{a.isCurrent && <strong> (you)</strong>}</td>
                                        <td style={styles.td}>{a.email}</td>
                                        <td style={styles.td}>
                                            {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : "-"}
                                        </td>
                                        <td style={styles.td}>
                                            {a.isCurrent ? (
                                                <span style={{ color: "#667" }}>Use Change Password</span>
                                            ) : (
                                                <button type="button" className="btn btn--sm" onClick={() => resetPassword(a)}>
                                                    Reset password
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {!loading && admins.length === 1 && (
                        <p style={{ marginTop: 16, color: "#667" }}>
                            You are the only administrator. Create another with <code>npm run create-admin</code> so
                            admins can help each other.
                        </p>
                    )}
                </div>
            </PageShell>
        </>
    );
}

const styles = {
    error: { color: "#b3261e", margin: "0 0 12px" },
    notice: { background: "#eef7f1", border: "1px solid #b9dcc6", borderRadius: 12, padding: 20, marginBottom: 20 },
    noticeTitle: { margin: "0 0 4px", fontSize: 18 },
    password: { fontFamily: "monospace", fontSize: 24, letterSpacing: 1, margin: "8px 0", userSelect: "all" },
    hint: { margin: "0 0 12px", color: "#44554b" },
    table: { width: "100%", borderCollapse: "collapse", background: "#fff" },
    th: { textAlign: "left", padding: "10px 12px", borderBottom: "2px solid #dfe5e1", whiteSpace: "nowrap" },
    td: { padding: "10px 12px", borderBottom: "1px solid #e8ece9" }
};
