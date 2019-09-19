var params = new URLSearchParams(window.location.search);

window.onload = function() {
    var action = window.location.pathname.replace("/", "");
    setupConsentForm(action);
    setupLoginPage(action);
    setupUpdatePage(action);
    setupRegistrationPage(action);
};

function startSubmitting (obj) {
    obj.prop("disabled", true);

    obj.html(
        `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>`
    );
}

function finishSubmitting (obj, text) {
    obj.prop("disabled", false);
    obj.html(text ? text : "Submit");
}

function notify (type, text) {
    var id = "#notification";
    var notificationTimeOut = 5000; // 5s

    $(id).html(text);
    $(id).attr("hidden", false);
    $(id).removeClass().addClass("alert alert-" + type);

    setTimeout(function(){
        $(id).attr("hidden", true)
    }, notificationTimeOut);
}

function notifyError (text) {
    notify("danger", text)
}

function notifySuccess (text) {
    notify("success", text)
}

function setupLoginPage(action) {
    if (action !== "login") {
        return;
    }

    var username = params.get("username");
    var firstLogin = params.get("first_login");

    if (username) {
        document.getElementById("login-username").value = username;
    }

    if (firstLogin) {
        notifySuccess("Whisper credential created successfully!")
    }

    $('#login-submit').on('click', function(event) {
        event.preventDefault();

        var $this = $(this);
        var request = {
            username: $("#login-username").val(),
            password: $("#login-password").val(),
            remember: $("#login-remember").is(":checked"),
            challenge: params.get("login_challenge")
        };

        if (!request.username) {
            notifyError("Username is missing");
            return;
        }

        if (!request.password) {
            notifyError("Password is missing");
            return;
        }

        if (!request.challenge) {
            notifyError("Challenge is missing");
            return;
        }

        startSubmitting($this);

        $.ajax({
            url: "/login",
            type: "POST",
            data: JSON.stringify(request),
            contentType: "application/json",
            success: function(data, status, xhr) {
                finishSubmitting($this);
                window.location = data.redirect_to;
            },
            error: function(xhr, status, error) {
                finishSubmitting($this);
                notifyError(xhr.responseText);
            }
        })
    })
}

function setupConsentForm(action) {
    if (action !== "consent") {
        return;
    }

    function consent (answer) {
        return function (event) {
            event.preventDefault();

            var $this = $(this);
            var buttonText = answer ? "Allow" : "Deny";
            var request = {
                accept: answer,
                challenge: params.get("consent_challenge"),
                grantScope: $(".consent-grant-scope").toArray().map(function (item) { return item.value; }),
                remember: true
            };

            if (!request.challenge) {
                notifyError("Challenge is missing");
                return;
            }

            if (!request.grantScope) {
                notifyError("Grant Scopes are missing");
                return;
            }

            startSubmitting($this);

            $.ajax({
                url: "/consent",
                type: "POST",
                data: JSON.stringify(request),
                contentType: "application/json",
                success: function (data, status, xhr) {
                    finishSubmitting($this, buttonText);
                    window.location = data.redirect_to;
                },
                error: function (xhr, status, error) {
                    finishSubmitting($this, buttonText);
                    notifyError(xhr.responseText);
                }
            });
        }
    }

    $('#consent-allow').on('click', consent(true));
    $('#consent-deny').on('click', consent(false));
}

function setupUpdatePage(action) {
    if (action !== "secure/update") {
        return;
    }

    $('#update-submit').on('click', function(event) {
        event.preventDefault();

        var $this = $(this);
        var request = {
            email: $("#update-email").val(),
            newPassword: $("#update-new-password").val(),
            newPasswordConfirmation: $("#update-new-password-confirmation").val(),
            oldPassword: $("#update-old-password").val()
        };

        if (!request.email) {
            notifyError("Email is missing");
            return;
        }

        if (!request.newPassword) {
            notifyError("Invalid new password");
            return;
        }

        if (!request.oldPassword) {
            notifyError("Invalid old password");
            return;
        }

        if (request.newPassword !== request.newPasswordConfirmation) {
            notifyError("Invalid password confirmation");
            return;
        }

        if (!request.grantScope) {
            notifyError("Grant Scopes are missing");
            return;
        }

        startSubmitting($this);

        $.ajax({
            url: "/secure/update",
            type: "PUT",
            data: JSON.stringify(request),
            contentType: "application/json",
            headers: {
                "Authorization": "Bearer " + params.get("token")
            },
            success: function(data, status, xhr) {
                finishSubmitting($this);
                window.location = params.get("redirect_to");
            },
            error: function(xhr, status, error) {
                finishSubmitting($this);
                notifyError(xhr.responseText);
            }
        })
    })
}

function setupRegistrationPage(action) {
    if (action !== "registration") {
        return;
    }

    $('#registration-submit').on('click', function(event) {
        event.preventDefault();

        var $this = $(this);
        var request = {
            username: $("#registration-username").val(),
            email: $("#registration-email").val(),
            password: $("#registration-password").val(),
            passwordConfirmation: $("#registration-password-confirmation").val()
        };

        if (!request.username) {
            notifyError("Username is missing");
            return;
        }

        if (!request.email) {
            notifyError("Email is missing");
            return;
        }

        if (!request.password) {
            notifyError("Password is missing");
            return;
        }

        if (request.password !== request.passwordConfirmation) {
            notifyError("Invalid password confirmation");
            return;
        }

        startSubmitting($this);

        $.ajax({
            url: "/registration",
            type: "POST",
            data: JSON.stringify(request),
            contentType: "application/json",
            success: function(data, status, xhr) {
                finishSubmitting($(this));
                window.location = "/login?first_login=true&username="+$("#registration-username").val()+"&login_challenge="+$("#login-challenge").val();
            },
            error: function(xhr, status, error) {
                finishSubmitting($this);
                notifyError(xhr.responseText);
            }
        })
    })
}