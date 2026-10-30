/*
 * Adds a show/hide ("eye") button to every password box on every page,
 * including pages that React draws after the script loads.
 */
(function () {
    var EYE = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
    var EYE_OFF = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.9 17.9A10.9 10.9 0 0 1 12 19c-6.4 0-10-7-10-7a18.7 18.7 0 0 1 5.1-5.9"></path><path d="M9.9 4.2A10.4 10.4 0 0 1 12 4c6.4 0 10 7 10 7a18.5 18.5 0 0 1-2.2 3.2"></path><path d="M14.1 14.1A3 3 0 1 1 9.9 9.9"></path><path d="M1 1l22 22"></path></svg>';

    function place(button, input) {
        var parent = input.offsetParent || input.parentElement;
        var top = input.offsetTop + input.offsetHeight / 2;
        button.style.top = top + "px";
        button.style.right = "10px";
        button.style.display = input.offsetHeight ? "flex" : "none";
        return parent;
    }

    function enhance(input) {
        if (input.dataset.eye === "1") return;
        input.dataset.eye = "1";

        var parent = input.parentElement;
        if (!parent) return;
        if (window.getComputedStyle(parent).position === "static") {
            parent.style.position = "relative";
        }

        input.style.paddingRight = "44px";

        var button = document.createElement("button");
        button.type = "button";
        button.setAttribute("aria-label", "Show password");
        button.setAttribute("aria-pressed", "false");
        button.innerHTML = EYE;
        button.style.cssText =
            "position:absolute;transform:translateY(-50%);width:32px;height:32px;" +
            "align-items:center;justify-content:center;border:0;background:transparent;" +
            "color:#5b6b61;cursor:pointer;padding:0;border-radius:6px;z-index:2;";

        button.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            var show = input.type === "password";
            input.type = show ? "text" : "password";
            button.innerHTML = show ? EYE_OFF : EYE;
            button.setAttribute("aria-label", show ? "Hide password" : "Show password");
            button.setAttribute("aria-pressed", show ? "true" : "false");
            input.focus();
        });

        input.insertAdjacentElement("afterend", button);
        place(button, input);

        window.addEventListener("resize", function () { place(button, input); });
        setTimeout(function () { place(button, input); }, 300);
    }

    function scan() {
        var inputs = document.querySelectorAll('input[type="password"]');
        for (var i = 0; i < inputs.length; i++) enhance(inputs[i]);
    }

    function start() {
        scan();
        new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
    }

    if (document.body) start();
    else document.addEventListener("DOMContentLoaded", start);
})();
