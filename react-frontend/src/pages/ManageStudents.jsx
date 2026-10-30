import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import apiClient from "../api/apiClient";
import PageShell from "../components/PageShell";
import PageCss from "../components/PageCss";

export default function ManageStudents() {
    const token = sessionStorage.getItem("token");
    const role = sessionStorage.getItem("role");

    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [reset, setReset] = useState(null); // { name, email, password }
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!token || role !== "admin") return;
        apiClient
            .get("/students")
            .then((response) => setStudents(response.data.students))
            .catch(() => setError("Unable to load students"))
            .finally(() => setLoading(false));
    }, [token, role]);

    const visible = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return students;
        return students.filter((s) =>
            [s.name, s.email, s.studentId, s.department]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(term))
        );
    }, [students, search]);

    if (!token || role !== "admin") {
        return <Navigate to="/login" replace />;
    }

    async function resetPassword(student) {
        const ok = window.confirm(
            `Reset the password for ${student.name} (${student.email})?\n\n` +
            "A new temporary password will be created. The old password will stop working."
        );
        if (!ok) return;

        setError("");
        setCopied(false);

        try {
            const response = await apiClient.post(`/students/${student._id}/reset-password`);
            setReset({
                name: student.name,
                email: student.email,
                password: response.data.temporaryPassword
            });
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

    async function exportStudents() {
        setError("");
        try {
            const response = await apiClient.get("/students/export", { responseType: "blob" });
            const url = window.URL.createObjectURL(response.data);
            const link = document.createElement("a");
            link.href = url;
            link.download = "students.csv";
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch {
            setError("Export failed");
        }
    }

    return (
        <>
            <PageCss href="/css/my_courses.css" />
            <PageShell
                variant="admin"
                active="students"
                footer="standard"
                crumbs={[{ label: "Dashboard", to: "/admin-dashboard" }, { label: "Manage Students" }]}
            >
                <div className="page">
                    <header className="page-head">
                        <div className="page-head__text">
                            <h1>Manage Students</h1>
                            <p className="page-head__sub">
                                Reset a forgotten password or download the student list.
                            </p>
                        </div>
                        <button type="button" className="btn btn--primary" onClick={exportStudents}>
                            Export students (CSV)
                        </button>
                    </header>

                    {error && <p role="alert" style={styles.error}>{error}</p>}

                    {reset && (
                        <section style={styles.notice} aria-live="polite">
                            <h2 style={styles.noticeTitle}>New password for {reset.name}</h2>
                            <p style={{ margin: "0 0 8px" }}>{reset.email}</p>
                            <p style={styles.password}>{reset.password}</p>
                            <p style={styles.hint}>
                                Give this password to the student (in person, by phone or by message).
                                It is shown only once and is not stored anywhere in readable form.
                                Ask them to log in and change it under <strong>Change Password</strong>.
                            </p>
                            <div style={{ display: "flex", gap: 8 }}>
                                <button type="button" className="btn btn--primary" onClick={copyPassword}>
                                    {copied ? "Copied" : "Copy password"}
                                </button>
                                <button type="button" className="btn" onClick={() => setReset(null)}>
                                    Done
                                </button>
                            </div>
                        </section>
                    )}

                    <input
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name, email, student ID or department"
                        aria-label="Search students"
                        style={styles.search}
                    />

                    <div style={{ overflowX: "auto" }}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    {["Name", "Email", "Student ID", "Department", "Action"].map((h) => (
                                        <th key={h} style={styles.th}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {loading && (
                                    <tr><td style={styles.td} colSpan={5}>Loading…</td></tr>
                                )}
                                {!loading && visible.length === 0 && (
                                    <tr><td style={styles.td} colSpan={5}>No students found.</td></tr>
                                )}
                                {visible.map((s) => (
                                    <tr key={s._id}>
                                        <td style={styles.td}>{s.name}</td>
                                        <td style={styles.td}>{s.email}</td>
                                        <td style={styles.td}>{s.studentId || "-"}</td>
                                        <td style={styles.td}>{s.department || "-"}</td>
                                        <td style={styles.td}>
                                            <button type="button" className="btn btn--sm" onClick={() => resetPassword(s)}>
                                                Reset password
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
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
    search: { width: "100%", padding: "10px 12px", border: "1px solid #cfd6d1", borderRadius: 8, marginBottom: 16, font: "inherit" },
    table: { width: "100%", borderCollapse: "collapse", background: "#fff" },
    th: { textAlign: "left", padding: "10px 12px", borderBottom: "2px solid #dfe5e1", whiteSpace: "nowrap" },
    td: { padding: "10px 12px", borderBottom: "1px solid #e8ece9" }
};
