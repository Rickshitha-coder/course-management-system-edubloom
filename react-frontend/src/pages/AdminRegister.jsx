import { Link } from "react-router-dom";
import PageCss from "../components/PageCss";

export default function AdminRegister() {
    return (
        <>
            <PageCss href="/css/admin_register.css" />
            <div className="auth">
                <aside className="auth__brand">
                    <Link to="/" className="logo logo--light" aria-label="EduBloom home">
                        <span className="logo__mark" aria-hidden="true">
                            <svg viewBox="0 0 32 32" focusable="false">
                                <rect className="mark__bg" width="32" height="32" rx="8"></rect>
                                <path className="mark__stem" d="M16 26V16.5" fill="none" strokeWidth="2" strokeLinecap="round"></path>
                                <path className="mark__leaf" d="M16 16.5c0-4.9 3.5-8.5 9.5-8.5 0 5.5-3.5 8.5-9.5 8.5z"></path>
                                <path className="mark__leaf mark__leaf--soft" d="M16 20c0-3.8-2.7-6.5-7.8-6.5 0 4.2 2.7 6.5 7.8 6.5z"></path>
                            </svg>
                        </span>
                        <span className="logo__word">EduBloom</span>
                    </Link>
                    <div className="auth__pitch">
                        <p className="auth__tagline">Learn, Grow, Achieve</p>
                        <ul className="auth__points">
                            <li>
                                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <path d="m9 12 2 2 4-4"></path>
                                </svg>
                                <span>Browse and enroll in available courses</span>
                            </li>
                            <li>
                                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <path d="m9 12 2 2 4-4"></path>
                                </svg>
                                <span>Track completed and pending modules</span>
                            </li>
                            <li>
                                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <path d="m9 12 2 2 4-4"></path>
                                </svg>
                                <span>Download a certificate when you finish</span>
                            </li>
                        </ul>
                    </div>
                    <svg className="auth__leaf" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
                        <path d="M100 196V104" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round"></path>
                        <path d="M100 104C100 48 142 8 198 8 198 68 156 104 100 104Z" fill="currentColor"></path>
                        <path d="M100 140C100 96 66 62 10 62 10 110 44 140 100 140Z" fill="currentColor" fillOpacity=".6"></path>
                    </svg>
                </aside>
                <main className="auth__panel" id="main">
                    <div className="auth__card auth__card--wide">
                        <Link to="/" className="back-link">
                            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                                <path d="m12 19-7-7 7-7"></path>
                                <path d="M19 12H5"></path>
                            </svg>
                            <span>Back to Home</span>
                        </Link>
                        <p className="auth__crumb">Login Portal</p>
                        <h1 className="auth__title">Administrator Registration</h1>
                        <div role="note" style={{ background: "#eef7f1", border: "1px solid #b9dcc6", borderRadius: 12, padding: 16, margin: "0 0 20px" }}>
                            <p style={{ margin: "0 0 8px", fontWeight: 600 }}>Administrator accounts are created by an existing administrator.</p>
                            <ol style={{ margin: 0, paddingLeft: 20 }}>
                                <li>An administrator logs in.</li>
                                <li>They open <strong>Manage Admins</strong> and use <strong>Add administrator</strong>.</li>
                                <li>The new administrator then logs in with the email and password they were given.</li>
                            </ol>
                        </div>
                        <p className="auth__alt">
                            Already have an account?{" "}
                            <Link to="/login" className="text-link">Login Here</Link>
                        </p>
                    </div>
                </main>
            </div>

        </>
    );
}
