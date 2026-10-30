/*
 * Saves the student's course enrollments and learning progress to MongoDB.
 *
 * The existing pages keep their data in the browser (localStorage). This script
 * watches those writes and mirrors them to the API:
 *   "<email>_enrolledCourses"      -> POST /enrollments
 *   "<email>_<course>_progress"    -> PUT  /progress/:courseId
 * It also copies anything already stored in the browser once per login session.
 */
(function () {
    var API = String(window.__API_URL__ || "http://localhost:3001/api/v1").replace(/\/+$/, "");
    var courseCache = null;
    var timers = {};

    function token() {
        try { return sessionStorage.getItem("token"); } catch (e) { return null; }
    }

    function student() {
        try {
            if (sessionStorage.getItem("role") !== "student") return null;
            return JSON.parse(localStorage.getItem("loggedInStudent"));
        } catch (e) { return null; }
    }

    function call(method, path, body) {
        var options = {
            method: method,
            headers: { "Content-Type": "application/json", Authorization: "Bearer " + token() }
        };
        if (body !== undefined) options.body = JSON.stringify(body);
        return window.fetch(API + path, options);
    }

    function loadCourses() {
        if (courseCache) return courseCache;
        courseCache = window.fetch(API + "/courses?limit=100")
            .then(function (r) { return r.json(); })
            .then(function (d) { return d.courses || []; })
            .catch(function () { courseCache = null; return []; });
        return courseCache;
    }

    function findCourseId(title) {
        var wanted = String(title || "").trim().toLowerCase();
        return loadCourses().then(function (courses) {
            for (var i = 0; i < courses.length; i++) {
                var c = courses[i];
                if (String(c.courseName || "").trim().toLowerCase() === wanted ||
                    String(c.courseCode || "").trim().toLowerCase() === wanted) {
                    return c.id;
                }
            }
            return null;
        });
    }

    function enroll(title) {
        return findCourseId(title).then(function (courseId) {
            if (!courseId) return null;
            return call("POST", "/enrollments", { courseId: courseId })
                .then(function () { return courseId; }); // 409 = already enrolled: fine
        });
    }

    function saveProgress(title, percent, total) {
        total = Math.max(1, parseInt(total, 10) || 1);
        percent = Math.min(100, Math.max(0, Number(percent) || 0));
        var done = Math.min(total, Math.max(0, Math.round((percent / 100) * total)));

        return enroll(title).then(function (courseId) {
            if (!courseId) return;
            return call("PUT", "/progress/" + courseId, {
                completedLessons: done,
                totalLessons: total
            });
        });
    }

    function syncEnrolled(list) {
        (list || []).forEach(function (course) {
            if (course && course.title) enroll(course.title).catch(function () {});
        });
    }

    function scheduleProgress(title, prefix) {
        clearTimeout(timers[title]);
        timers[title] = setTimeout(function () {
            var pct = localStorage.getItem(prefix + title + "_progress");
            var total = localStorage.getItem(prefix + title + "_totalVideos");
            saveProgress(title, pct, total).catch(function () {});
        }, 400);
    }

    function onWrite(key) {
        var s = student();
        if (!s || !token() || !s.email) return;
        var prefix = s.email + "_";

        if (key === prefix + "enrolledCourses") {
            try { syncEnrolled(JSON.parse(localStorage.getItem(key))); } catch (e) {}
        } else if (key.indexOf(prefix) === 0 && /_progress$/.test(key)) {
            scheduleProgress(key.slice(prefix.length, -"_progress".length), prefix);
        }
    }

    var nativeSet = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key) {
        nativeSet.apply(this, arguments);
        if (this === window.localStorage) {
            try { onWrite(String(key)); } catch (e) {}
        }
    };

    // Copy data already stored in this browser to the database (once per login)
    function catchUp() {
        var s = student();
        if (!s || !token() || !s.email) return;
        try {
            if (sessionStorage.getItem("dbSyncDone") === s.email) return;
            sessionStorage.setItem("dbSyncDone", s.email);
        } catch (e) { return; }

        var prefix = s.email + "_";
        try { syncEnrolled(JSON.parse(localStorage.getItem(prefix + "enrolledCourses"))); } catch (e) {}

        for (var i = 0; i < localStorage.length; i++) {
            var key = localStorage.key(i);
            if (key && key.indexOf(prefix) === 0 && /_progress$/.test(key)) {
                scheduleProgress(key.slice(prefix.length, -"_progress".length), prefix);
            }
        }
    }

    window.addEventListener("load", function () { setTimeout(catchUp, 800); });
})();
