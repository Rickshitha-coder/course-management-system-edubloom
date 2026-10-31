/*
 * Compatibility layer for the existing page scripts.
 *
 * They call "http://localhost:3001/api/courses" and expect a bare array / bare
 * course object. The Express API now lives at <API_URL>/courses, requires a JWT
 * for admin writes and wraps data as { courses } / { course }. This shim
 * rewrites those calls, adds the Authorization header, and unwraps the reply so
 * the page scripts keep working unchanged.
 */
(function () {
    var base = window.__API_URL__;
    if (!base || String(base).indexOf("%") !== -1) {
        base = "http://localhost:3001/api/v1";
    }
    window.__API_URL__ = String(base).replace(/\/+$/, "");

    // Old pages also "save to server" with http://localhost:3001/api/<anything else>.
    // That server no longer exists, and a live website must never call the
    // visitor's own computer, so those calls are answered locally and ignored.
    // Repair saved enrollment lists that contain empty (null) entries
    try {
        for (var i = 0; i < localStorage.length; i++) {
            var k = localStorage.key(i);
            if (k && /(^|_)enrolledCourses$/.test(k)) {
                var list = JSON.parse(localStorage.getItem(k));
                if (Array.isArray(list)) {
                    var clean = list.filter(function (c) { return c && typeof c === "object"; });
                    if (clean.length !== list.length) {
                        localStorage.setItem(k, JSON.stringify(clean));
                    }
                }
            }
        }
    } catch (e) {}

    // ---- Admin pages: load the REAL students and enrollments from the database ----
    function authHeaders() {
        var t = null;
        try { t = sessionStorage.getItem("token"); } catch (e) {}
        return t ? { Authorization: "Bearer " + t } : {};
    }

    window.__loadAdminData = function () {
        var isAdmin = false;
        try { isAdmin = sessionStorage.getItem("role") === "admin"; } catch (e) {}
        if (!isAdmin) return Promise.resolve();

        var nativeGet = function (path) {
            return window.fetch(window.__API_URL__ + path, { headers: authHeaders() });
        };

        return Promise.all([nativeGet("/students"), nativeGet("/enrollments")])
            .then(function (res) {
                var jobs = [];

                if (res[0].ok) {
                    jobs.push(res[0].json().then(function (data) {
                        var old = [];
                        try { old = JSON.parse(localStorage.getItem("students")) || []; } catch (e) {}
                        var list = (data.students || []).map(function (u) {
                            var previous = old.find(function (o) { return o && o.email === u.email; }) || {};
                            return Object.assign({}, previous, {
                                id: u._id, studentName: u.name, name: u.name, email: u.email,
                                studentId: u.studentId || "", department: u.department || "", role: "Student"
                            });
                        });
                        localStorage.setItem("students", JSON.stringify(list));
                    }));
                }

                if (res[1].ok) {
                    jobs.push(res[1].json().then(function (data) {
                        var list = (data.enrollments || []).map(function (x) {
                            var courseName = (x.course && x.course.courseName) || "Course";
                            return {
                                apiId: x._id,
                                student: (x.student && x.student.name) || "Student",
                                studentEmail: x.student && x.student.email,
                                title: courseName,
                                course: courseName,
                                courseKey: x.course && x.course._id,
                                enrollDate: x.enrolledAt ? new Date(x.enrolledAt).toLocaleDateString() : "-",
                                status: x.approvalStatus || "Pending",
                                completed: x.status === "completed"
                            };
                        });
                        localStorage.setItem("enrolledCourses", JSON.stringify(list));
                    }));
                }

                return Promise.all(jobs);
            })
            .catch(function () {});
    };

    // Save the administrator's Approve / Reject decision in the database
    window.__saveApproval = function (record, approvalStatus) {
        if (!record || !record.apiId) return Promise.resolve();
        var headers = authHeaders();
        headers["Content-Type"] = "application/json";
        return window.fetch(window.__API_URL__ + "/enrollments/" + record.apiId + "/approval", {
            method: "PUT",
            headers: headers,
            body: JSON.stringify({ approvalStatus: approvalStatus })
        }).catch(function () {});
    };

    var LEGACY_OTHER = /^https?:\/\/localhost:3001\/api\/(?!v1\/|courses(?:[\/?#]|$))/;

    var LEGACY_COURSES = /^https?:\/\/[^\/]+\/api\/courses(\/[^?#\/]+)?(\?[^#]*)?$/;
    var nativeFetch = window.fetch.bind(window);

    window.fetch = function (input, init) {
        var url = typeof input === "string" ? input : input && input.url;
        var match = typeof url === "string" ? url.match(LEGACY_COURSES) : null;

        if (typeof url === "string" && LEGACY_OTHER.test(url)) {
            return Promise.resolve(new Response("{}", {
                status: 200,
                headers: { "Content-Type": "application/json" }
            }));
        }

        if (!match) {
            return nativeFetch(input, init);
        }

        var options = Object.assign({}, init);
        var headers = new Headers(options.headers || {});
        var token = null;
        try { token = sessionStorage.getItem("token"); } catch (e) {}
        if (token) headers.set("Authorization", "Bearer " + token);
        options.headers = headers;

        var method = (options.method || "GET").toUpperCase();
        var isList = !match[1];
        var target = window.__API_URL__ + "/courses" + (match[1] || "") + (match[2] || "");

        return nativeFetch(target, options).then(function (response) {
            if (!response.ok || method === "DELETE") return response;

            return response.json().then(function (data) {
                var body = isList && method === "GET" ? data.courses : data.course;
                return new Response(JSON.stringify(body === undefined ? data : body), {
                    status: response.status,
                    headers: { "Content-Type": "application/json" }
                });
            });
        });
    };

    // Logout button on EVERY page: end the session, then go to the login page.
    // (Some pages also have their own logout code; both doing the same job is harmless.)
    document.addEventListener("click", function (event) {
        var target = event.target;
        if (!target || !target.closest || !target.closest("#logoutBtn")) return;

        try {
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("role");
            sessionStorage.removeItem("dbSyncDone");
            localStorage.removeItem("loggedInStudent");
            localStorage.removeItem("loggedInAdmin");
        } catch (e) {}

        setTimeout(function () {
            if (location.pathname !== "/login" && location.pathname !== "/login.html") {
                location.href = "/login";
            }
        }, 100);
    }, true);
})();
