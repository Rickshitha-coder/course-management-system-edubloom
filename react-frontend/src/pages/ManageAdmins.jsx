import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import apiClient from "../api/apiClient";
import PageShell from "../components/PageShell";
import PageCss from "../components/PageCss";

const messageOf = (err, fallback) => {
    const data = err.response && err.response.data;
    return (
        (data && data.errors && data.errors.map((e) => e.message || e).join(" ")) ||
        (data && data.message) ||
        fallback
    );
};

export default function ManageAdmins() {
    const token = sessionStorage.getItem("token");
    const role = sessionStorage.getItem("role");

    const [admins, setAdmins] = useState([]);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(true);
    const [reset, setReset] = useState(null); // { name, email, password }
    const [copied, setCopied] = useState(false);
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [saving, setSaving] = useState(false);

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
        setSuccess("");
        setCopied(false);

        try {
            const response = await apiClient.post(`/admins/${admin._id}/reset-password`);
            setReset({ name: admin.name, email: admin.email, password: response.data.temporaryPassword });
        } catch (err) {
            setError(messageOf(err, "Password reset failed"));
        }
    }

    async function renameAdmin(admin) {
        const name = window.prompt(
            `New display name for ${admin.email}\n(for example: Assistant Administrator)`,
            admin.name
        );
        if (name === null) return;

        setError("");
        setSuccess("");

        try {
            const response = await apiClient.put(`/admins/${admin._id}`, { name });
            const updated = response.data.admin;
            setAdmins((list) => list.map((a) => (a._id === admin._id ? { ...a, name: updated.name } : a)));
            setSuccess(`Name updated to "${updated.name}".`);

            if (admin.isCurrent) {
                try {
                    const me = JSON.parse(localStorage.getItem("loggedInAdmin"));
                    localStorage.setItem("loggedInAdmin", JSON.stringify({ ...me, name: updated.name, adminName: updated.name }));
                } catch { /* ignore */ }
            }
        } catch (err) {
            setError(messageOf(err, "Name could not be changed"));
        }
    }

    async function addAdmin(event) {
        event.preventDefault();
        setError("");
        setSuccess("");

        if (form.password.length < 12) {
            return setError("Password must contain at least 12 characters.");
        }

        setSaving(true);
        try {
            const response = await apiClient.post("/admins", form);
            setAdmins((list) => [...list, { ...response.data.admin, isCurrent: false }]);
            setSuccess(`Administrator "${response.data.admin.name}" created. Give them the email and password so they can log in.`);
            setForm({ name: "", email: "", password: "" });
        } catch (err) {
            setError(messageOf(err, "Administrator could not be created"));
        } finally {
            setSaving(false);
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
                                Add administrators, give each a clear name, and help one who forgot their password.
                                You cannot reset your own password here; use My Account for that.
                            </p>
                        </div>
                    </header>

                    {error && <p role="alert" style={styles.error}>{error}</p>}
                    {success && <p role="status" style={styles.success}>{success}</p>}

                    {reset && (
                        <section style={styles.notice} aria-live="polite">
                            <h2 style={styles.noticeTitle}>New password for {reset.name}</h2>
                            <p style={{ margin: "0 0 8px" }}>{reset.email}</p>
                            <p style={styles.password}>{reset.password}</p>
                            <p style={styles.hint}>
                                Give this password to that administrator privately. It is shown only once.
                                They should log in and change it under <strong>My Account</strong>.
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
                                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                                <button type="button" className="btn btn--sm" onClick={() => renameAdmin(a)}>
                                                    Rename
                                                </button>
                                                {!a.isCurrent && (
                                                    <button type="button" className="btn btn--sm" onClick={() => resetPassword(a)}>
                                                        Reset password
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <form onSubmit={addAdmin} style={styles.card}>
                        <h2 style={{ margin: "0 0 12px", fontSize: 18 }}>Add administrator</h2>
                        <div style={styles.field}>
                            <label htmlFor="newAdminName" style={styles.label}>Display name</label>
                            <input id="newAdminName" value={form.name} required maxLength={100}
                                placeholder="e.g. Assistant Administrator"
                                onChange={(e) => setForm({ ...form, name: e.target.value })} style={styles.input} />
                        </div>
                        <div style={styles.field}>
                            <label htmlFor="newAdminEmail" style={styles.label}>Email (used to log in)</label>
                            <input id="newAdminEmail" type="email" value={form.email} required
                                placeholder="assistant@edubloom.com"
                                onChange={(e) => setForm({ ...form, email: e.target.value })} style={styles.input} />
                        </div>
                        <div style={styles.field}>
                            <label htmlFor="newAdminPassword" style={styles.label}>Password (at least 12 characters)</label>
                            <input id="newAdminPassword" type="password" value={form.password} required minLength={12}
                                autoComplete="new-password"
                                onChange={(e) => setForm({ ...form, password: e.target.value })} style={styles.input} />
                        </div>
                        <button type="submit" className="btn btn--primary" disabled={saving}>
                            {saving ? "Creating…" : "Add administrator"}
                        </button>
                    </form>
                </div>
            </PageShell>
        </>
    );
}

const styles = {
    error: { color: "#b3261e", margin: "0 0 12px" },
    success: { color: "#1e7a46", margin: "0 0 12px" },
    notice: { background: "#eef7f1", border: "1px solid #b9dcc6", borderRadius: 12, padding: 20, marginBottom: 20 },
    noticeTitle: { margin: "0 0 4px", fontSize: 18 },
    password: { fontFamily: "monospace", fontSize: 24, letterSpacing: 1, margin: "8px 0", userSelect: "all" },
    hint: { margin: "0 0 12px", color: "#44554b" },
    table: { width: "100%", borderCollapse: "collapse", background: "#fff" },
    th: { textAlign: "left", padding: "10px 12px", borderBottom: "2px solid #dfe5e1", whiteSpace: "nowrap" },
    td: { padding: "10px 12px", borderBottom: "1px solid #e8ece9" },
    card: { maxWidth: 460, background: "#fff", border: "1px solid #e2e6e3", borderRadius: 12, padding: 24, marginTop: 24 },
    field: { position: "relative", marginBottom: 16 },
    label: { display: "block", fontWeight: 600, marginBottom: 6 },
    input: { width: "100%", padding: "10px 12px", border: "1px solid #cfd6d1", borderRadius: 8, font: "inherit", boxSizing: "border-box" }
};
