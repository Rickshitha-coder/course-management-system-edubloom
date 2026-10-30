// ===============================
// GET STUDENT + COURSE
// ===============================

const student =
JSON.parse(localStorage.getItem("loggedInStudent"));

if (!student) {
    window.location.href = "login.html";
}

const studentKey = student.email;

const urlParams = new URLSearchParams(window.location.search);
const courseTitle = urlParams.get("course") || "Course";

// Confirm the student actually completed this course before issuing one
const isCompleted =
    localStorage.getItem(studentKey + "_" + courseTitle + "_completed") === "true";

if (!isCompleted) {
    alert("You need to complete this course before viewing its certificate.");
    window.location.href = "my_courses.html";
}

// Use today's date unless a completion date was already stored
const completionDateKey = studentKey + "_" + courseTitle + "_completedDate";

let completionDate = localStorage.getItem(completionDateKey);

if (!completionDate) {
    completionDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
    localStorage.setItem(completionDateKey, completionDate);
}

const studentName =
    student.studentName || student.name || student.fullName || student.email.split("@")[0];

// ===============================
// DRAW CERTIFICATE ON CANVAS
// ===============================

const canvas = document.getElementById("certificateCanvas");
const ctx = canvas.getContext("2d");

const W = canvas.width;
const H = canvas.height;

function drawCertificate() {

    // Background (soft pastel blush)
    ctx.fillStyle = "#FFF6F9";
    ctx.fillRect(0, 0, W, H);

    // Soft pastel bands top/bottom (pink + mint)
    ctx.fillStyle = "#FFC1D9";
    ctx.fillRect(0, 0, W, 14);
    ctx.fillStyle = "#B9F2D9";
    ctx.fillRect(0, H - 14, W, 14);

    // Outer border (soft rounded-feel pink, no hard black)
    ctx.strokeStyle = "#F2678F";
    ctx.lineWidth = 8;
    ctx.strokeRect(25, 25, W - 50, H - 50);

    // Inner border (soft lavender)
    ctx.strokeStyle = "#C9B6F5";
    ctx.lineWidth = 3;
    ctx.strokeRect(45, 45, W - 90, H - 90);

    // Header
    ctx.fillStyle = "#C94E76";
    ctx.font = "bold 26px 'Quicksand', Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText("EduBloom", W / 2, 110);

    ctx.fillStyle = "#4A3B52";
    ctx.font = "bold 52px 'Quicksand', Georgia, serif";
    ctx.fillText("Certificate of Completion", W / 2, 200);

    ctx.strokeStyle = "#FFCB8E";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 180, 225);
    ctx.lineTo(W / 2 + 180, 225);
    ctx.stroke();

    // Subtitle
    ctx.font = "20px 'Nunito', Arial, sans-serif";
    ctx.fillStyle = "#8B7F94";
    ctx.fillText("This certificate is proudly presented to", W / 2, 300);

    // Student name
    ctx.font = "italic bold 46px 'Quicksand', Georgia, serif";
    ctx.fillStyle = "#F2678F";
    ctx.fillText(studentName, W / 2, 375);

    ctx.strokeStyle = "#F5DCE7";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 250, 395);
    ctx.lineTo(W / 2 + 250, 395);
    ctx.stroke();

    // Course line
    ctx.font = "20px 'Nunito', Arial, sans-serif";
    ctx.fillStyle = "#8B7F94";
    ctx.fillText("for successfully completing the course", W / 2, 445);

    ctx.font = "bold 34px 'Quicksand', Georgia, serif";
    ctx.fillStyle = "#4A3B52";
    ctx.fillText(courseTitle, W / 2, 500);

    // Date
    ctx.font = "18px 'Nunito', Arial, sans-serif";
    ctx.fillStyle = "#8B7F94";
    ctx.fillText("Completed on " + completionDate, W / 2, 560);

    // Signature area
    ctx.textAlign = "left";
    ctx.strokeStyle = "#4A3B52";
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(160, 730);
    ctx.lineTo(420, 730);
    ctx.stroke();
    ctx.font = "16px 'Nunito', Arial, sans-serif";
    ctx.fillStyle = "#4A3B52";
    ctx.fillText("Course Instructor", 160, 755);

    ctx.beginPath();
    ctx.moveTo(W - 420, 730);
    ctx.lineTo(W - 160, 730);
    ctx.stroke();
    ctx.textAlign = "right";
    ctx.fillText("Date Issued", W - 160, 755);

    // Seal
    ctx.textAlign = "center";
    ctx.beginPath();
    ctx.arc(W / 2, 700, 45, 0, Math.PI * 2);
    ctx.fillStyle = "#FFCB8E";
    ctx.fill();
    ctx.fillStyle = "#4A3B52";
    ctx.font = "bold 13px 'Nunito', Arial, sans-serif";
    ctx.fillText("VERIFIED", W / 2, 695);
    ctx.fillText("EDUBLOOM", W / 2, 710);

}

drawCertificate();

// ===============================
// DOWNLOAD AS IMAGE
// ===============================

document.getElementById("downloadBtn").addEventListener("click", function () {

    const link = document.createElement("a");
    link.download = courseTitle.replace(/\s+/g, "_") + "_Certificate.png";
    link.href = canvas.toDataURL("image/png");
    link.click();

});

// ===============================
// PRINT
// ===============================

document.getElementById("printBtn").addEventListener("click", function () {

    window.print();

});

// ===============================
// BACK
// ===============================

document.getElementById("backBtn").addEventListener("click", function () {

    window.location.href = "my_courses.html";

});

function logout() {

    localStorage.removeItem("loggedInStudent");

    alert("Logged Out Successfully.");

    window.location.href = "login.html";

}
document.getElementById("logoutBtn").addEventListener("click", logout);